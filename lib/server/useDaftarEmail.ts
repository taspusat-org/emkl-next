import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  deleteDaftarEmailFn,
  getCcEmailDetail,
  getDaftarEmailFn,
  getToEmailDetail,
  storeDaftarEmailFn,
  updateDaftarEmailCcDetailFn,
  updateDaftarEmailFn,
  updateDaftarEmailToDetailFn
} from '../apis/daftaremail.api';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import { IErrorResponse } from '../types/user.type';

export const useGetDaftarEmail = (
  filters: {
    filters?: {
      nama?: string; // Filter berdasarkan class
      keterangan?: string; // Filter berdasarkan method
      statusaktif?: string; // Filter berdasarkan method
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
    ['daftar-email', filters],
    async () => await getDaftarEmailFn(filters)
  );
};
export const useDaftarEmail = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storeDaftarEmailFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('daftar-email');
      toast({
        title: 'Proses Berhasil',
        description: 'Data Berhasil Ditambahkan'
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
export const useUpdateDaftarEmail = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateDaftarEmailFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('daftar-email');
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
export const useDeleteDaftarEmail = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteDaftarEmailFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('daftar-email');
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
export const useGetDaftarEmailToDetail = (id?: number, activeTab?: string) => {
  return useQuery(['toemail', id], async () => await getToEmailDetail(id!), {
    enabled: !!id && activeTab === 'toemail'
  });
};
export const useGetDaftarEmailCcDetail = (id?: number, activeTab?: string) => {
  return useQuery(['ccemail', id], async () => await getCcEmailDetail(id!), {
    enabled: !!id && activeTab === 'ccemail'
  });
};
export const useUpdateDaftarEmailToDetail = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateDaftarEmailToDetailFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('to-detail');
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
export const useUpdateDaftarEmailCcDetail = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateDaftarEmailCcDetailFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('cc-detail');
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
