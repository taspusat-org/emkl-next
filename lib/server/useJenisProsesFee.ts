import { AxiosError } from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useAlert } from '../store/client/useAlert';
import { useFormError } from '../hooks/formErrorContext';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  deleteJenisProsesFeeFn,
  getAllJenisProsesFeeFn,
  storeJenisProsesFeeFn,
  updateJenisProsesFeeFn
} from '../apis/jenisprosesfee.api';
import { IErrorResponse } from '../types/jenisprosesfee.type';
import { useDispatch } from 'react-redux';
import {
  setProcessed,
  setProcessing
} from '../store/loadingSlice/loadingSlice';

export const useGetAllJenisProsesFee = (
  filters: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: string;
    filters?: {
      nama?: string;
      keterangan?: string;
      statusaktif_nama?: string;
      modifiedby?: string;
      created_at?: string;
      updated_at?: string;
    };
  } = {}
) => {
  return useQuery(
    ['jenisprosesfee', filters],
    async () => await getAllJenisProsesFeeFn(filters)
  );
};

export const useCreateJenisProsesFee = () => {
  const { setError } = useFormError(); // Mengambil setError dari context
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { toast } = useToast();

  return useMutation(storeJenisProsesFeeFn, {
    onMutate: () => {
      dispatch(setProcessing());
    },
    onSuccess: () => {
      void queryClient.invalidateQueries('jenisprosesfee');
      dispatch(setProcessed());
    },
    onError: (error: AxiosError) => {
      const errorResponse = (error.response?.data as IErrorResponse) ?? {};
      dispatch(setProcessed());

      if (errorResponse !== undefined) {
        // Menangani error berdasarkan path
        const errorFields = errorResponse.message || [];
        if (errorResponse.statusCode === 400) {
          // Iterasi error message dan set error di form
          errorFields?.forEach((err: { path: string[]; message: string }) => {
            const path = err.path[0]; // Ambil path error pertama (misalnya 'nama', 'akuntansi_id')
            console.log('path', path);
            setError(path, err.message); // Update error di context
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

export const useUpdateJenisProsesFee = () => {
  const { setError } = useFormError(); // Mengambil setError dari context
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateJenisProsesFeeFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('jenisprosesfee');
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
        } else {
          toast({
            variant: 'destructive',
            title: errorResponse.message ?? 'Gagal',
            description: 'Terjadi masalah dengan permintaan Anda'
          });
        }
      }
    }
  });
};

export const useDeleteJenisProsesFee = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteJenisProsesFeeFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('jenisprosesfee');
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
