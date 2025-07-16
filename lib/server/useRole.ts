import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import { IErrorResponse } from '../types/user.type';
import {
  deleteRoleFn,
  getRoleAclFn,
  getRoleFn,
  storeRoleFn,
  updateRoleAclFn,
  updateRoleFn
} from '../apis/role.api';

export const useGetRole = (
  filters: {
    filters?: {
      rolename?: string; // Filter berdasarkan class
      modifiedby?: string; // Filter berdasarkan nama
      created_at?: string; // Filter berdasarkan method
      updated_at?: string; // Filter berdasarkan method
    };
    page?: number;
    limit?: number;
    search?: string; // Kata kunci pencarian
    sortBy?: string;
    sortDirection?: string;
  } = {}
) => {
  return useQuery(['roles', filters], async () => await getRoleFn(filters));
};

export const useGetRoleAcl = (id?: number) => {
  return useQuery(['role-acl', id], async () => await getRoleAclFn(id!), {
    enabled: !!id // Hanya jalankan query jika id memiliki nilai valid
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storeRoleFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('roles');
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
export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateRoleFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('roles');
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
export const useUpdateRoleAcl = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateRoleAclFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('roles');
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
export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteRoleFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('roles');
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
