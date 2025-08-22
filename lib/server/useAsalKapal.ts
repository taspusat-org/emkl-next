import { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  deleteAsalKapalFn,
  getAllAsalKapalFn,
  storeAsalKapalFn,
  updateAsalKapalFn
} from '../apis/asalkapal.api';
import { useToast } from '@/hooks/use-toast';
import { useAlert } from '../store/client/useAlert';
import { IErrorResponse } from '../types/asalkapal.type';
import { log } from 'console';

export const useGetAllAsalKapal = (
  filters: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: string;
    filters?: {
      nominal?: string | number | null | undefined | '';
      keterangan?: string;
      // cabang_id?: number | null | undefined | '';
      cabang?: string;
      // container_id?: number | null | undefined | '';
      container?: string;
      // statusaktif?: number | null | undefined | '';
      statusaktif_text?: string;
      modifiedby?: string;
      created_at?: string;
      updated_at?: string;
    };
  } = {}
) => {
  return useQuery(
    ['asalkapal', filters],
    async () => await getAllAsalKapalFn(filters)
  );
};

export const useCreateAsalKapal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { alert } = useAlert();

  return useMutation(storeAsalKapalFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('asalkapal');
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

export const useUpdateAsalKapal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateAsalKapalFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('asalkapal');
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

export const useDeleteAsalKapal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteAsalKapalFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('asalkapal');
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
