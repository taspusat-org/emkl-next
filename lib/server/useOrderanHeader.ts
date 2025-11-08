import { AxiosError } from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useAlert } from '../store/client/useAlert';
import { useFormError } from '../hooks/formErrorContext';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  deleteOrderanMuatanFn,
  getAllOrderanMuatanFn,
  updateOrderanMuatanFn
} from '../apis/orderanHeader.api';
import { IErrorResponse } from '../types/orderanHeader.type';

export const useGetAllOrderanMuatan = (
  filters: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: string;
    filters?: {
      nobukti?: string;
      tglbukti?: string;
      modifiedby?: string;
      created_at?: string;
      updated_at?: string;
      tglDari?: string | null;
      tglSampai?: string | null;
      schedule_id?: number | string;
    };
  } = {},
  signal?: AbortSignal
) => {
  return useQuery(
    ['orderanheader', filters],
    async () => await getAllOrderanMuatanFn(filters, signal),
    {
      enabled: !signal?.aborted
    }
  );
};

export const useUpdateOrderanHeader = () => {
  const { setError } = useFormError(); // Mengambil setError dari context
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateOrderanMuatanFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('orderanheader');
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

export const useDeleteOrderanHeader = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteOrderanMuatanFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('orderanheader');
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
