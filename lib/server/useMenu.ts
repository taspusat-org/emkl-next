import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useToast } from '@/hooks/use-toast';
import { IErrorResponse } from '../types/user.type';
import { AxiosError } from 'axios';
import {
  deleteMenuFn,
  getMenuFn,
  getMenuSidebarFn,
  getMenuSidebarWithSearchFn,
  storeMenuFn,
  updateMenuFn,
  updateMenuResequenceFn
} from '../apis/menu.api';
import { useAlert } from '../store/client/useAlert';

export const useGetMenuSidebar = () => {
  return useQuery('menu-sidebar', getMenuSidebarFn);
};

export const useGetMenu = (
  filters: {
    filters?: {
      title?: string; // Filter berdasarkan class
      parentId?: string; // Filter berdasarkan method
      icon?: string; // Filter berdasarkan nama
    };
    page?: number;
    sortBy?: string;
    sortDirection?: string;
    limit?: number;
    search?: string; // Kata kunci pencarian
  } = {}
) => {
  return useQuery(['menus', filters], async () => await getMenuFn(filters));
};

export const useGetSearchMenu = (
  filters: {
    userId?: string;
    search?: string;
  } = {}
) => {
  return useQuery(
    ['menu-search', filters],
    async () => await getMenuSidebarWithSearchFn(filters)
  );
};
// lib/server/useMenu.ts
export async function getMenus() {
  // Implement the logic to fetch menus (e.g., from the database)
  const data = await getMenuSidebarFn();
  return data.data;
}

export const useCreateMenu = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { alert } = useAlert();

  return useMutation(storeMenuFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('menus');
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

export const useDeleteMenu = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteMenuFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('menus');
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
export const useUpdateMenu = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateMenuFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('menus');
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

export const useUpdateMenuResequence = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateMenuResequenceFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('menu-resequence');
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
