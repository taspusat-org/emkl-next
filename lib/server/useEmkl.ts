import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  deleteEmklFn,
  getEmklFn,
  storeEmklFn,
  updateEmklFn
} from '../apis/emkl.api';
import { useAlert } from '../store/client/useAlert';
import { get } from 'http';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import { IErrorResponse } from '../types/user.type';
import { useFormError } from '../hooks/formErrorContext';

export const useGetEmkl = (
  filters: {
    filters?: {
      nama: string;
      contactperson: string;
      alamat: string;
      coagiro_ket: string;
      coapiutang_ket: string;
      coahutang_ket: string;
      kota: string;
      kodepos: string;
      notelp: string;
      email: string;
      fax: string;
      alamatweb: string;
      top: string;
      npwp: string;
      namapajak: string;
      alamatpajak: string;
      statusaktif: string;
      statustrado: string;
      statusaktif_text: string;
      statustrado_text: string;
      modifiedby: string;
      created_at: string;
      updated_at: string;
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
    ['emkls', filters],
    async () => await getEmklFn(filters, signal),
    {
      enabled: !signal?.aborted
    }
  );
};

export const useCreateEmkl = () => {
  const { setError } = useFormError();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storeEmklFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('emkls'); //pake s karena sebagai penamaan aja, karena kita pake mutasi, jadi pas crud dan ada data berubah kita ga fetch manual, pake ini aja asal keynya sama
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;
      if (errorResponse !== undefined) {
        const errorFields = errorResponse.message || [];

        // Iterasi error message dan set error di form
        errorFields?.forEach((err: { path: string[]; message: string }) => {
          const path = err.path[0]; // Ambil path error pertama (misalnya 'nama', 'akuntansi_id')
          console.log('path', path);
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

export const useDeleteEmkl = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteEmklFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('emkls');
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
export const useUpdateEmkl = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { setError } = useFormError();

  return useMutation(updateEmklFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('emkls');
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;
      if (errorResponse !== undefined) {
        const errorFields = errorResponse.message || [];

        // Iterasi error message dan set error di form
        errorFields?.forEach((err: { path: string[]; message: string }) => {
          const path = err.path[0]; // Ambil path error pertama (misalnya 'nama', 'akuntansi_id')
          console.log('path', path);
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
