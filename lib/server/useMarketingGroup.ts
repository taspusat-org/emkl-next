import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  deleteMarketingGroupFn,
  getMarketingGroupFn,
  storeMarketingGroupFn,
  updateMarketingGroupFn
} from '../apis/marketinggroup.api';
import { useFormError } from '../hooks/formErrorContext';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import { IErrorResponse } from '../types/user.type';

export const useGetMarketingGroup = (
  filters: {
    filters?: {
      marketing_nama?: string;
      statusaktif_text?: string;
    };
    page?: number;
    sortBy?: string;
    sortDirection?: string;
    limit?: number;
    search?: string;
  } = {},
  signal?: AbortSignal
) => {
  return useQuery(
    ['marketinggroups', filters],
    async () => await getMarketingGroupFn(filters, signal),
    {
      enabled: !signal?.aborted
    }
  );
};

export const useCreateMarketingGroup = () => {
  const { setError } = useFormError();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storeMarketingGroupFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('marketinggroups'); //pake s karena sebagai penamaan aja, karena kita pake mutasi, jadi pas crud dan ada data berubah kita ga fetch manual, pake ini aja asal keynya sama
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;
      if (errorResponse !== undefined) {
        const errorFields = errorResponse.message || [];
        console.log('errorFields', errorFields);
        // Iterasi error message dan set error di form
        errorFields?.forEach((err: { path: string[]; message: string }) => {
          const path = err.path[0]; // Ambil path error pertama (misalnya 'nama', 'akuntansi_id')
          console.log('path', path);
          setError(path, err.message); // Update error di context
        });
      }
    }
  });
};

export const useDeleteMarketingGroup = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteMarketingGroupFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('marketinggroups');
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
export const useUpdateMarketingGroup = () => {
  const { setError } = useFormError();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateMarketingGroupFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('marketinggroups');
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;
      if (errorResponse !== undefined) {
        const errorFields = errorResponse.message || [];

        // Iterasi error message dan set error di form
        errorFields?.forEach((err: { path: string[]; message: string }) => {
          const path = err.path[0]; // Ambil path error pertama (misalnya 'nama', 'akuntansi_id')
          console.log('path', path);
          setError(path, err.message); // Update error di context
        });
      }
    }
  });
};
