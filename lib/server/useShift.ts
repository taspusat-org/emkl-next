import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  deleteShiftFn,
  getAllShiftFn,
  getShiftDetailFn,
  storeShiftFn,
  updateShiftDetailFn,
  updateShiftFn
} from '../apis/shift.api';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import { IErrorResponse } from '../types/user.type';

export const useGetAllShift = (
  filters: {
    filters?: {
      nama?: string; // Filter berdasarkan method
      jammasuk?: string; // Filter berdasarkan nama
      jampulang?: string; // Filter berdasarkan nama
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
  return useQuery(['shift', filters], async () => await getAllShiftFn(filters));
};
export const useGetShiftDetail = (id?: number) => {
  return useQuery(
    ['shift-detail', id],
    async () => await getShiftDetailFn(id!),
    {
      enabled: !!id
    }
  );
};
export const useCreateShift = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storeShiftFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('shift');
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
export const useUpdateShift = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateShiftFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('shift');
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
export const useDeleteShift = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteShiftFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('shift');
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

export const useUpdateShiftDetail = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateShiftDetailFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('shift-detail');
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
