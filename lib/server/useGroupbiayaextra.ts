import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useToast } from '@/hooks/use-toast';
import { IErrorResponse } from '../types/user.type';
import { AxiosError } from 'axios';
import {
  deleteGroupbiayaextraFn,
  getGroupbiayaextraFn,
  storeGroupbiayaextraFn,
  updateGroupbiayaextraFn
} from '../apis/groupbiayaextra.api';
import { useAlert } from '../store/client/useAlert';
import { useFormError } from '../hooks/formErrorContext';

export const useGetGroupbiayaextra = (
  filters: {
    filters?: {
      keterangan?: string;
      text?: string;
    };
    page?: number;
    sortBy?: string;
    sortDirection?: string;
    limit?: number;
    search?: string; // Kata kunci pencarian
  } = {},
  signal?: AbortSignal
) => {
  return useQuery(
    ['groupbiayaextra', filters],
    async () => await getGroupbiayaextraFn(filters, signal),
    {
      enabled: !signal?.aborted
    }
  );
};

export const useCreateGroupbiayaextra = () => {
  const { setError } = useFormError();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { alert } = useAlert();

  return useMutation(storeGroupbiayaextraFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('groupbiayaextra');
      // toast({
      //   title: 'Proses Berhasil',
      //   description: 'Data Berhasil Ditambahkan'
      // });
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

export const useDeleteGroupbiayaextra = () => {
  const { setError } = useFormError();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteGroupbiayaextraFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('groupbiayaextra');
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
export const useUpdateGroupbiayaextra = () => {
  const { setError } = useFormError();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateGroupbiayaextraFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('groupbiayaextra');
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
