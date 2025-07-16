import { AxiosError } from 'axios';
import { IErrorResponse } from '../types/user.type';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  deleteCcemailFn,
  getAllCcEmailFn,
  storeCcemailFn,
  updateCcEmailFn
} from '../apis/ccemail.api';

export const useGetAllCcEmail = (
  filters: {
    page?: number;
    limit?: number;
    filters?: {
      nama?: string; // Filter berdasarkan method
      email?: string; // Filter berdasarkan nama
      modifiedby?: string; // Filter berdasarkan nama
      statusaktif?: number; // Filter berdasarkan nama
      created_at?: string;
      updated_at?: string;
    };
    search?: string; // Kata kunci pencarian
    sortBy?: string;
    sortDirection?: string;
  } = {}
) => {
  return useQuery(
    ['ccemail', filters],
    async () => await getAllCcEmailFn(filters)
  );
};

export const useCreateCcemail = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storeCcemailFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('ccemail');
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

export const useUpdatCcEmail = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateCcEmailFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('ccemail');
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

export const useDeleteCcEmail = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteCcemailFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('ccemail');
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
