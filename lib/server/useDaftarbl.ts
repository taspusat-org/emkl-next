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
  } = {}
) => {
  return useQuery(
    ['daftarbl', filters],
    async () => await getDaftarblFn(filters)
  );
};

export const useCreateDaftarbl = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { alert } = useAlert();

  return useMutation(storeDaftarblFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('daftarbl');
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

export const useDeleteDaftarbl = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteDaftarblFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('daftarbl');
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
export const useUpdateDaftarbl = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateDaftarblFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('daftarbl');
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
