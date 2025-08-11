import { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  deleteTypeAkuntansiFn,
  getAllTypeAkuntansiFn,
  storeTypeAkuntansiFn,
  updateTypeAkuntansiFn
} from '../apis/typeakuntansi.api';
import { useToast } from '@/hooks/use-toast';
import { useAlert } from '../store/client/useAlert';
import { IErrorResponse } from '../types/typeakuntansi.type';

export const useGetAllTypeAkuntansi = (
  filters: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: string;
    filters?: {
      nama?: string;
      order?: number | null | undefined | '';
      keterangan?: string;
      statusaktif_text?: string;
      akuntansi?: string;
      modifiedby?: string;
      created_at?: string;
      updated_at?: string;
    };
  } = {}
) => {
  return useQuery(
    ['typeakuntansi', filters],
    async () => await getAllTypeAkuntansiFn(filters)
  );
};

export const useCreateTypeAkuntansi = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { alert } = useAlert();

  return useMutation(storeTypeAkuntansiFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('typeakuntansi');
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

export const useUpdateTypeAkuntansi = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateTypeAkuntansiFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('typeakuntansi');
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

export const useDeleteTypeAkuntansi = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteTypeAkuntansiFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('typeakuntansi');
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
