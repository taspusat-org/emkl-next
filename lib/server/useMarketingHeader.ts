import { AxiosError } from 'axios';
import { useDispatch } from 'react-redux';
import { useToast } from '@/hooks/use-toast';
import { IErrorResponse } from '../types/user.type';
import {
  deleteMarketingFn,
  getMarketingBiayaFn,
  getMarketingDetailFn,
  getMarketingHeaderFn,
  getMarketingManagerFn,
  getMarketingOrderanFn,
  getMarketingProsesFeeFn,
  storeMarketingDetailFn,
  storeMarketingFn,
  updateMarketingFn
} from '../apis/marketingheader.api';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  setProcessed,
  setProcessing
} from '../store/loadingSlice/loadingSlice';
import { useFormError } from '../hooks/formErrorContext';

export const useGetMarketingHeader = (
  filters: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortDirection?: string;
    search?: string; // Kata kunci pencarian
    filters?: {
      nama?: string;
      keterangan?: string | null;
      statusaktif_nama?: string | null;
      email?: string | null;
      karyawan_nama?: string | null;
      tglmasuk?: string | null;
      cabang_nama?: string | null;
      statustarget_nama?: string | null;
      statusbagifee_nama?: string | null;
      statusfeemanager_nama?: string | null;
      marketingmanager_nama?: string | null;
      marketinggroup_nama?: string | null;
      statusprafee_nama?: string | null;
      modifiedby?: string | null;
      created_at?: string;
      updated_at?: string;
    };
  } = {}
) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useQuery(
    ['marketing', filters],
    async () => {
      // Only trigger processing if the page is 1
      if (filters.page === 1) {
        dispatch(setProcessing());
      }

      try {
        const data = await getMarketingHeaderFn(filters);
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
    },
    {
      // Optionally, you can use the `onSettled` callback if you want to reset the processing state after query success or failure
      onSettled: () => {
        if (filters.page === 1) {
          dispatch(setProcessed());
        }
      }
    }
  );
};

export const useGetMarketingOrderan = (
  id?: number,
  activeTab?: string,
  tabFromValues?: string,
  filters: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: string;
    filters?: {
      marketing_nama?: string;
      nama?: string;
      keterangan?: string;
      singkatan?: string;
      statusaktif_nama?: string;
    };
  } = {}
) => {
  return useQuery(
    ['marketingorderan', id, filters],
    async () => await getMarketingOrderanFn(id!, filters),
    {
      keepPreviousData: true,
      enabled:
        !!id ||
        activeTab === 'marketingorderan' ||
        tabFromValues === 'formMarketingOrderan'
    }
  );
};

export const useGetMarketingBiaya = (
  id?: number,
  activeTab?: string,
  tabFromValues?: string,
  filters: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: string;
    filters?: {
      marketing_nama?: string;
      jenisbiayamarketing_nama?: string;
      nominal?: string;
      statusaktif_nama?: string;
    };
  } = {}
) => {
  return useQuery(
    ['marketingbiaya', id, filters],
    async () => await getMarketingBiayaFn(id!, filters),
    {
      enabled:
        !!id ||
        activeTab === 'marketingbiaya' ||
        tabFromValues === 'formMarketingBiaya'
    }
  );
};

export const useGetMarketingManager = (
  id?: number,
  activeTab?: string,
  tabFromValues?: string,
  filters: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: string;
    filters?: {
      marketing_nama?: string;
      managermarketing_nama?: string;
      tglapproval?: string;
      statusapproval?: string;
      userapproval?: string;
      statusaktif_nama?: string;
    };
  } = {}
) => {
  // console.log('test di use marketing manager', id, 'activeTab', activeTab);

  return useQuery(
    ['marketingmanager', id, filters],
    async () => await getMarketingManagerFn(id!, filters),
    {
      enabled:
        !!id ||
        activeTab === 'marketingmanager' ||
        tabFromValues === 'formMarketingManager'
    }
  );
};

export const useGetMarketingProsesFee = (
  id?: number,
  activeTab?: string,
  tabFromValues?: string,
  filters: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: string;
    filters?: {
      marketing_nama?: string;
      jenisprosesfee_nama?: string;
      statuspotongbiaya_nama?: string;
      statusaktif_nama?: string;
    };
  } = {}
) => {
  return useQuery(
    ['marketingprosesfee', id, filters],
    async () => await getMarketingProsesFeeFn(id!, filters),
    {
      enabled:
        !!id ||
        activeTab === 'marketingprosesfee' ||
        tabFromValues === 'formMarketingProsesFee'
    }
  );
};

export const useGetMarketingDetail = (
  id?: number,
  filters: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: string;
    filters?: {
      marketing_nama?: string;
      nominalawal?: string;
      nominalakhir?: string;
      persentase?: string;
      statusaktif_nama?: string;
    };
  } = {}
) => {
  return useQuery(
    ['marketingdetail', id, filters],
    async () => await getMarketingDetailFn(id!, filters),
    {
      enabled: !!id
    }
  );
};

export const useCreateMarketing = () => {
  const { setError } = useFormError(); // Mengambil setError dari context
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { toast } = useToast();

  return useMutation(storeMarketingFn, {
    // before the mutation fn runs
    onMutate: () => {
      dispatch(setProcessing());
    },
    onSuccess: () => {
      // on success, invalidate + toast + clear loading
      void queryClient.invalidateQueries(['marketing']);
      dispatch(setProcessed());
    },
    onError: (error: AxiosError) => {
      const errorResponse = (error.response?.data as IErrorResponse) ?? {};
      dispatch(setProcessed());

      if (errorResponse !== undefined) {
        // Menangani error berdasarkan path
        const errorFields = errorResponse.message || [];

        if (errorResponse.statusCode === 400) {
          // Iterasi error message dan set error di form
          errorFields?.forEach((err: { path: string[]; message: string }) => {
            const path = err.path[0]; // Ambil path error pertama (misalnya 'nama', 'akuntansi_id')
            console.log('path', path);
            setError(path, err.message); // Update error di context
          });
        } else {
          toast({
            variant: 'destructive',
            title: errorResponse.message ?? 'Gagal',
            description: 'Terjadi masalah dengan permintaan Anda'
          });
        }
      }
    },
    onSettled: () => {
      dispatch(setProcessed());
    }
  });
};

export const useCreateMarketingDetail = () => {
  const { setError } = useFormError();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { toast } = useToast();

  return useMutation(storeMarketingDetailFn, {
    onMutate: () => {
      dispatch(setProcessing());
    },
    onSuccess: () => {
      void queryClient.invalidateQueries(['marketingdetail']);
      dispatch(setProcessed());
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;
      if (errorResponse !== undefined) {
        const errorFields = errorResponse.message || [];
        if (errorResponse.statusCode === 400) {
          // Iterasi error message dan set error di form
          errorFields?.forEach((err: { path: string[]; message: string }) => {
            const path = err.path[0];
            console.log('path', path);
            setError(path, err.message);
          });
        } else {
          toast({
            variant: 'destructive',
            title: errorResponse.message ?? 'Gagal',
            description: 'Terjadi masalah dengan permintaan Anda'
          });
        }
      }
    },
    onSettled: () => {
      dispatch(setProcessed());
    }
  });
};

export const useUpdateMarketing = () => {
  const { setError } = useFormError(); // Mengambil setError dari context
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const dispatch = useDispatch();

  return useMutation(updateMarketingFn, {
    onMutate: () => {
      dispatch(setProcessing());
    },
    onSuccess: () => {
      void queryClient.invalidateQueries('marketing');
      dispatch(setProcessed());
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;

      if (errorResponse !== undefined) {
        const errorFields = errorResponse.message || [];

        if (errorResponse.statusCode === 400) {
          // Iterasi error message dan set error di form
          errorFields?.forEach((err: { path: string[]; message: string }) => {
            const path = err.path[0]; // Ambil path error pertama (misalnya 'nama', 'akuntansi_id')
            console.log('path', path);
            setError(path, err.message); // Update error di context
          });
        } else {
          toast({
            variant: 'destructive',
            title: errorResponse.message ?? 'Gagal',
            description: 'Terjadi masalah dengan permintaan Anda'
          });
        }
      }
    },
    onSettled: () => {
      dispatch(setProcessed());
    }
  });
};

export const useDeleteMarketing = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteMarketingFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('marketing');
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;
      if (errorResponse !== undefined) {
        toast({
          variant: 'destructive',
          title: errorResponse.message ?? 'Gagal',
          description: 'Terjadi masalah dengan permintaan Anda'
        });
      }
    }
  });
};
