import { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  deleteSandarKapalFn,
  getAllSandarKapalFn,
  storeSandarKapalFn,
  updateSandarKapalFn
} from '../apis/sandarkapal.api';
import { useToast } from '@/hooks/use-toast';
import { useAlert } from '../store/client/useAlert';
import { IErrorResponse } from '../types/sandarkapal.type';
import { log } from 'console';

export const useGetAllSandarKapal = (
  filters: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: string;
    filters?: {
      nama?: string;
      keterangan?: string;
      statusaktif_text?: string;
      modifiedby?: string;
      created_at?: string;
      updated_at?: string;
    };
  } = {}
) => {
  return useQuery(
    ['sandarkapal', filters],
    async () => await getAllSandarKapalFn(filters)
  );
};

export const useCreateSandarKapal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { alert } = useAlert();

  return useMutation(storeSandarKapalFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('sandarkapal');
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
          description: 'Terjadi masalah dengan permintaan Anda'
        });
      }
    }
  });
};

export const useUpdateSandarKapal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateSandarKapalFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('sandarkapal');
      toast({
        title: 'Proses Berhasil',
        description: 'Data Berhasil Diubah'
      });
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;

      if (errorResponse !== undefined) {
        toast({
          variant: 'destructive',
          title: errorResponse.message ?? 'Gagal',
          description: 'Terjadi masalah dengan permintaan Anda'
        });
      }
    }
  });
};

export const useDeleteSandarKapal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteSandarKapalFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('sandarkapal');
      toast({
        title: 'Proses Berhasil',
        description: 'Data Berhasil Dihapus'
      });
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;
      if (errorResponse !== undefined) {
        toast({
          variant: 'destructive',
          title: errorResponse.message ?? 'Gagal',
          description: 'Terjadi masalah dengan permintaan Anda'
        });
      }
    }
  });
};
