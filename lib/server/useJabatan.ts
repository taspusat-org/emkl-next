import { useToast } from '@/hooks/use-toast';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from 'react-query';
import { AxiosError } from 'axios';
import { IErrorResponse } from '../types/user.type';
import {
  deleteJabatanFn,
  getJabatanFn,
  storeJabatanFn,
  updateJabatanFn
} from '../apis/jabatan.api';

export const useGetAllJabatan = (
  filters: {
    filters?: {
      nama?: string; // Filter berdasarkan class
      keterangan?: string; // Filter berdasarkan method
      modifiedby?: string; // Filter berdasarkan nama
    };
    page?: number;
    sortBy?: string;
    sortDirection?: string;
    limit?: number;
    search?: string; // Kata kunci pencarian
  } = {}
) => {
  return useQuery(
    ['jabatan', filters],
    async () => await getJabatanFn(filters)
  );
};

export const useCreateJabatan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storeJabatanFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('jabatan');
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
export const useUpdateJabatan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateJabatanFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('jabatan');
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
export const useDeleteJabatan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteJabatanFn, {
    onSuccess: (deletedId) => {
      // Mengupdate cache secara langsung
      queryClient.setQueryData('jabatan', (oldData: any) => {
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
