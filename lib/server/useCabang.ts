import { useMutation, useQuery, useQueryClient } from 'react-query';
import { AxiosError } from 'axios';
import { IErrorResponse } from '../types/user.type';
import { useToast } from '@/hooks/use-toast';
import {
  deleteCabangFn,
  getAllCabangFn,
  storeCabangFn,
  updateCabangFn
} from '../apis/cabang.api';

export const useGetAllCabang = (
  filters: {
    filters?: {
      kodecabang?: string; // Filter berdasarkan class
      nama?: string; // Filter berdasarkan method
      keterangan?: string; // Filter berdasarkan nama
      statusaktif?: string; // Filter berdasarkan nama
      text?: string; // Filter berdasarkan nama
      cabang_id?: string;
      namacabang?: string;
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
    ['cabang', filters],
    async () => await getAllCabangFn(filters)
  );
};

export const useGetAllCabangHr = (
  filters: {
    filters?: {
      kodecabang?: string; // Filter berdasarkan class
      nama?: string; // Filter berdasarkan method
      keterangan?: string; // Filter berdasarkan nama
      statusaktif?: string; // Filter berdasarkan nama
      text?: string; // Filter berdasarkan nama
      cabang_id?: string;
      namacabang?: string;
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
    ['cabangHr', filters],
    async () => await getAllCabangFn(filters)
  );
};

export const useCreateCabang = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storeCabangFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('cabang');
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
export const useUpdateCabang = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateCabangFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('cabang');
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
export const useDeleteCabang = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteCabangFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('cabang');
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
