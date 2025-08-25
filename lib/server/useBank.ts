import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useToast } from '@/hooks/use-toast';
import { IErrorResponse } from '../types/user.type';
import { AxiosError } from 'axios';
import {
  deleteBankFn,
  getBankFn,
  storeBankFn,
  updateBankFn
} from '../apis/bank.api';
import { useAlert } from '../store/client/useAlert';
import { useFormError } from '../hooks/formErrorContext';

export const useGetBank = (
  filters: {
    filters?: {
      nama?: string;
      keterangan?: string;
      keterangancoa?: string;
      keterangancoagantung?: string;
      textbank?: string;
      text?: string;
      formatpenerimaantext?: string;
      formatpenerimaangantungtext?: string;
      formatpengeluarangantungtext?: string;
      formatpencairantext?: string;
      formatrekappenerimaantext?: string;
      formatrekappengeluarantext?: string;
      created_at?: string;
      updated_at?: string;
    };
    page?: number;
    sortBy?: string;
    sortDirection?: string;
    limit?: number;
    search?: string; // Kata kunci pencarian
  } = {}
) => {
  return useQuery(['bank', filters], async () => await getBankFn(filters));
};

export const useCreateBank = () => {
  const { setError } = useFormError();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { alert } = useAlert();

  return useMutation(storeBankFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('bank');
      toast({
        title: 'Proses Berhasil',
        description: 'Data Berhasil Ditambahkan'
      });
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;

      if (errorResponse !== undefined) {
        console.log('errorResponse', errorResponse);

        const messages = Array.isArray(errorResponse.message)
          ? errorResponse.message
          : [{ path: ['form'], message: errorResponse.message }];

        messages.forEach((err) => {
          const path = err.path?.[0] ?? 'form';
          setError(path, err.message);
        });
      }
    }
  });
};

export const useDeleteBank = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteBankFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('bank');
      toast({
        title: 'Proses Berhasil.',
        description: 'Data Berhasil Dihapus.'
      });
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
export const useUpdateBank = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateBankFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('bank');
      toast({
        title: 'Proses Berhasil.',
        description: 'Data Berhasil Diubah.'
      });
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
