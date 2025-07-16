import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  approveCutiFn,
  cancelCutiFn,
  getApprovalCutiFn,
  GetCutiApprovalFn,
  GetCutiDetailFn,
  getCutiFn,
  rejectCutiFn,
  storeCutiFn,
  updateCutiFn
} from '../apis/cuti.api';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import { IErrorResponse } from '../types/user.type';

export const useGetCuti = (
  filters: {
    filters?: {
      tanggalcuti?: string; // Filter berdasarkan class
      alasancuti?: string; // Filter berdasarkan method
    };
    page?: number;
    sortBy?: string;
    sortDirection?: string;
    limit?: number;
    search?: string; // Kata kunci pencarian
    year?: string; // Kata kunci pencarian
  } = {}
) => {
  return useQuery(['cutis', filters], async () => await getCutiFn(filters));
};
export const useGetApprovalCuti = (
  filters: {
    filters?: {
      tanggalcuti?: string; // Filter berdasarkan class
      alasancuti?: string; // Filter berdasarkan method
    };
    page?: number;
    sortBy?: string;
    sortDirection?: string;
    limit?: number;
    search?: string; // Kata kunci pencarian
  } = {}
) => {
  return useQuery(
    ['approval-cuti', filters],
    async () => await getApprovalCutiFn(filters)
  );
};
export const useCreateCuti = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storeCutiFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('cutis');
      toast({
        title: 'Proses Berhasil',
        description: 'Data Berhasil Ditambahkan'
      });
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;

      // Periksa jika errorResponse ada, dan hanya tampilkan toast jika data tersebut ada
      if (errorResponse && errorResponse.message) {
        toast({
          variant: 'destructive',
          title: errorResponse.message ?? 'Gagal',
          description: 'Terjadi masalah dengan permintaan Anda.'
        });
      } else {
        // Menangani error lainnya, jika response tidak ada
        toast({
          variant: 'destructive',
          title: 'Gagal',
          description: 'Terjadi kesalahan tak terduga.'
        });
      }

      // Pastikan tidak ada error yang muncul di console kecuali memang benar-benar error di server
      if (process.env.NODE_ENV === 'development') {
        console.error('Axios Error:', error); // Hanya tampilkan error di dev mode
      }
    }
  });
};

export const useUpdateCuti = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateCutiFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('approval-cuti');
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
export const useGetCutiDetail = (id?: string) => {
  return useQuery(['detail', id], async () => await GetCutiDetailFn(id!), {
    enabled: !!id
  });
};
export const useGetCutiApproval = (id?: string) => {
  return useQuery(['approval', id], async () => await GetCutiApprovalFn(id!), {
    enabled: !!id
  });
};
export const useApproveCuti = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(approveCutiFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('approval-cuti');
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
export const useCancelCuti = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(cancelCutiFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('approval-cuti');
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
export const useCancelCutiApproval = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(cancelCutiFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('approval-cuti');
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
export const useRejectCuti = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(rejectCutiFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('approval-cuti');
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
