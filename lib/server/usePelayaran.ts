import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  deletePelayaranFn,
  getPelayaranFn,
  storePelayaranFn,
  updatePelayaranFn
} from '../apis/pelayaran.api';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import { IErrorResponse } from '../types/user.type';

export const useGetPelayaran = (
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
    ['pelayarans', filters],
    async () => await getPelayaranFn(filters)
  );
};

export const useCreatePelayaran = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storePelayaranFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('pelayarans'); //pake s karena sebagai penamaan aja, karena kita pake mutasi, jadi pas crud dan ada data berubah kita ga fetch manual, pake ini aja asal keynya sama
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

export const useDeletePelayaran = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deletePelayaranFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('pelayarans');
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
export const useUpdatePelayaran = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updatePelayaranFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('pelayarans');
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
