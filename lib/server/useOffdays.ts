import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  deleteOffdaysFn,
  getAllOffdaysFn,
  getOffdayFn,
  storeOffdaysFn,
  updateOffdaysFn
} from '../apis/offday.api';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import { IErrorResponse } from '../types/user.type';

export const useGetOffdays = (
  filters: {
    filters?: {
      date?: string; // Filter berdasarkan class
      keterangan?: string; // Filter berdasarkan method
      created_at?: string; // Filter berdasarkan nama
      updated_at?: string; // Filter berdasarkan nama
      text?: string; // Filter berdasarkan nama
      modifiedby?: string; // Filter berdasarkan nama
    };
    page?: number;
    sortBy?: string;
    sortDirection?: string;
    limit?: number;
    search?: string; // Kata kunci pencarian
  } = {}
) => {
  return useQuery(['offdays', filters], async () => await getOffdayFn(filters));
};
export const useCreateOffdays = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storeOffdaysFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('offdays');
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
export const useUpdateOffdays = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateOffdaysFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('offdays');
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
export const useDeleteOffdays = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteOffdaysFn, {
    onSuccess: (deletedId) => {
      // Mengupdate cache secara langsung
      queryClient.setQueryData('offdays', (oldData: any) => {
        if (!oldData) return oldData; // Jika tidak ada data, kembalikan

        // Filter data yang dihapus
        const newData = oldData.data.filter(
          (error: any) => error.id !== deletedId
        );

        return {
          ...oldData,
          data: newData
        };
      });

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
export const useGetAllOffDays = () => {
  return useQuery('offdays', getAllOffdaysFn);
};
