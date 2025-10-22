import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  deletePengeluaranFn,
  getPengeluaranDetailFn,
  getPengeluaranHeaderFn,
  getPengeluaranListFn,
  storePengeluaranFn,
  updatePengeluaranFn
} from '../apis/pengeluaranheader.api';
import {
  setProcessed,
  setProcessing
} from '../store/loadingSlice/loadingSlice';
import { useToast } from '@/hooks/use-toast';
import { useDispatch } from 'react-redux';
import { AxiosError } from 'axios';
import { IErrorResponse } from '../types/user.type';
import { useAlert } from '../store/client/useAlert';
import { useFormError } from '../hooks/formErrorContext';

export const useGetPengeluaranHeader = (
  filters: {
    filters?: {
      nobukti?: string;
      tglbukti?: string;
      relasi_id?: string | null;
      keterangan?: string | null;
      bank_id?: number | string | null;
      postingdari?: string | null;
      coakredit?: string | null;
      dibayarke?: string | null;
      alatbayar_id?: string | null;
      nowarkat?: string | null;
      tgljatuhtempo?: string | null;
      daftarbank_id?: string | null;
      statusformat?: string | null;
      tglDari?: string | null;
      tglSampai?: string | null;
      created_at?: string | null;
      updated_at?: string | null;
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
    ['pengeluaran', filters],
    async () => {
      // Only trigger processing if the page is 1
      if (filters.page === 1) {
        dispatch(setProcessing());
      }

      try {
        const data = await getPengeluaranHeaderFn(filters, signal);
        return data;
      } catch (error) {
        // Show error toast and dispatch processed
        dispatch(setProcessed());
        // toast({
        //   variant: 'destructive',
        //   title: 'Gagal',
        //   description: 'Terjadi masalah dengan permintaan Anda.'
        // });
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
      },
      enabled: !signal?.aborted
    }
  );
};
export const useGetPengeluaranDetail = (
  filters: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: string;
    filters?: {
      nobukti?: string;
      coadebet?: string;
      coadebet_text?: string;
      keterangan?: string;
      nominal?: string;
      dpp?: string;
      noinvoiceemkl?: string;
      tglinvoiceemkl?: string;
      nofakturpajakemkl?: string;
      perioderefund?: string;
      modifiedby?: string;
      created_at?: string;
      updated_at?: string;
    };
  } = {}
) => {
  return useQuery(
    ['pengeluaran', filters],
    async () => await getPengeluaranDetailFn(filters),
    {
      enabled: !!filters.filters?.nobukti
    }
  );
};

export const useCreatePengeluaran = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { alert } = useAlert();
  const { setError } = useFormError();

  return useMutation(storePengeluaranFn, {
    // before the mutation fn runs
    onMutate: () => {
      dispatch(setProcessing());
    },
    // on success, invalidate + toast + clear loading
    onSuccess: () => {
      void queryClient.invalidateQueries(['pengeluaran']);
      //   toast({
      //     title: 'Proses Berhasil',
      //     description: 'Data Berhasil Ditambahkan'
      //   });
      dispatch(setProcessed());
    },
    // on error, toast + clear loading
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;
      if (errorResponse !== undefined) {
        // Menangani error berdasarkan path
        const errorFields = Array.isArray(errorResponse.message)
          ? errorResponse.message
          : [];

        if (errorResponse.statusCode === 400) {
          // Iterasi error message dan set error di form
          errorFields?.forEach((err: { path: string[]; message: string }) => {
            const path = err.path[0]; // Ambil path error pertama (misalnya 'nama', 'akuntansi_id')
            setError(path, err.message); // Update error di context
          });
        } else {
          alert({
            variant: 'danger',
            submitText: 'OK',
            title: errorResponse.message ?? 'Gagal'
          });
        }
      }
      // toast({
      //   variant: 'destructive',
      //   title: err.message ?? 'Gagal',
      //   description: 'Terjadi masalah dengan permintaan Anda.'
      // });
      dispatch(setProcessed());
    }
    // alternatively: always clear loading, whether success or fail
    // onSettled: () => {
    //   dispatch(clearProcessing());
    // }
  });
};
export const useGetPengeluaranHeaderList = (
  params: { dari: string; sampai: string } = { dari: '', sampai: '' },
  popOver: boolean
) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useQuery(
    ['pengeluaranheaderlist', params],
    async () => {
      try {
        const data = await getPengeluaranListFn(params.dari, params.sampai);
        return data;
      } catch (error) {
        // Show error toast
        // toast({
        //   variant: 'destructive',
        //   title: 'Gagal',
        //   description: 'Terjadi masalah dengan permintaan Anda.'
        // });
        throw error; // Re-throw to ensure the query is marked as failed
      }
    },
    {
      enabled: popOver // Fetch hanya jika popOver true dan id tidak kosong
    }
  );
};
export const useUpdatePengeluaran = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updatePengeluaranFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('pengeluaran');
      //   toast({
      //     title: 'Proses Berhasil.',
      //     description: 'Data Berhasil Diubah.'
      //   });
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
export const useDeletePengeluaran = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deletePengeluaranFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('pengeluaran');
      //   toast({
      //     title: 'Proses Berhasil.',
      //     description: 'Data Berhasil Dihapus.'
      //   });
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as IErrorResponse;
      if (errorResponse !== undefined) {
        // toast({
        //   variant: 'destructive',
        //   title: errorResponse.message ?? 'Gagal',
        //   description: 'Terjadi masalah dengan permintaan Anda.'
        // });
      }
    }
  });
};
