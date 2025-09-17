import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import {
  storePenerimaanFn,
  updatePenerimaanFn,
  deletePenerimaanFn
} from '../apis/penerimaan.api';
import {
  setProcessed,
  setProcessing
} from '../store/loadingSlice/loadingSlice';
import { IErrorResponse } from '../types/user.type';
import {
  getPengeluaranEmklDetailFn,
  getPengeluaranEmklHeaderFn,
  storePengeluaranEmklHeaderFn,
  updatePengeluaranEmklHeaderFn
} from '../apis/pengeluaranemklheader.api';

export const useGetPengeluaranEmklHeader = (
  filters: {
    filters?: {
      nobukti?: string;
      tglbukti?: string;
      tgljatuhtempo?: string;
      keterangan?: string | null;
      tglDari?: string | null;
      tglSampai?: string | null;
    };
    page?: number;
    sortBy?: string;
    sortDirection?: string;
    limit?: number;
    search?: string; // Kata kunci pencarian
  } = {}
) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useQuery(
    ['pengeluaranemklheader', filters],
    async () => {
      // Only trigger processing if the page is 1
      if (filters.page === 1) {
        dispatch(setProcessing());
      }

      try {
        const data = await getPengeluaranEmklHeaderFn(filters);
        return data;
      } catch (error) {
        // Show error toast and dispatch processed
        dispatch(setProcessed());
        toast({
          variant: 'destructive',
          title: 'Gagal',
          description: 'Terjadi masalah dengan permintaan Anda.'
        });
        throw error;
      } finally {
        // Regardless of success or failure, we dispatch setProcessed after the query finishes
        dispatch(setProcessed());
      }
    },
    {
      // Optionally, you can use the `onSettled` callback if you want to reset the processing state after query success or failure
      onSettled: () => {
        if (filters.page === 1) {
          dispatch(setProcessed());
        }
      }
    }
  );
};
export const useCreatePengeluaranEmklHeader = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { toast } = useToast();

  return useMutation(storePengeluaranEmklHeaderFn, {
    // before the mutation fn runs
    onMutate: () => {
      dispatch(setProcessing());
    },
    // on success, invalidate + toast + clear loading
    onSuccess: () => {
      void queryClient.invalidateQueries(['pengeluaranemklheader']);
      toast({
        title: 'Proses Berhasil',
        description: 'Data Berhasil Ditambahkan'
      });
      dispatch(setProcessed());
    },
    // on error, toast + clear loading
    onError: (error: AxiosError) => {
      const err = (error.response?.data as IErrorResponse) ?? {};
      toast({
        variant: 'destructive',
        title: err.message ?? 'Gagal',
        description: 'Terjadi masalah dengan permintaan Anda.'
      });
      dispatch(setProcessed());
    }
    // alternatively: always clear loading, whether success or fail
    // onSettled: () => {
    //   dispatch(clearProcessing());
    // }
  });
};
export const useGetPengeluaranEmklDetail = (
  filters: {
    filters?: {
      nobukti?: string;
      tglbukti?: string;
      keterangan?: string | null;
    };
    sortBy?: string;
    sortDirection?: string;
    search?: string; // Kata kunci pencarian
  } = {}
) => {
  return useQuery(
    ['pengeluaranemkl', filters],
    async () => await getPengeluaranEmklDetailFn(filters),
    {
      enabled: !!filters.filters?.nobukti
    }
  );
};

export const useUpdatePengeluaranEmklHeader = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updatePengeluaranEmklHeaderFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('pengeluaranemkl');
      //   toast({
      //     title: 'Proses Berhasil.',
      //     description: 'Data Berhasil Diubah.'
      //   });
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;
      if (errorResponse !== undefined) {
        toast({
          variant: 'destructive',
          title: errorResponse.message ?? 'Gagal',
          description: 'Terjadi masalah dengan permintaan Anda.'
        });
      }
    }
  });
};
export const useDeletePenerimaan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deletePenerimaanFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('penerimaan');
      toast({
        title: 'Proses Berhasil.',
        description: 'Data Berhasil Dihapus.'
      });
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;
      if (errorResponse !== undefined) {
        toast({
          variant: 'destructive',
          title: errorResponse.message ?? 'Gagal',
          description: 'Terjadi masalah dengan permintaan Anda.'
        });
      }
    }
  });
};
