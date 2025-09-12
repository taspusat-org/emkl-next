import { AxiosError } from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useAlert } from '../store/client/useAlert';
import { useFormError } from '../hooks/formErrorContext';
import { IErrorResponse } from '../types/penerimaanemkl.type';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  deletePenerimaanEmklFn,
  getAllPenerimaanEmklFn,
  storePenerimaanEmklFn,
  updatePenerimaanEmklFn
} from '../apis/penerimaanemkl.api';

export const useGetAllPenerimaanEmkl = (
  filters: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: string;
    filters?: {
      nama?: string;
      keterangan?: string;
      coadebet_text?: string;
      coakredit_text?: string;
      coabankdebet_text?: string;
      coabankkredit_text?: string;
      coahutangdebet_text?: string;
      coahutangkredit_text?: string;
      format_text?: string;
      statusaktif_text?: string;
      modifiedby?: string;
      created_at?: string;
      updated_at?: string;
    };
  } = {},
  signal?: AbortSignal
) => {
  return useQuery(
    ['penerimaanemkl', filters],
    async () => await getAllPenerimaanEmklFn(filters, signal),
    {
      enabled: !signal?.aborted
    }
  );
};

export const useCreatePenerimaanEmkl = () => {
  const { setError } = useFormError(); // Mengambil setError dari context
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storePenerimaanEmklFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('penerimaanemkl');
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;

      if (errorResponse !== undefined) {
        // Menangani error berdasarkan path

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

export const useUpdatePenerimaanEmkl = () => {
  const { setError } = useFormError(); // Mengambil setError dari context
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updatePenerimaanEmklFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('penerimaanemkl');
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

export const useDeletePenerimaanEmkl = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deletePenerimaanEmklFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('penerimaanemkl');
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
