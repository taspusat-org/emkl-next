import { useMutation, useQuery, useQueryClient } from 'react-query';
import { AxiosError } from 'axios';
import { IErrorResponse } from '../types/user.type';
import { useToast } from '@/hooks/use-toast';
import {
  deleteAkuntansiFn,
  getAkuntansiFn,
  getAllAkuntansiFn,
  storeAkuntansiFn,
  updateAkuntansiFn
} from '../apis/akuntansi.api';

export const useGetAkuntansi = (
  filters: {
    filters?: {
      nama?: string;
      keterangan?: string;
      statusaktif?: string;
      created_at?: string;
      updated_at?: string;
    };
    page?: number;
    sortBy?: string;
    sortDirection?: string;
    limit?: number;
    search?: string; // Kata kunci pencarian
  } = {}
) => {
  return useQuery(['akuntansis', filters], async () => await getAkuntansiFn(filters));
};

export const useGetAllAkuntansi = (
  filters: {
    filters?: {
      nama?: string; // Filter berdasarkan method
      keterangan?: string; // Filter berdasarkan nama
      statusaktif?: string; // Filter berdasarkan nama
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
    ['akuntansi', filters],
    async () => await getAllAkuntansiFn(filters)
  );
};

export const useCreateAkuntansi = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storeAkuntansiFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('akuntansi');
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
export const useUpdateAkuntansi = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateAkuntansiFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('akuntansi');
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
export const useDeleteAkuntansi = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteAkuntansiFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('akuntansi');
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
