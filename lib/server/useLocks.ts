import { useMutation, useQuery, useQueryClient } from 'react-query';
import { getLocksFn, openLocksFn } from '../apis/locks.api';
import { useToast } from '@/hooks/use-toast';
import { useAlert } from '../store/client/useAlert';
import { IErrorResponse } from '../types/user.type';
import { AxiosError } from 'axios';

export const useGetLocks = (
  filters: {
    filters?: {
      table?: string; // Filter berdasarkan class
      tableid?: string; // Filter berdasarkan method
      editing_by?: string; // Filter berdasarkan nama
      editing_at?: string; // Filter berdasarkan nama
    };
    page?: number;
    sortBy?: string;
    sortDirection?: string;
    limit?: number;
    search?: string; // Kata kunci pencarian
  } = {}
) => {
  return useQuery(['locks', filters], async () => await getLocksFn(filters));
};
export const useOpenLocks = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { alert } = useAlert();

  return useMutation(openLocksFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('locks');
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
