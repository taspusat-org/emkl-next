import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  deleteApprovalHeaderFn,
  getApprovalDetailFn,
  getApprovalHeaderFn,
  storeApprovalHeaderFn,
  updateApprovalDetailFn,
  updateApprovalHeaderFn
} from '../apis/approvalheader.api';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import { IErrorResponse } from '../types/user.type';

export const useGetApprovalHeader = (
  filters: {
    filters?: {
      nama: string;
      keterangan: string;
      cabang_nama: string;
      text: string;
      created_at: string;
      updated_at: string;
      modifiedby: string;
    };
    page?: number;
    sortBy?: string;
    sortDirection?: string;
    limit?: number;
    search?: string; // Kata kunci pencarian
  } = {}
) => {
  return useQuery(
    ['approval-header', filters],
    async () => await getApprovalHeaderFn(filters)
  );
};
export const useCreateApprovalHeader = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storeApprovalHeaderFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('approval-header');
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
export const useUpdateApprovalHeader = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateApprovalHeaderFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('approval-header');
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
export const useDeleteApprovalHeader = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteApprovalHeaderFn, {
    onSuccess: (deletedId) => {
      // Mengupdate cache secara langsung
      queryClient.setQueryData('approval-header', (oldData: any) => {
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
export const useGetApprovalDetail = (id?: string) => {
  return useQuery(
    ['approval-header', id],
    async () => await getApprovalDetailFn(id!),
    {
      enabled: !!id
    }
  );
};
export const useUpdateApprovalDetailFn = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateApprovalDetailFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('approval-header');
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
