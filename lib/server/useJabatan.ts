import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useToast } from '@/hooks/use-toast';
import { IErrorResponse } from '../types/user.type';
import { AxiosError } from 'axios';
import {
  deleteJabatanFn,
  getJabatanFn,
  storeJabatanFn,
  updateJabatanFn
} from '../apis/jabatan.api';
import { useAlert } from '../store/client/useAlert';
import { useFormError } from '../hooks/formErrorContext';

export const useGetJabatan = (
  filters: {
    filters?: {
      nama?: string;
      keterangan?: string;
      divisi?: string;
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
    ['jabatan', filters],
    async () => await getJabatanFn(filters, signal),
    {
      enabled: !signal?.aborted
    }
  );
};

export const useCreateJabatan = () => {
  const { setError } = useFormError();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { alert } = useAlert();

  return useMutation(storeJabatanFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('jabatan');
      toast({
        title: 'Proses Berhasil',
        description: 'Data Berhasil Ditambahkan'
      });
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;
      console.log('errorResponse', errorResponse);
      if (errorResponse !== undefined) {
        // Menangani error berdasarkan path
        const errorFields = errorResponse.message || [];

        // Iterasi error message dan set error di form
        if (Array.isArray(errorFields)) {
          errorFields.forEach((err: { path: string[]; message: string }) => {
            const path = err.path[0]; // Ambil path error pertama (misalnya 'nama', 'jabatan_id')
            console.log('path', path);
            setError(path, err.message); // Update error di context
          });
        }

        // toast({
        //   variant: 'destructive',
        //   title: errorResponse.message ?? 'Gagal',
        //   description: 'Terjadi masalah dengan permintaan Anda'
        // });
      }
    }
  });
};

export const useDeleteJabatan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteJabatanFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('jabatan');
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
export const useUpdateJabatan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateJabatanFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('jabatan');
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
