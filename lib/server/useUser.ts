import { useMutation, useQuery, useQueryClient } from 'react-query';
import { AxiosError } from 'axios';
import { IErrorResponse } from '../types/user.type';
import { useToast } from '@/hooks/use-toast';
import {
  deleteUserFn,
  getAllUserFn,
  getUserAclFn,
  getUserRoleFn,
  storeUserFn,
  updateUserAclFn,
  updateUserFn,
  updateUserRoleFn
} from '../apis/user.api';

export const useGetAllUser = (
  filters: {
    filters?: {
      username?: string; // Filter berdasarkan class
      name?: string; // Filter berdasarkan method
      email?: string; // Filter berdasarkan nama
      modifiedby?: string; // Filter berdasarkan nama
      statusaktif?: string; // Filter berdasarkan nama
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
  return useQuery(['users', filters], async () => await getAllUserFn(filters));
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storeUserFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('users');
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
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateUserFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('users');
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
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteUserFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('users');
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
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateUserRoleFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('users');
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
export const useUpdateUserAcl = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateUserAclFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('users');
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
export const useGetUserRole = (id?: number) => {
  return useQuery(['user-role', id], async () => await getUserRoleFn(id!), {
    enabled: !!id
  });
};
export const useGetUserAcl = (id?: number) => {
  return useQuery(['user-acl', id], async () => await getUserAclFn(id!), {
    enabled: !!id
  });
};
