import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  approveIzinFn,
  cancelIzinFn,
  deleteIzinFn,
  getApprovalIzinFn,
  GetIzinApprovalFn,
  getIzinFn,
  rejectIzinFn,
  storeIzinFn,
  updateIzinFn
} from '../apis/izin.api';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import { IErrorResponse } from '../types/user.type';

export const useGetAllIzin = (
  filters: {
    filters?: {
      kode?: string; // Filter berdasarkan class
      ket?: string; // Filter berdasarkan method
      modifiedby?: string; // Filter berdasarkan nama
    };
    page?: number;
    sortBy?: string;
    sortDirection?: string;
    limit?: number;
    search?: string; // Kata kunci pencarian
  } = {}
) => {
  return useQuery(['izin', filters], async () => await getIzinFn(filters));
};
export const useGetApprovalIzin = (
  filters: {
    filters?: {
      kode?: string; // Filter berdasarkan class
      ket?: string; // Filter berdasarkan method
      modifiedby?: string; // Filter berdasarkan nama
    };
    page?: number;
    sortBy?: string;
    sortDirection?: string;
    limit?: number;
    search?: string; // Kata kunci pencarian
  } = {}
) => {
  return useQuery(
    ['approval-izin', filters],
    async () => await getApprovalIzinFn(filters)
  );
};
export const useCreateIzin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storeIzinFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('izin');
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
export const useCancelIzin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(cancelIzinFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('approval-izin');
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
export const useUpdateIzin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateIzinFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('izin');
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
export const useDeleteIzin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteIzinFn, {
    onSuccess: (deletedId) => {
      // Mengupdate cache secara langsung
      queryClient.setQueryData('izin', (oldData: any) => {
        if (!oldData) return oldData; // Jika tidak ada data, kembalikan

        // Filter data yang dihapus
        const newData = oldData.data.filter(
          (error: any) => error.id !== deletedId
        );

        return {
          ...oldData,
          data: newData
        };
      });

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
export const useGetIzinApproval = (id?: string) => {
  return useQuery(
    ['izin-approval', id],
    async () => await GetIzinApprovalFn(id!),
    {
      enabled: !!id
    }
  );
};
export const useApproveIzin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(approveIzinFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('approval-izin');
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
export const useRejectIzin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(rejectIzinFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('approval-izin');
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
