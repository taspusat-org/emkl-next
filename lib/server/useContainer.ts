import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useToast } from '@/hooks/use-toast';
import { IErrorResponse } from '../types/user.type';
import { AxiosError } from 'axios';
import {
  deleteContainerFn,
  getContainerFn,
  storeContainerFn,
  updateContainerFn
} from '../apis/container.api';
import { useAlert } from '../store/client/useAlert';

export const useGetContainer = (
  filters: {
    filters?: {
      nama?: string;
      keterangan?: string;
    };
    page?: number;
    sortBy?: string;
    sortDirection?: string;
    limit?: number;
    search?: string; // Kata kunci pencarian
  } = {}
) => {
  return useQuery(
    ['container', filters],
    async () => await getContainerFn(filters)
  );
};

export const useCreateContainer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { alert } = useAlert();

  return useMutation(storeContainerFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('container');
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

export const useDeleteContainer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteContainerFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('container');
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
export const useUpdateContainer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateContainerFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('container');
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
