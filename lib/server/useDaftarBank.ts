import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  deleteDaftarBankFn,
  getDaftarBankFn,
  storeDaftarBankFn,
  updateDaftarBankFn
} from '../apis/daftarbank.api';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import { IErrorResponse } from '../types/user.type';

export const useGetDaftarBank = (
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
    ['daftarbanks', filters],
    async () => await getDaftarBankFn(filters)
  );
};

export const useCreateDaftarBank = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storeDaftarBankFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('daftarbanks'); //pake s karena sebagai penamaan aja, karena kita pake mutasi, jadi pas crud dan ada data berubah kita ga fetch manual, pake ini aja asal keynya sama
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

export const useDeleteDaftarBank = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteDaftarBankFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('daftarbanks');
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
export const useUpdateDaftarBank = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateDaftarBankFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('daftarbanks');
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
