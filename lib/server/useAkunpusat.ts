import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useToast } from '@/hooks/use-toast';
import { IErrorResponse } from '../types/user.type';
import { AxiosError } from 'axios';
import {
  deleteAkunpusatFn,
  getAkunpusatFn,
  storeAkunpusatFn,
  updateAkunpusatFn
} from '../apis/akunpusat.api';
import { useAlert } from '../store/client/useAlert';
import { useFormError } from '../hooks/formErrorContext';

export const useGetAkunpusat = (
  filters: {
    filters?: {
      coa?: string;
      keterangancoa?: string;
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
    ['akunpusat', filters],
    async () => await getAkunpusatFn(filters, signal),
    {
      enabled: !signal?.aborted
    }
  );
};

export const useCreateAkunpusat = () => {
  const queryClient = useQueryClient();
  const { setError } = useFormError(); // Mengambil setError dari context
  const { toast } = useToast();
  const { alert } = useAlert();

  return useMutation(storeAkunpusatFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('akunpusat');
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

        const errorFields = Array.isArray(errorResponse.message)
          ? errorResponse.message
          : [];
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

export const useDeleteAkunpusat = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteAkunpusatFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('akunpusat');
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
export const useUpdateAkunpusat = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateAkunpusatFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('akunpusat');
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
