import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useToast } from '@/hooks/use-toast';
import { IErrorResponse } from '../types/user.type';
import { AxiosError } from 'axios';
import {
  deleteContainerFn,
  getContainerFn,
  storeContainerFn,
  updateContainerFn
} from '../apis/container.api';
import { useAlert } from '../store/client/useAlert';
import { useFormError } from '../hooks/formErrorContext';

export const useGetContainer = (
  filters: {
    filters?: {
      nama?: string;
      keterangan?: string;
      text?: string;
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
    ['container', filters],
    async () => await getContainerFn(filters, signal),
    {
      enabled: !signal?.aborted
    }
  );
};

export const useCreateContainer = () => {
  const { setError } = useFormError();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { alert } = useAlert();

  return useMutation(storeContainerFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('container');
      // toast({
      //   title: 'Proses Berhasil',
      //   description: 'Data Berhasil Ditambahkan'
      // });
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;

      if (errorResponse !== undefined) {
        // Menangani error berdasarkan path
        const errorFields = errorResponse.message || [];

        if (errorResponse.statusCode === 400) {
          // Iterasi error message dan set error di form
          errorFields?.forEach((err: { path: string[]; message: string }) => {
            const path = err.path[0]; // Ambil path error pertama (misalnya 'nama', 'akuntansi_id')

            setError(path, err.message); // Update error di context
          });
        }
      }
    }
  });
};

export const useDeleteContainer = () => {
  const { setError } = useFormError();
  const queryClient = useQueryClient();

  return useMutation(deleteContainerFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('container');
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;
      if (errorResponse !== undefined) {
        const errorFields = errorResponse.message || [];
        if (errorResponse.statusCode === 400) {
          errorFields?.forEach((err: { path: string[]; message: string }) => {
            const path = err.path[0]; // Ambil path error pertama (misalnya 'nama', 'akuntansi_id')

            setError(path, err.message); // Update error di context
          });
        }
      }
    }
  });
};
export const useUpdateContainer = () => {
  const { setError } = useFormError();
  const queryClient = useQueryClient();

  return useMutation(updateContainerFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('container');
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;
      if (errorResponse !== undefined) {
        const errorFields = errorResponse.message || [];
        if (errorResponse.statusCode === 400) {
          // Iterasi error message dan set error di form
          errorFields?.forEach((err: { path: string[]; message: string }) => {
            const path = err.path[0]; // Ambil path error pertama (misalnya 'nama', 'akuntansi_id')

            setError(path, err.message); // Update error di context
          });
        }
      }
    }
  });
};
