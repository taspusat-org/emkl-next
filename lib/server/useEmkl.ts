import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useToast } from '@/hooks/use-toast';
import { IErrorResponse } from '../types/user.type';
import { AxiosError } from 'axios';
import {
  deleteEmklFn,
  getEmklFn,
  storeEmklFn,
  updateEmklFn
} from '../apis/emkl.api';
import { useAlert } from '../store/client/useAlert';
import { get } from 'http';

export const useGetEmkl = (
  filters: {
    filters?: {
      emkl_text?: string;
      keterangan?: string;
      container_text?: string;
      jenisorderan_text?: string;
      nominal?: number;
      text?: string;
    };
    page?: number;
    sortBy?: string;
    sortDirection?: string;
    limit?: number;
    search?: string; // Kata kunci pencarian
  } = {}
) => {
  return useQuery(['emkl', filters], async () => await getEmklFn(filters));
};

export const useCreateEmkl = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { alert } = useAlert();

  return useMutation(storeEmklFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('emkl');
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

export const useDeleteEmkl = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteEmklFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('emkl');
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
export const useUpdateEmkl = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateEmklFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('emkl');
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
