import { AxiosError } from 'axios';
import { useDispatch } from 'react-redux';
import { useToast } from '@/hooks/use-toast';
import { useAlert } from '../store/client/useAlert';
import { IErrorResponse } from '../types/blheader.type';
import { useFormError } from '../hooks/formErrorContext';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  setProcessed,
  setProcessing
} from '../store/loadingSlice/loadingSlice';
import {
  deleteBiayaExtraHeaderFn,
  getAllBiayaExtraHeaderFn,
  getBiayaExtraBongkaranDetailFn,
  getBiayaExtraMuatanDetailFn,
  storeBiayaExtraHeaderFn,
  updateBiayaExtraHeaderFn
} from '../apis/biayaextraheader.api';

export const useGetAllBiayaExtraHeader = (
  filters: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: string;
    filters?: {
      tglbukti?: string;
      nobukti?: string;
      jenisorder_text?: string;
      biayaemkl_text?: string;
      keterangan?: string;
      modifiedby?: string;
      created_at?: string;
      updated_at?: string;
      tglDari?: string | null;
      tglSampai?: string | null;
    };
  } = {},
  signal?: AbortSignal
) => {
  return useQuery(
    ['biayaextraheader', filters],
    async () => await getAllBiayaExtraHeaderFn(filters, signal),
    {
      enabled: !signal?.aborted
    }
  );
};

export const useGetBiayaExtraMuatanDetail = (
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
      statustagih_text?: string;
      nominaltagih?: string;
      keterangan?: string;
      groupbiayaextra_text?: string;
    };
  } = {},
  signal?: AbortSignal
) => {
  return useQuery(
    ['biayaextraheader', id, filters],
    async () => await getBiayaExtraMuatanDetailFn(id!, filters),
    {
      enabled: !!id || !signal?.aborted // Hanya aktifkan query jika tab aktif adalah "pengalamankerja"
    }
  );
};

export const useGetBiayaExtraBongkaranDetail = (
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
      statustagih_text?: string;
      nominaltagih?: string;
      keterangan?: string;
      groupbiayaextra_text?: string;
    };
  } = {},
  signal?: AbortSignal
) => {
  return useQuery(
    ['biayaextraheader', id, filters],
    async () => await getBiayaExtraBongkaranDetailFn(id!, filters),
    {
      enabled: !!id || !signal?.aborted // Hanya aktifkan query jika tab aktif adalah "pengalamankerja"
    }
  );
};

export const useCreateBiayaExtraHeader = () => {
  const { setError } = useFormError(); // Mengambil setError dari context
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { toast } = useToast();

  return useMutation(storeBiayaExtraHeaderFn, {
    // before the mutation fn runs
    onMutate: () => {
      dispatch(setProcessing());
    },
    onSuccess: () => {
      // on success, invalidate + clear loading
      void queryClient.invalidateQueries(['biayaextraheader']);
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

export const useUpdateBiayaExtraHeader = () => {
  const { setError } = useFormError(); // Mengambil setError dari context
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { toast } = useToast();

  return useMutation(updateBiayaExtraHeaderFn, {
    onMutate: () => {
      dispatch(setProcessing());
    },
    onSuccess: () => {
      void queryClient.invalidateQueries('biayaextraheader');
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

export const useDeleteBiayaExtraHeader = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteBiayaExtraHeaderFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('biayaextraheader');
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
