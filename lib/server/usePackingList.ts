import { useDispatch } from 'react-redux';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  setProcessed,
  setProcessing
} from '../store/loadingSlice/loadingSlice';
import {
  getPackingListDetailFn,
  getPackingListDetailRincianFn,
  getPackingListHeaderFn,
  storePackingListFn,
  updatePackingListFn
} from '../apis/packinglist.api';
import { AxiosError } from 'axios';
import { IErrorResponse } from '../types/user.type';
import { filterPackingListDetailRincian } from '../types/packinglist.type';
export const useGetPackingListHeader = (
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
  } = {}
) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useQuery(['packinglist', filters], async () => {
    // Only trigger processing if the page is 1
    if (filters.page === 1) {
      dispatch(setProcessing());
    }

    try {
      const data = await getPackingListHeaderFn(filters);
      return data;
    } catch (error) {
      // Show error toast and dispatch processed
      dispatch(setProcessed());
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description: 'Terjadi masalah dengan permintaan Anda.'
      });
      throw error;
    } finally {
      // Regardless of success or failure, we dispatch setProcessed after the query finishes
      dispatch(setProcessed());
    }
  });
};
export const useGetPackingListDetail = (
  filters: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: string;
    filters?: {
      nobukti?: string;
      orderanmuatan_nobukti?: string;
      bongkarke?: string;
      modifiedby?: string;
      created_at?: string;
      updated_at?: string;
    };
  } = {}
) => {
  return useQuery(
    ['packinglist', filters],
    async () => await getPackingListDetailFn(filters),
    {
      enabled: !!filters.filters?.nobukti
    }
  );
};
export const useGetPackingListDetailRincian = (
  filters: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: string;
    filters?: typeof filterPackingListDetailRincian;
  } = {}
) => {
  return useQuery(
    ['packinglist', filters],
    async () => await getPackingListDetailRincianFn(filters),
    {
      enabled: !!filters.filters?.nobukti
    }
  );
};
export const useCreatePackingList = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { toast } = useToast();

  return useMutation(storePackingListFn, {
    // before the mutation fn runs
    onMutate: () => {
      dispatch(setProcessing());
    },
    // on success, invalidate + toast + clear loading
    onSuccess: () => {
      void queryClient.invalidateQueries(['packinglist']);
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
export const useUpdatePackingList = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updatePackingListFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('packinglist');
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
