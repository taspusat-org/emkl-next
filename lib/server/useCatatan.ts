import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  deleteCatatanFn,
  getCatatanFn,
  storeCatatanFn,
  updateCatatanFn
} from '../apis/catatan.api';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import { IErrorResponse } from '../types/user.type';

export const useGetAllCatatan = (
  filters: {
    filters?: {
      nama?: string; // Filter berdasarkan class
      keterangan?: string; // Filter berdasarkan method
      statusaktif?: string; // Filter berdasarkan method
      modifiedby?: string; // Filter berdasarkan nama
      created_at?: string; // Filter berdasarkan nama
      updated_at?: string; // Filter berdasarkan nama
    };
    page?: number;
    sortBy?: string;
    sortDirection?: string;
    limit?: number;
    search?: string; // Kata kunci pencarian
  } = {}
) => {
  return useQuery(
    ['catatan', filters],
    async () => await getCatatanFn(filters)
  );
};
export const useCreateCatatan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storeCatatanFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('catatan');
      toast({
        title: 'Proses Berhasil',
        description: 'Data Berhasil Ditambahkan'
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
export const useUpdateCatatan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateCatatanFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('catatan');
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
export const useDeleteCatatan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteCatatanFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('catatan');
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
