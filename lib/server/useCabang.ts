import { useMutation, useQuery, useQueryClient } from 'react-query';
import { AxiosError } from 'axios';
import { IErrorResponse } from '../types/user.type';
import { useToast } from '@/hooks/use-toast';
import {
  deleteCabangFn,
  getAllCabangFn,
  storeCabangFn,
  updateCabangFn
} from '../apis/cabang.api';

export const useGetAllCabang = (
  filters: {
    filters?: {
      kodecabang?: string; // Filter berdasarkan class
      nama?: string; // Filter berdasarkan method
      keterangan?: string; // Filter berdasarkan nama
      statusaktif?: string; // Filter berdasarkan nama
      text?: string; // Filter berdasarkan nama
      cabang_id?: string;
      namacabang?: string;
      modifiedby?: string; // Filter berdasarkan nama
      created_at?: string; // Filter berdasarkan nama
      updated_at?: string; // Filter berdasarkan nama
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
    ['cabang', filters],
    async () => await getAllCabangFn(filters, signal),
    {
      enabled: !signal?.aborted
    }
  );
};

export const useGetAllCabangHr = (
  filters: {
    filters?: {
      kodecabang?: string; // Filter berdasarkan class
      nama?: string; // Filter berdasarkan method
      keterangan?: string; // Filter berdasarkan nama
      statusaktif?: string; // Filter berdasarkan nama
      text?: string; // Filter berdasarkan nama
      cabang_id?: string;
      namacabang?: string;
      modifiedby?: string; // Filter berdasarkan nama
      created_at?: string; // Filter berdasarkan nama
      updated_at?: string; // Filter berdasarkan nama
    };
    page?: number;
    sortBy?: string;
    sortDirection?: string;
    limit?: number;
    search?: string; // Kata kunci pencarian
  } = {}
) => {
  return useQuery(
    ['cabangHr', filters],
    async () => await getAllCabangFn(filters)
  );
};

export const useCreateCabang = () => {
  const queryClient = useQueryClient();

  return useMutation(storeCabangFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('cabang');
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;

      if (errorResponse !== undefined) {
      }
    }
  });
};
export const useUpdateCabang = () => {
  const queryClient = useQueryClient();

  return useMutation(updateCabangFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('cabang');
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
        }
      }
    }
  });
};
export const useDeleteCabang = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteCabangFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('cabang');
      toast({
        title: 'Proses Berhasil.',
        description: 'Data Berhasil Dihapus.'
      });
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
        }
      }
    }
  });
};
