import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  deleteJenisIzinFn,
  getAllJenisIzinFn,
  storeJenisIzinFn,
  updateJenisIzinFn
} from '../apis/jenisizin.api';
import { useToast } from '@/hooks/use-toast';
import { IErrorResponse } from '../types/ccemail.type';
import { AxiosError } from 'axios';

export const useGetAllJenisIzin = (
  filters: {
    filters?: {
      nama?: string; // Filter berdasarkan method
      keterangan?: string; // Filter berdasarkan nama
      statusaktif?: number; // Filter berdasarkan nama
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
  return useQuery(
    ['jenis-izin', filters],
    async () => await getAllJenisIzinFn(filters)
  );
};
export const useCreateJenisIzin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storeJenisIzinFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('jenis-izin');
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
export const useUpdateJenisIzin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateJenisIzinFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('jenis-izin');
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
export const useDeleteJenisIzin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteJenisIzinFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('jenis-izin');
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
