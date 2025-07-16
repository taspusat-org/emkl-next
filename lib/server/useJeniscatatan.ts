import { useMutation, useQuery, useQueryClient } from 'react-query';
import { AxiosError } from 'axios';
import { IErrorResponse } from '../types/user.type';
import { useToast } from '@/hooks/use-toast';
import {
  deleteJenisCatatanFn,
  getAllJenisCatatanFn,
  storeJenisCatatanFn,
  updateJenisCatatanFn
} from '../apis/jeniscatatan.api';

export const useGetAllJenisCatatan = (
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
    ['jeniscatatan', filters],
    async () => await getAllJenisCatatanFn(filters)
  );
};

export const useCreateJenisCatatan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storeJenisCatatanFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('jeniscatatan');
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
export const useUpdateJenisCatatan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateJenisCatatanFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('jeniscatatan');
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
export const useDeleteJenisCatatan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteJenisCatatanFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('jeniscatatan');
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
