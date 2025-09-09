import { AxiosError } from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useAlert } from '../store/client/useAlert';
import { useFormError } from '../hooks/formErrorContext';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import {
  setProcessed,
  setProcessing
} from '../store/loadingSlice/loadingSlice';
import {
  deleteSupplierFn,
  getAllSupplierFn,
  storeSupplierFn,
  updateSupplierFn
} from '../apis/supplier.api';
import { IErrorResponse } from '../types/supplier.type';

export const useGetAllSupplier = (
  filters: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: string;
    filters?: {
      nama?: string;
      keterangan?: string;
      contactperson?: string;
      ktp?: string;
      alamat?: string;
      coa_text?: string;
      coapiu_text?: string;
      coahut_text?: string;
      coagiro_text?: string;
      kota?: string;
      kodepos?: string;
      telp?: string;
      email?: string;
      fax?: string;
      web?: string;
      creditterm?: string;
      credittermplus?: string;
      npwp?: string;
      alamatfakturpajak?: string;
      alamatpajak?: string;
      nominalpph21?: string;
      nominalpph23?: string;
      noskb?: string;
      tglskb?: string;
      nosk?: string;
      tglsk?: string;
      statusaktif_text?: string;
      modifiedby?: string;
      created_at?: string;
      updated_at?: string;
    };
  } = {},
  signal?: AbortSignal
) => {
  return useQuery(
    ['supplier', filters],
    async () => await getAllSupplierFn(filters, signal),
    {
      enabled: !signal?.aborted
    }
  );
};

export const useCreateSupplier = () => {
  const { setError } = useFormError(); // Mengambil setError dari context
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storeSupplierFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('supplier');
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
            const path = err.path[0]; // Ambil path error pertama (misalnya 'nama', 'akuntansi_id')
            console.log('path', path);
            setError(path, err.message); // Update error di context
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

export const useUpdateSupplier = () => {
  const { setError } = useFormError(); // Mengambil setError dari context
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateSupplierFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('supplier');
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
            const path = err.path[0]; // Ambil path error pertama (misalnya 'nama', 'akuntansi_id')
            setError(path, err.message); // Update error di context
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

export const useDeleteSupplier = () => {
  const { setError } = useFormError();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteSupplierFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('supplier');
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;

      if (errorResponse !== undefined) {
        // const errorFields = errorResponse.message || [];
        const errorFields = Array.isArray(errorResponse.message)
          ? errorResponse.message
          : [];

        if (errorResponse.statusCode === 400) {
          errorFields?.forEach((err: { path: string[]; message: string }) => {
            const path = err.path[0];
            console.log('path', path);
            setError(path, err.message);
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
