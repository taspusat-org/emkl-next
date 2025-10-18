import { AxiosError } from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useAlert } from '../store/client/useAlert';
import { useFormError } from '../hooks/formErrorContext';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { IErrorResponse } from '../types/statusJob.type';
import {
  deleteStatusJobFn,
  getAllStatusJobFn,
  getStatusJobMasukGudangByTglStatusFn,
  storeStatusJobFn,
  updateStatusJobFn
} from '../apis/statusjob.api';

export const useGetAllStatusJob = (
  filters: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: string;
    filters?: {
      tglstatus?: string;
      tglDari?: string | null;
      tglSampai?: string | null;
    };
  } = {},
  signal?: AbortSignal
) => {
  return useQuery(
    ['statusjob', filters],
    async () => await getAllStatusJobFn(filters, signal),
    {
      enabled: !signal?.aborted
    }
  );
};

export const useGetAllStatusJobMasukGudangByTglStatus = (
  tglstatus: string,
  filters: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: string;
    filters?: {
      job_text?: string;
      tglorder?: string;
      nocontainer?: string;
      noseal?: string;
      shipper_text?: string;
      nosp?: string;
      lokasistuffing_text?: string;
      keterangan?: string;
      jenisOrderan?: string;
      jenisStatusJob?: string;
    };
  } = {},
  signal?: AbortSignal
) => {
  return useQuery(
    ['statusjob', tglstatus, filters],
    async () =>
      await getStatusJobMasukGudangByTglStatusFn(tglstatus, filters, signal),
    {
      enabled: !signal?.aborted || !tglstatus
    }
  );
};

export const useCreateStatusJob = () => {
  const { setError } = useFormError(); // Mengambil setError dari context
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storeStatusJobFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('statusjob');
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

export const useUpdateStatusJob = () => {
  const { setError } = useFormError(); // Mengambil setError dari context
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateStatusJobFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('statusjob');
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

export const useDeleteStatusJob = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteStatusJobFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('statusjob');
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
