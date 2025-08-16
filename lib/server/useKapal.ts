import { useMutation, useQuery, useQueryClient } from 'react-query';
import { AxiosError } from 'axios';
import { IErrorResponse } from '../types/user.type';
import { useToast } from '@/hooks/use-toast';
import {
  deleteKapalFn,
  getKapalFn,
  getAllKapalFn,
  storeKapalFn,
  updateKapalFn
} from '../apis/kapal.api';

export const useGetKapal = (
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
  return useQuery(['kapal', filters], async () => await getKapalFn(filters));
};

export const useGetAllKapal = (
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
    ['kapal', filters],
    async () => await getAllKapalFn(filters)
  );
};

export const useCreateKapal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storeKapalFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('kapal');
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
export const useUpdateKapal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateKapalFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('kapal');
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
export const useDeleteKapal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteKapalFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('kapal');
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
