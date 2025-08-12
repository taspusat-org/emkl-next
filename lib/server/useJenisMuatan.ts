import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  deleteJenisMuatanFn,
  getJenisMuatanFn,
  storeJenisMuatanFn,
  updateJenisMuatanFn
} from '../apis/jenismuatan.api';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import { IErrorResponse } from '../types/user.type';

export const useGetJenisMuatan = (
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
    ['jenismuatans', filters],
    async () => await getJenisMuatanFn(filters)
  );
};

export const useCreateJenisMuatan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storeJenisMuatanFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('jenismuatans'); //pake s karena sebagai penamaan aja, karena kita pake mutasi, jadi pas crud dan ada data berubah kita ga fetch manual, pake ini aja asal keynya sama
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

export const useDeleteJenisMuatan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteJenisMuatanFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('jenismuatans');
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
export const useUpdateJenisMuatan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateJenisMuatanFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('jenismuatans');
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
