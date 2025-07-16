import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  deleteMutasiFn,
  getMutasiFn,
  storeMutasiFn,
  updateMutasiFn
} from '../apis/mutasi.api';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import { IErrorResponse } from '../types/user.type';

export const useGetAllMutasi = (
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
  return useQuery(['mutasi', filters], async () => await getMutasiFn(filters));
};
export const useCreateMutasi = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storeMutasiFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('mutasi');
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
export const useUpdateMutasi = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateMutasiFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('mutasi');
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
export const useDeleteMutasi = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteMutasiFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('mutasi');
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
