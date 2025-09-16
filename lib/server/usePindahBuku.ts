import { AxiosError } from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useAlert } from '../store/client/useAlert';
import { useFormError } from '../hooks/formErrorContext';
import { IErrorResponse } from '../types/pindahbuku.type';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  deletePindahBukuFn,
  getAllPindahBukuFn,
  storePindahBukuFn,
  updatePindahBukuFn
} from '../apis/pindahbuku.api';

export const useGetAllPindahBuku = (
  filters: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: string;
    filters?: {
      nobukti?: string;
      tglbukti?: string;
      bankdari_text?: string;
      bankke_text?: string;
      coadebet_text?: string;
      coakredit_text?: string;
      alatbayar_text?: string;
      nowarkat?: string;
      tgljatuhtempo?: string;
      keterangan?: string;
      nominal?: string;
      statusformat_text?: string;
      modifiedby?: string;
      created_at?: string;
      updated_at?: string;
      tglDari?: string | null;
      tglSampai?: string | null;
    };
  } = {},
  signal?: AbortSignal
) => {
  return useQuery(
    ['pindahbuku', filters],
    async () => await getAllPindahBukuFn(filters, signal),
    {
      enabled: !signal?.aborted
    }
  );
};

export const useCreatePindahBuku = () => {
  const { setError } = useFormError(); // Mengambil setError dari context
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storePindahBukuFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('pindahbuku');
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;

      if (errorResponse !== undefined) {
        // Menangani error berdasarkan path

        const errorFields = Array.isArray(errorResponse.message)
          ? errorResponse.message
          : [];
        if (errorResponse.statusCode === 400) {
          // Iterasi error message dan set error di form
          errorFields?.forEach((err: { path: string[]; message: string }) => {
            const path = err.path[0];
            setError(path, err.message);
          });
        } else {
          toast({
            variant: 'destructive',
            title: errorResponse.message ?? 'Gagal',
            description: 'Terjadi masalah dengan permintaan Anda'
          });
        }
      }
    }
  });
};

export const useUpdatePindahBuku = () => {
  const { setError } = useFormError(); // Mengambil setError dari context
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updatePindahBukuFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('pindahbuku');
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;

      if (errorResponse !== undefined) {
        const errorFields = Array.isArray(errorResponse.message)
          ? errorResponse.message
          : [];

        if (errorResponse.statusCode === 400) {
          errorFields?.forEach((err: { path: string[]; message: string }) => {
            const path = err.path[0];
            setError(path, err.message);
          });
        } else {
          toast({
            variant: 'destructive',
            title: errorResponse.message ?? 'Gagal',
            description: 'Terjadi masalah dengan permintaan Anda'
          });
        }
      }
    }
  });
};

export const useDeletePindahBuku = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deletePindahBukuFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('pindahbuku');
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
