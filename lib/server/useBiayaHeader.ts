import { AxiosError } from 'axios';
import { useDispatch } from 'react-redux';
import { useToast } from '@/hooks/use-toast';
import { useAlert } from '../store/client/useAlert';
import { useFormError } from '../hooks/formErrorContext';
import { IErrorResponse } from '../types/biayaheader.type';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  setProcessed,
  setProcessing
} from '../store/loadingSlice/loadingSlice';
import {
  deleteBiayaHeaderFn,
  getAllBiayaHeaderFn,
  getBiayaMuatanDetailFn,
  storeBiayaHeaderFn,
  updateBiayaHeaderFn
} from '../apis/biayaheader.api';

export const useGetAllBiayaHeader = (
  filters: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: string;
    filters?: {
      nobukti?: string;
      tglbukti?: string;
      jenisorder_text?: string;
      biayaemkl_text?: string;
      keterangan?: string;
      noinvoice?: string;
      relasi_text?: string;
      dibayarke_text?: string;
      biayaextra_nobukti?: string;
      modifiedby?: string;
      created_at?: string;
      updated_at?: string;
      tglDari?: string | null;
      tglSampai?: string | null;
    };
  } = {},
  signal?: AbortSignal
) => {
  const dispatch = useDispatch();

  return useQuery(
    ['biayaheader', filters],
    async () => {
      // Only trigger processing if the page is 1
      if (filters.page === 1) {
        dispatch(setProcessing());
      }

      try {
        const data = await getAllBiayaHeaderFn(filters, signal);
        return data;
      } catch (error) {
        // Show error toast and dispatch processed
        dispatch(setProcessed());
        throw error;
      } finally {
        // Regardless of success or failure, we dispatch setProcessed after the query finishes
        dispatch(setProcessed());
      }
    },
    {
      enabled: !signal?.aborted
    }
  );
};

export const useGetBiayaMuatanDetail = (
  id?: number,
  filters: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: string;
    filters?: {
      nobukti?: string;
      orderanmuatan_nobukti?: string;
      estimasi?: string;
      nominal?: string;
      keterangan?: string;
      biayaextra_nobukti?: string;
    };
  } = {},
  signal?: AbortSignal
) => {
  return useQuery(
    ['biayaheader', id, filters],
    async () => await getBiayaMuatanDetailFn(id!, filters),
    {
      enabled: !!id || !signal?.aborted
    }
  );
};

export const useCreateBiayaHeader = () => {
  const { setError } = useFormError(); // Mengambil setError dari context
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { toast } = useToast();

  return useMutation(storeBiayaHeaderFn, {
    // before the mutation fn runs
    onMutate: () => {
      dispatch(setProcessing());
    },
    onSuccess: () => {
      // on success, invalidate + clear loading
      void queryClient.invalidateQueries(['biayaheader']);
      dispatch(setProcessed());
    },
    onError: (error: AxiosError) => {
      // on error, clear loading
      const err = (error.response?.data as IErrorResponse) ?? {};

      if (err !== undefined) {
        const errorFields = Array.isArray(err.message) ? err.message : [];
        if (err.statusCode === 400) {
          // Iterasi error message dan set error di form
          errorFields?.forEach((err: { path: string[]; message: string }) => {
            const path = err.path[0]; // Ambil path error pertama (misalnya 'nama', 'akuntansi_id')
            setError(path, err.message); // Update error di context
          });
        } else {
          toast({
            variant: 'destructive',
            title: err.message ?? 'Gagal',
            description: 'Terjadi masalah dengan permintaan Anda'
          });
        }
      }
      dispatch(setProcessed());
    },
    onSettled: () => {
      dispatch(setProcessed());
    }
  });
};

export const useUpdateBiayaHeader = () => {
  const { setError } = useFormError(); // Mengambil setError dari context
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { toast } = useToast();

  return useMutation(updateBiayaHeaderFn, {
    onMutate: () => {
      dispatch(setProcessing());
    },
    onSuccess: () => {
      void queryClient.invalidateQueries('biayaheader');
      dispatch(setProcessed());
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;

      if (errorResponse !== undefined) {
        const errorFields = Array.isArray(errorResponse.message)
          ? errorResponse.message
          : [];

        if (errorResponse.statusCode === 400) {
          errorFields?.forEach((err: { path: string[]; message: string }) => {
            const path = err.path[0];
            setError(path, err.message);
          });
        } else {
          toast({
            variant: 'destructive',
            title: errorResponse.message ?? 'Gagal',
            description: 'Terjadi masalah dengan permintaan Anda'
          });
        }
      }
    },
    onSettled: () => {
      dispatch(setProcessed());
    }
  });
};

export const useDeleteBiayaHeader = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteBiayaHeaderFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('biayaheader');
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;
      if (errorResponse !== undefined) {
        toast({
          variant: 'destructive',
          title: errorResponse.message ?? 'Gagal',
          description: 'Terjadi masalah dengan permintaan Anda'
        });
      }
    }
  });
};
