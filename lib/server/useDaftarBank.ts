import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  deleteDaftarBankFn,
  getDaftarBankFn,
  storeDaftarBankFn,
  updateDaftarBankFn
} from '../apis/daftarbank.api';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import { IErrorResponse } from '../types/user.type';
import { useFormError } from '../hooks/formErrorContext';

export const useGetDaftarBank = (
  filters: {
    filters?: {
      nama?: string;
      keterangan?: string;
    };
    page?: number;
    sortBy?: string;
    sortDirection?: string;
    limit?: number;
    search?: string;
  } = {},
  signal?: AbortSignal
) => {
  return useQuery(
    ['daftarbank', filters],
    async () => await getDaftarBankFn(filters, signal),
    {
      enabled: !signal?.aborted
    }
  );
};

export const useCreateDaftarBank = () => {
  const { setError } = useFormError();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storeDaftarBankFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('daftarbank'); //pake s karena sebagai penamaan aja, karena kita pake mutasi, jadi pas crud dan ada data berubah kita ga fetch manual, pake ini aja asal keynya sama
      // toast({
      //   title: 'Proses Berhasil',
      //   description: 'Data Berhasil Ditambahkan'
      // });
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;
      if (errorResponse !== undefined) {
        const errorFields = errorResponse.message || [];
        if (errorResponse.statusCode === 400) {
          errorFields?.forEach((err: { path: string[]; message: string }) => {
            const path = err.path[0]; // Ambil path error pertama (misalnya 'nama', 'akuntansi_id')
            console.log('path', path);
            setError(path, err.message); // Update error di context
          });
        } else {
          toast({
            variant: 'destructive',
            title: errorResponse.message ?? 'Gagal',
            description: 'Terjadi masalah dengan permintaan Anda.'
          });
        }
      }
    }
  });
};

export const useDeleteDaftarBank = () => {
  const { setError } = useFormError();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteDaftarBankFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('daftarbank');
      // toast({
      //   title: 'Proses Berhasil.',
      //   description: 'Data Berhasil Dihapus.'
      // });
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;
      if (errorResponse !== undefined) {
        const errorFields = errorResponse.message || [];
        if (errorResponse.statusCode === 400) {
          errorFields?.forEach((err: { path: string[]; message: string }) => {
            const path = err.path[0]; // Ambil path error pertama (misalnya 'nama', 'akuntansi_id')
            console.log('path', path);
            setError(path, err.message); // Update error di context
          });
        } else {
          toast({
            variant: 'destructive',
            title: errorResponse.message ?? 'Gagal',
            description: 'Terjadi masalah dengan permintaan Anda.'
          });
        }
      }
    }
  });
};
export const useUpdateDaftarBank = () => {
  const { setError } = useFormError();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateDaftarBankFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('daftarbank');
      // toast({
      //   title: 'Proses Berhasil.',
      //   description: 'Data Berhasil Diubah.'
      // });
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;
      if (errorResponse !== undefined) {
        const errorFields = errorResponse.message || [];
        if (errorResponse.statusCode === 400) {
          errorFields?.forEach((err: { path: string[]; message: string }) => {
            const path = err.path[0]; // Ambil path error pertama (misalnya 'nama', 'akuntansi_id')
            console.log('path', path);
            setError(path, err.message); // Update error di context
          });
        } else {
          toast({
            variant: 'destructive',
            title: errorResponse.message ?? 'Gagal',
            description: 'Terjadi masalah dengan permintaan Anda.'
          });
        }
      }
    }
  });
};
