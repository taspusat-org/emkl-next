import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  deleteManagerMarketingFn,
  getManagerMarketingDetailFn,
  getManagerMarketingHeaderFn,
  storeManagerMarketingFn,
  updateManagerMarketingFn
} from '../apis/managermarketingheader.api';
import {
  setProcessed,
  setProcessing
} from '../store/loadingSlice/loadingSlice';
import { useToast } from '@/hooks/use-toast';
import { useDispatch } from 'react-redux';
import { AxiosError } from 'axios';
import { IErrorResponse } from '../types/user.type';
import { useFormError } from '../hooks/formErrorContext';

export const useGetManagerMarketingHeader = (
  filters: {
    filters?: {
      nama?: string;
      keterangan?: string;
      minimalprofit?: string | null;
      statusmentor_text?: string | null;
      statusleader_text?: string | null;
      text?: string | null;
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
    ['managermarketing', filters],
    async () => {
      // Only trigger processing if the page is 1
      if (filters.page === 1) {
        dispatch(setProcessing());
      }

      try {
        const data = await getManagerMarketingHeaderFn(filters);
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
export const useGetManagerMarketingDetail = (id?: number) => {
  return useQuery(
    ['managermarketing', id],
    async () => await getManagerMarketingDetailFn(id!),
    {
      enabled: !!id
    }
  );
};
export const useCreateManagerMarketing = () => {
  const { setError } = useFormError();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { toast } = useToast();

  return useMutation(storeManagerMarketingFn, {
    // before the mutation fn runs
    onMutate: () => {
      dispatch(setProcessing());
    },
    // on success, invalidate + toast + clear loading
    onSuccess: () => {
      void queryClient.invalidateQueries(['managermarketing']);
      toast({
        title: 'Proses Berhasil',
        description: 'Data Berhasil Ditambahkan'
      });
      dispatch(setProcessed());
    },
    // on error, toast + clear loading
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;

      if (errorResponse !== undefined) {
        console.log('errorResponse', errorResponse);

        const messages = Array.isArray(errorResponse.message)
          ? errorResponse.message
          : [{ path: ['form'], message: errorResponse.message }];

        messages.forEach((err) => {
          const path = err.path?.[0] ?? 'form';
          setError(path, err.message);
        });
      }
    }
    // alternatively: always clear loading, whether success or fail
    // onSettled: () => {
    //   dispatch(clearProcessing());
    // }
  });
};
export const useUpdateManagerMarketing = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateManagerMarketingFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('managermarketing');
      toast({
        title: 'Proses Berhasil.',
        description: 'Data Berhasil Diubah.'
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
export const useDeleteManagerMarketing = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteManagerMarketingFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('managermarketing');
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
