import { AxiosError } from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useAlert } from '../store/client/useAlert';
import { useFormError } from '../hooks/formErrorContext';
import { IErrorResponse } from '../types/labarugikalkulasi.type';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  deleteLabaRugiKalkulasiFn,
  getAllLabaRugiKalkulasiFn,
  storeLabaRugiKalkulasiFn,
  updateLabaRugiKalkulasiFn
} from '../apis/labarugikalkulasi.api';

export const useGetAllLabaRugiKalkulasi = (
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
    ['labarugikalkulasi', filters],
    async () => await getAllLabaRugiKalkulasiFn(filters, signal),
    {
      enabled: !signal?.aborted
    }
  );
};

export const useCreateLabaRugiKalkulasi = () => {
  const { setError } = useFormError(); // Mengambil setError dari context
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storeLabaRugiKalkulasiFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('labarugikalkulasi');
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

export const useUpdateLabaRugiKalkulasi = () => {
  const { setError } = useFormError(); // Mengambil setError dari context
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateLabaRugiKalkulasiFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('labarugikalkulasi');
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

export const useDeleteLabaRugiKalkulasi = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteLabaRugiKalkulasiFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('labarugikalkulasi');
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
