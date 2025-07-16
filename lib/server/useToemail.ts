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
  deleteToemailFn,
  getToemailFn,
  storeToemailFn,
  updateToemailFn
} from '../apis/toemail.api';

export const useGetAllToemail = (
  filters: {
    filters?: {
      nama?: string; // Filter berdasarkan class
      email?: string; // Filter berdasarkan method
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
    ['toemail', filters],
    async () => await getToemailFn(filters)
  );
};

export const useCreateToemail = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storeToemailFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('toemail');
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
export const useUpdateToemail = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateToemailFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('toemail');
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
export const useDeleteToemail = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteToemailFn, {
    onSuccess: (deletedId) => {
      // Mengupdate cache secara langsung
      queryClient.setQueryData('toemail', (oldData: any) => {
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
