import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  getPengembalianKasGantungDetailFn,
  getPengembalianKasGantungHeaderFn,
  storePengembalianKasGantungFn
} from '../apis/pengembaliankasgantung.api';
import { useToast } from '@/hooks/use-toast';
import { useAlert } from '../store/client/useAlert';
import { AxiosError } from 'axios';
import { IErrorResponse } from '../types/user.type';
import { useDispatch } from 'react-redux';
import {
  setLoaded,
  setLoading,
  setProcessed,
  setProcessing
} from '../store/loadingSlice/loadingSlice';

export const useGetPengembalianKasGantung = (
  filters: {
    filters?: {
      nobukti?: string;
      tglbukti?: string;
      keterangan?: string | null;
      bank_id?: number | null;
      penerimaan_nobukti?: string | null;
      coakasmasuk?: string | null;
      relasi_id?: number | null;
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
    ['pengembaliankasgantungheader', filters],
    async () => {
      // Only trigger processing if the page is 1
      if (filters.page === 1) {
        dispatch(setProcessing());
      }

      try {
        const data = await getPengembalianKasGantungHeaderFn(filters);
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
export const useCreatePengembalianKasGantung = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { toast } = useToast();

  return useMutation(storePengembalianKasGantungFn, {
    // before the mutation fn runs
    onMutate: () => {
      dispatch(setProcessing());
    },
    // on success, invalidate + toast + clear loading
    onSuccess: () => {
      void queryClient.invalidateQueries(['pengembaliankasgantungheader']);
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
export const useGetPengembalianKasGantungDetail = (id?: number) => {
  return useQuery(
    ['pengembaliankasgantungdetail', id],
    async () => await getPengembalianKasGantungDetailFn(id!),
    {
      enabled: !!id // Hanya aktifkan query jika tab aktif adalah "pengalamankerja"
    }
  );
};
