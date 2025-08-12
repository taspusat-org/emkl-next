import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  deleteJenisOrderanFn,
  getJenisOrderanFn,
  storeJenisOrderanFn,
  updateJenisOrderanFn
} from '../apis/jenisorderan.api';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import { IErrorResponse } from '../types/user.type';

export const useGetJenisOrderan = (
  filters: {
    filters?: {
      nama?: string;
      keterangan?: string;
    };
    page?: number;
    sortBy?: string;
    sortDirection?: string;
    limit?: number;
    search?: string;
  } = {}
) => {
  return useQuery(
    ['jenisorderans', filters],
    async () => await getJenisOrderanFn(filters)
  );
};

export const useCreateJenisOrderan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storeJenisOrderanFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('jenisorderans'); //pake s karena sebagai penamaan aja, karena kita pake mutasi, jadi pas crud dan ada data berubah kita ga fetch manual, pake ini aja asal keynya sama
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

export const useDeleteJenisOrderan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteJenisOrderanFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('jenisorderans');
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
export const useUpdateJenisOrderan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateJenisOrderanFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('jenisorderans');
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
