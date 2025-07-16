import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  deleteParameterFn,
  getParameterFn,
  storeParameterFn,
  updateParameterFn
} from '../apis/parameter.api';
import { AxiosError } from 'axios';
import { IErrorResponse } from '../types/user.type';

export const useCreateParameter = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storeParameterFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('parameter');
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
export const useUpdateParameter = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateParameterFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('parameter');
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

export const useDeleteParameter = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteParameterFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('parameter');
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

export const useGetAllParameter = (
  filters: {
    filters?: {
      grp?: string; // Filter berdasarkan class
      subgrp?: string; // Filter berdasarkan method
      text?: string; // Filter berdasarkan nama
    };
    page?: number;
    search?: string; // Kata kunci pencarian
    sortBy?: string;
    sortDirection?: string;
    limit?: number;
  } = {} // Default to an empty object if no filters are provided
) => {
  return useQuery(
    ['parameter', filters],
    async () => await getParameterFn(filters)
  );
};
