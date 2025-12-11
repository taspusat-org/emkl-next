import { AxiosError } from 'axios';
import { useDispatch } from 'react-redux';
import { useToast } from '@/hooks/use-toast';
import { useAlert } from '../store/client/useAlert';
import { useFormError } from '../hooks/formErrorContext';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  setProcessed,
  setProcessing
} from '../store/loadingSlice/loadingSlice';
import {
  deleteEstimasiBiayaHeaderFn,
  getAllEstimasiBiayaHeaderFn,
  getEstimasiBiayaDetailBiayaFn,
  getEstimasiBiayaDetailInvoiceFn,
  storeEstimasiBiayaHeaderFn,
  updateEstimasiBiayaHeaderFn
} from '../apis/estimasibiayaheader.api';
import { IErrorResponse } from '../types/estimasibiayaheader.type';

export const useGetAllEstimasiBiayaHeader = (
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
      orderan_nobukti?: string;
      nominal?: string;
      shipper_text?: string;
      statusppn_text?: string;
      asuransi_text?: string;
      comodity_text?: string;
      consignee_text?: string;
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
    ['estimasibiaya', filters],
    async () => {
      // Only trigger processing if the page is 1
      if (filters.page === 1) {
        dispatch(setProcessing());
      }

      try {
        const data = await getAllEstimasiBiayaHeaderFn(filters, signal);
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

export const useGetEstimasiBiayaDetailBiaya = (
  id?: number,
  activeTab?: string,
  tabFormValues?: string,
  filters: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: string;
    filters?: {
      nobukti?: string;
      biayaemkl_text?: string;
      nominal?: string;
      nilaiasuransi?: string;
      nominaldisc?: string;
      nominalsebelumdisc?: string;
      nominaltradoluar?: string;
    };
  } = {},
  signal?: AbortSignal
) => {
  return useQuery(
    ['estimasibiaya', id, 'detail-biaya', filters],
    async () => await getEstimasiBiayaDetailBiayaFn(id!, filters),
    {
      enabled:
        !!id ||
        !signal?.aborted ||
        activeTab === 'detailbiaya' ||
        tabFormValues === 'detailbiaya' // Hanya aktifkan query jika tab aktif adalah "pengalamankerja"
    }
  );
};

export const useGetEstimasiBiayaDetailInvoice = (
  id?: number,
  activeTab?: string,
  tabFormValues?: string,
  filters: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: string;
    filters?: {
      nobukti?: string;
      biayaemkl_text?: string;
      link_text?: string;
      nominal?: string;
    };
  } = {},
  signal?: AbortSignal
) => {
  return useQuery(
    ['estimasibiaya', id, 'detail-invoice', filters],
    async () => await getEstimasiBiayaDetailInvoiceFn(id!, filters),
    {
      enabled:
        !!id ||
        !signal?.aborted ||
        activeTab === 'detailinvoice' ||
        tabFormValues === 'detailinvoice' // Hanya aktifkan query jika tab aktif adalah "pengalamankerja"
    }
  );
};

export const useCreateEstimasiBiayaHeader = () => {
  const { setError } = useFormError(); // Mengambil setError dari context
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { toast } = useToast();

  return useMutation(storeEstimasiBiayaHeaderFn, {
    // before the mutation fn runs
    onMutate: () => {
      dispatch(setProcessing());
    },
    onSuccess: () => {
      // on success, invalidate + clear loading
      void queryClient.invalidateQueries(['estimasibiaya']);
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

export const useUpdateEstimasiBiayaHeader = () => {
  const { setError } = useFormError(); // Mengambil setError dari context
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { toast } = useToast();

  return useMutation(updateEstimasiBiayaHeaderFn, {
    onMutate: () => {
      dispatch(setProcessing());
    },
    onSuccess: () => {
      void queryClient.invalidateQueries('estimasibiaya');
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

export const useDeleteEstimasiBiayaHeader = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteEstimasiBiayaHeaderFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('estimasibiaya');
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
