import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useToast } from '@/hooks/use-toast';
import { IErrorResponse } from '../types/user.type';
import { AxiosError } from 'axios';
import {
  deleteTujuankapalFn,
  getTujuankapalFn,
  storeTujuankapalFn,
  updateTujuankapalFn
} from '../apis/tujuankapal.api';
import { useAlert } from '../store/client/useAlert';

export const useGetTujuankapal = (
  filters: {
    filters?: {
      nama?: string;
      keterangan?: string;
      namacabang?: string;
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
    ['tujuankapal', filters],
    async () => await getTujuankapalFn(filters)
  );
};

export const useCreateTujuankapal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { alert } = useAlert();

  return useMutation(storeTujuankapalFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('tujuankapal');
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

export const useDeleteTujuankapal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteTujuankapalFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('tujuankapal');
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
export const useUpdateTujuankapal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateTujuankapalFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('tujuankapal');
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
