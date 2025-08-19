import { useDispatch } from 'react-redux';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  deleteScheduleFn,
  getScheduleDetailFn,
  getScheduleHeaderFn,
  storeScheduleFn,
  updateScheduleFn
} from '../apis/schedule.api';
import {
  setProcessed,
  setProcessing
} from '../store/loadingSlice/loadingSlice';
import { AxiosError } from 'axios';
import { IErrorResponse } from '../types/user.type';

export const useGetScheduleHeader = (
  filters: {
    filters?: {
      nobukti?: string;
      tglbukti?: string;
      keterangan?: string | null;
      bank_id?: number | null;
      pengeluaran_nobukti?: string | null;
      coakaskeluar?: string | null;
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
    ['schedule', filters],
    async () => {
      if (filters.page === 1) {
        dispatch(setProcessing()); // Only trigger processing if the page is 1
      }

      try {
        const data = await getScheduleHeaderFn(filters);
        // console.log('result di use fe', data);

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

export const useGetScheduleDetail = (id?: number) => {
  return useQuery(
    ['schedule', id],
    async () => await getScheduleDetailFn(id!),
    {
      enabled: !!id // Hanya aktifkan query jika tab aktif adalah "pengalamankerja"
    }
  );
};

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { toast } = useToast();

  return useMutation(storeScheduleFn, {
    // before the mutation fn runs
    onMutate: () => {
      dispatch(setProcessing());
    },
    onSuccess: () => {
      // on success, invalidate + toast + clear loading
      void queryClient.invalidateQueries(['schedule']);
      // toast({
      //   title: 'Proses Berhasil',
      //   description: 'Data Berhasil Ditambahkan'
      // });
      dispatch(setProcessed());
    },
    onError: (error: AxiosError) => {
      // on error, toast + clear loading
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

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateScheduleFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('schedule');
      // toast({
      //   title: 'Proses Berhasil.',
      //   description: 'Data Berhasil Diubah.'
      // });
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

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteScheduleFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('schedule');
      // toast({
      //   title: 'Proses Berhasil.',
      //   description: 'Data Berhasil Dihapus.'
      // });
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
