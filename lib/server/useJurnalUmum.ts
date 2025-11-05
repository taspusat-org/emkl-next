import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  deleteKasGantungFn,
  getKasGantungDetailFn,
  getKasGantungHeaderFn,
  getKasgantungListFn,
  getKasgantungPengembalianFn,
  storeKasGantungFn,
  updateKasGantungFn
} from '../apis/kasgantungheader.api';
import {
  setProcessed,
  setProcessing
} from '../store/loadingSlice/loadingSlice';
import { useToast } from '@/hooks/use-toast';
import { useDispatch } from 'react-redux';
import { AxiosError } from 'axios';
import { IErrorResponse } from '../types/user.type';
import {
  deleteJurnalUmumFn,
  getJurnalUmumDetailFn,
  getJurnalUmumHeaderFn,
  storeJurnalUmumFn,
  updateJurnalUmumFn
} from '../apis/jurnalumumheader.api';

export const useGetJurnalUmumHeader = (
  filters: {
    filters?: {
      nobukti?: string;
      tglbukti?: string;
      keterangan?: string | null;
      tglDari?: string | null;
      tglSampai?: string | null;
    };
    page?: number;
    sortBy?: string;
    sortDirection?: string;
    limit?: number;
    search?: string; // Kata kunci pencarian
  } = {},
  signal?: AbortSignal
) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useQuery(
    ['jurnalumum', filters],
    async () => {
      // Only trigger processing if the page is 1
      if (filters.page === 1) {
        dispatch(setProcessing());
      }

      try {
        const data = await getJurnalUmumHeaderFn(filters, signal);
        return data;
      } catch (error) {
        // Show error toast and dispatch processed
        dispatch(setProcessed());
        throw error;
      } finally {
        // Regardless of success or failure, we dispatch setProcessed after the query finishes
        dispatch(setProcessed());
      }
    },
    {
      enabled: !signal?.aborted
    }
  );
};
export const useGetJurnalUmumDetail = (
  filters: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: string;
    filters?: {
      nobukti?: string;
      tglbukti?: string;
      keterangan?: string | null;
      modifiedby?: string;
      created_at?: string;
      updated_at?: string;
    };
  } = {}
) => {
  return useQuery(
    ['jurnalumum', filters],
    async () => await getJurnalUmumDetailFn(filters),
    {
      enabled: !!filters.filters?.nobukti
    }
  );
};

export const useCreateJurnalUmum = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { toast } = useToast();

  return useMutation(storeJurnalUmumFn, {
    // before the mutation fn runs
    onMutate: () => {
      dispatch(setProcessing());
    },
    // on success, invalidate + toast + clear loading
    onSuccess: () => {
      void queryClient.invalidateQueries(['jurnalumum']);
      toast({
        title: 'Proses Berhasil',
        description: 'Data Berhasil Ditambahkan'
      });
      dispatch(setProcessed());
    },
    // on error, toast + clear loading
    onError: (error: AxiosError) => {
      const err = (error.response?.data as IErrorResponse) ?? {};
      toast({
        variant: 'destructive',
        title: err.message ?? 'Gagal',
        description: 'Terjadi masalah dengan permintaan Anda.'
      });
      dispatch(setProcessed());
    }
    // alternatively: always clear loading, whether success or fail
    // onSettled: () => {
    //   dispatch(clearProcessing());
    // }
  });
};
export const useGetKasGantungHeaderList = (
  params: { dari: string; sampai: string } = { dari: '', sampai: '' },
  popOver: boolean
) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useQuery(
    ['kasgantungheaderlist', params],
    async () => {
      try {
        const data = await getKasgantungListFn(params.dari, params.sampai);
        return data;
      } catch (error) {
        // Show error toast
        toast({
          variant: 'destructive',
          title: 'Gagal',
          description: 'Terjadi masalah dengan permintaan Anda.'
        });
        throw error; // Re-throw to ensure the query is marked as failed
      }
    },
    {
      enabled: popOver // Fetch hanya jika popOver true dan id tidak kosong
    }
  );
};
export const useGetKasGantungHeaderPengembalian = (
  params: { dari: string; sampai: string; id: string } = {
    dari: '',
    sampai: '',
    id: ''
  },
  popOver: boolean // Menambahkan argumen popOver untuk kontrol kondisi fetch
) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useQuery(
    ['kasgantungheaderpengembalian', params],
    async () => {
      try {
        const data = await getKasgantungPengembalianFn(
          params.id,
          params.dari,
          params.sampai
        );
        return data;
      } catch (error) {
        // Show error toast
        toast({
          variant: 'destructive',
          title: 'Gagal',
          description: 'Terjadi masalah dengan permintaan Anda.'
        });
        throw error; // Re-throw to ensure the query is marked as failed
      }
    },
    {
      enabled: popOver && params.id !== '' // Fetch hanya jika popOver true dan id tidak kosong
    }
  );
};
export const useUpdateJurnalUmum = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateJurnalUmumFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('jurnalumum');
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
export const useDeleteJurnalUmum = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteJurnalUmumFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('jurnalumum');
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
