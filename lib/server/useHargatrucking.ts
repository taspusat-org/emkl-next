import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useToast } from '@/hooks/use-toast';
import { IErrorResponse } from '../types/user.type';
import { AxiosError } from 'axios';
import {
  deleteHargatruckingFn,
  getHargatruckingFn,
  storeHargatruckingFn,
  updateHargatruckingFn
} from '../apis/hargatrucking.api';
import { useAlert } from '../store/client/useAlert';
import { get } from 'http';

export const useGetHargatrucking = (
  filters: {
    filters?: {
      tujuankapal_text?: string;
      emkl_text?: string;
      keterangan?: string;
      container_text?: string;
      jenisorderan_text?: string;
      nominal?: string;
      text?: string;
    };
    page?: number;
    sortBy?: string;
    sortDirection?: string;
    limit?: number;
    search?: string; // Kata kunci pencarian
  } = {}
) => {
  return useQuery(
    ['hargatrucking', filters],
    async () => await getHargatruckingFn(filters)
  );
};

export const useCreateHargatrucking = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { alert } = useAlert();

  return useMutation(storeHargatruckingFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('hargatrucking');
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

export const useDeleteHargatrucking = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteHargatruckingFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('hargatrucking');
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
export const useUpdateHargatrucking = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateHargatruckingFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('hargatrucking');
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
