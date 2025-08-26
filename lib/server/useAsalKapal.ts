import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useToast } from '@/hooks/use-toast';
import { IErrorResponse } from '../types/user.type';
import { AxiosError } from 'axios';
import {
  deleteAsalKapalFn,
  getAsalKapalFn,
  storeAsalKapalFn,
  updateAsalKapalFn
} from '../apis/asalkapal.api';
import { useAlert } from '../store/client/useAlert';
import { useFormError } from '../hooks/formErrorContext';

export const useGetAsalKapal = (
  filters: {
    filters?: {
      nominal?: string | number | null | undefined | '';
      keterangan?: string;
      cabang?: string;
      container?: string;
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
    ['asalkapal', filters],
    async () => await getAsalKapalFn(filters)
  );
};

export const useCreateAsalKapal = () => {
  const { setError } = useFormError();
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
      console.log('errorResponse', errorResponse);
      if (errorResponse !== undefined) {
        // Menangani error berdasarkan path
        const errorFields = errorResponse.message || [];

        // Iterasi error message dan set error di form
        if (Array.isArray(errorFields)) {
          errorFields.forEach((err: { path: string[]; message: string }) => {
            const path = err.path[0]; // Ambil path error pertama (misalnya 'nama', 'asalkapal_id')
            console.log('path', path);
            setError(path, err.message); // Update error di context
          });
        }

        // toast({
        //   variant: 'destructive',
        //   title: errorResponse.message ?? 'Gagal',
        //   description: 'Terjadi masalah dengan permintaan Anda'
        // });
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
export const useUpdateAsalKapal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateAsalKapalFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('asalkapal');
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
