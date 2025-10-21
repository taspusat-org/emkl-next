import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useToast } from '@/hooks/use-toast';
import { IErrorResponse } from '../types/user.type';
import { AxiosError } from 'axios';
import {
  deleteDaftarblFn,
  getDaftarblFn,
  storeDaftarblFn,
  updateDaftarblFn
} from '../apis/daftarbl.api';
import { useAlert } from '../store/client/useAlert';
import { useFormError } from '../hooks/formErrorContext';

export const useGetDaftarbl = (
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
    search?: string; // Kata kunci pencarian
  } = {},
  signal?: AbortSignal
) => {
  return useQuery(
    ['daftarbl', filters],
    async () => await getDaftarblFn(filters, signal),
    {
      enabled: !signal?.aborted
    }
  );
};

export const useCreateDaftarbl = () => {
  const { setError } = useFormError();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { alert } = useAlert();

  return useMutation(storeDaftarblFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('daftarbl');
      // toast({
      //   title: 'Proses Berhasil',
      //   description: 'Data Berhasil Ditambahkan'
      // });
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;
      console.log('errorResponse', errorResponse);
      if (errorResponse !== undefined) {
        // Menangani error berdasarkan path
        const errorFields = errorResponse.message || [];

        // Iterasi error message dan set error di form
        errorFields?.forEach((err: { path: string[]; message: string }) => {
          const path = err.path[0]; // Ambil path error pertama (misalnya 'nama', 'akuntansi_id')
          console.log('path', path);
          setError(path, err.message); // Update error di context
        });

        // toast({
        //   variant: 'destructive',
        //   title: errorResponse.message ?? 'Gagal',
        //   description: 'Terjadi masalah dengan permintaan Anda'
        // });
      }
    }
  });
};

export const useDeleteDaftarbl = () => {
  const { setError } = useFormError();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteDaftarblFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('daftarbl');
      // toast({
      //   title: 'Proses Berhasil.',
      //   description: 'Data Berhasil Dihapus.'
      // });
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;
      console.log('errorResponse', errorResponse);
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
    }
  });
};
export const useUpdateDaftarbl = () => {
  const { setError } = useFormError();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateDaftarblFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('daftarbl');
      // toast({
      //   title: 'Proses Berhasil.',
      //   description: 'Data Berhasil Diubah.'
      // });
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;
      console.log('errorResponse', errorResponse);
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
    }
  });
};
