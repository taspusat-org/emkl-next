import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useToast } from '@/hooks/use-toast';
import { IErrorResponse } from '../types/user.type';
import { AxiosError } from 'axios';
import {
  deleteShipperFn,
  getShipperFn,
  storeShipperFn,
  updateShipperFn
} from '../apis/shipper.api';
import { useAlert } from '../store/client/useAlert';
import { useFormError } from '../hooks/formErrorContext';

export const useGetShipper = (
  filters: {
    filters?: {
      nama?: string;
      keterangan?: string;
      coa_text?: string;
      coapiutang_text?: string;
      coahutang_text?: string;
      coagiro_text?: string;
      marketing_text?: string;
      text?: string;
      created_at?: string;
      updated_at?: string;
    };
    page?: number;
    sortBy?: string;
    sortDirection?: string;
    limit?: number;
    search?: string; // Kata kunci pencarian
  } = {},
  signal?: AbortSignal
) => {
  return useQuery(
    ['shipper', filters],
    async () => await getShipperFn(filters, signal),
    {
      enabled: !signal?.aborted
    }
  );
};

export const useCreateShipper = () => {
  const { setError } = useFormError();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { alert } = useAlert();

  return useMutation(storeShipperFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('shipper');
      // toast({
      //   title: "Proses Berhasil",
      //   description: "Data Berhasil Ditambahkan"
      // });
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;

      if (errorResponse !== undefined) {
        if (errorResponse.statusCode === 400) {
          // Normalisasi pesan error agar konsisten array
          const messages = Array.isArray(errorResponse.message)
            ? errorResponse.message
            : [{ path: ['form'], message: errorResponse.message }];

          messages.forEach((err) => {
            const path = err.path?.[0] ?? 'form';
            setError(path, err.message);
          });
        } else {
          // toast({
          //   variant: 'destructive',
          //   title: errorResponse.message ?? 'Gagal',
          //   description: 'Terjadi masalah dengan permintaan Anda'
          // });
        }
      }
    }
  });
};

export const useDeleteShipper = () => {
  const { setError } = useFormError();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteShipperFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('shipper');
      // toast({
      //   title: "Proses Berhasil.",
      //   description: "Data Berhasil Dihapus."
      // });
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;

      if (errorResponse !== undefined) {
        const errorFields = errorResponse.message || [];
        if (errorResponse.statusCode === 400) {
          errorFields?.forEach((err: { path: string[]; message: string }) => {
            const path = err.path[0]; // Ambil path error pertama (misalnya 'nama', 'akuntansi_id')

            setError(path, err.message); // Update error di context
          });
        } else {
          // toast({
          //   variant: 'destructive',
          //   title: errorResponse.message ?? 'Gagal',
          //   description: 'Terjadi masalah dengan permintaan Anda.'
          // });
        }
      }
    }
  });
};
export const useUpdateShipper = () => {
  const { setError } = useFormError();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateShipperFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('shipper');
      // toast({
      //   title: "Proses Berhasil.",
      //   description: "Data Berhasil Diubah."
      // });
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;
      if (errorResponse !== undefined) {
        const errorFields = errorResponse.message || [];
        if (errorResponse.statusCode === 400) {
          // Iterasi error message dan set error di form
          errorFields?.forEach((err: { path: string[]; message: string }) => {
            const path = err.path[0]; // Ambil path error pertama (misalnya 'nama', 'akuntansi_id')

            setError(path, err.message); // Update error di context
          });
        }
      }
    }
  });
};
