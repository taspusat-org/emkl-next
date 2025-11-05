import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  deletePelayaranFn,
  getPelayaranFn,
  storePelayaranFn,
  updatePelayaranFn
} from '../apis/pelayaran.api';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import { IErrorResponse } from '../types/user.type';
import { useFormError } from '../hooks/formErrorContext';

export const useGetPelayaran = (
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
    ['pelayarans', filters],
    async () => await getPelayaranFn(filters, signal),
    {
      enabled: !signal?.aborted
    }
  );
};

export const useCreatePelayaran = () => {
  const { setError } = useFormError();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storePelayaranFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('pelayarans'); //pake s karena sebagai penamaan aja, karena kita pake mutasi, jadi pas crud dan ada data berubah kita ga fetch manual, pake ini aja asal keynya sama
      // toast({
      //   title: 'Proses Berhasil',
      //   description: 'Data Berhasil Ditambahkan'
      // });
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;
      if (errorResponse !== undefined) {
        const errorFields = errorResponse.message || [];

        // Iterasi error message dan set error di form
        errorFields?.forEach((err: { path: string[]; message: string }) => {
          const path = err.path[0]; // Ambil path error pertama (misalnya 'nama', 'akuntansi_id')

          setError(path, err.message); // Update error di context
        });
        // toast({
        //   variant: 'destructive',
        //   title: errorResponse.message ?? 'Gagal',
        //   description: 'Terjadi masalah dengan permintaan Anda.'
        // });
      }
    }
  });
};

export const useDeletePelayaran = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deletePelayaranFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('pelayarans');
      // toast({
      //   title: 'Proses Berhasil.',
      //   description: 'Data Berhasil Dihapus.'
      // });
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
export const useUpdatePelayaran = () => {
  const { setError } = useFormError();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updatePelayaranFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('pelayarans');
      // toast({
      //   title: 'Proses Berhasil.',
      //   description: 'Data Berhasil Diubah.'
      // });
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;
      if (errorResponse !== undefined) {
        const errorFields = errorResponse.message || [];

        // Iterasi error message dan set error di form
        errorFields?.forEach((err: { path: string[]; message: string }) => {
          const path = err.path[0]; // Ambil path error pertama (misalnya 'nama', 'akuntansi_id')

          setError(path, err.message); // Update error di context
        });
        // toast({
        //   variant: 'destructive',
        //   title: errorResponse.message ?? 'Gagal',
        //   description: 'Terjadi masalah dengan permintaan Anda.'
        // });
      }
    }
  });
};
