import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient
} from 'react-query';
import {
  deleteKaryawanFn,
  getAllKaryawanFn,
  getAllKaryawanMutasiFn,
  getAllKaryawanResignFn,
  getCutiKaryawanByIdFn,
  getKaryawanBerkasFn,
  getKaryawanByIdFn,
  getKaryawanNomorDarurat,
  getKaryawanPendidikanFn,
  getKaryawanPengalamanKerjaFn,
  getKaryawanVaksinFn,
  storeKaryawanFn,
  storeKaryawanMutasiFn,
  storeKaryawanResignFn,
  updateBerkasFn,
  updateKaryawanFn,
  updateNomorDaruratFn,
  updatePendidikanFn,
  updatePengalamanKerjaFn,
  updateVaksinFn
} from '../apis/karyawan.api';
import { useToast } from '@/hooks/use-toast';
import { IErrorResponse } from '../types/user.type';
import { AxiosError } from 'axios';
import { useState } from 'react';

export const useGetAllKaryawan = (
  filters: {
    filters?: {};
    page?: number;
    sortBy?: string;
    sortDirection?: string;
    limit?: number;
    search?: string; // Kata kunci pencarian
  } = {}
) => {
  return useQuery(
    ['karyawan', filters],
    async () => await getAllKaryawanFn(filters)
  );
};
export const useGetAllKaryawanResign = (
  filters: {
    filters?: {};
    page?: number;
    sortBy?: string;
    sortDirection?: string;
    limit?: number;
    search?: string; // Kata kunci pencarian
  } = {}
) => {
  return useQuery(
    ['karyawan-resign', filters],
    async () => await getAllKaryawanResignFn(filters)
  );
};
export const useGetAllKaryawanMutasi = (
  filters: {
    filters?: {};
    page?: number;
    sortBy?: string;
    sortDirection?: string;
    limit?: number;
    search?: string; // Kata kunci pencarian
  } = {}
) => {
  return useQuery(
    ['karyawan-mutasi', filters],
    async () => await getAllKaryawanMutasiFn(filters)
  );
};
export const useGetKaryawanById = (id?: string) => {
  const [isDataFetched, setIsDataFetched] = useState(false); // Menyimpan status apakah data sudah di-fetch
  const { data, isLoading, refetch } = useQuery(
    ['karyawan', id],
    async () => await getKaryawanByIdFn(id!),
    {
      enabled: !!id && !isDataFetched, // Data hanya akan di-fetch jika id ada dan belum di-fetch
      onSuccess: () => {
        setIsDataFetched(true); // Menandakan bahwa data sudah di-fetch
      },
      onError: () => {
        setIsDataFetched(false); // Set kembali ke false jika terjadi error
      }
    }
  );

  return { data, isLoading, refetch };
};

export const useGetCutiKaryawanById = (id?: string) => {
  return useQuery(
    ['cuti-karyawan', id],
    async () => await getCutiKaryawanByIdFn(id!),
    {
      enabled: !!id
    }
  );
};
export const useCreateKaryawan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storeKaryawanFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('karyawan');
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
export const useCreateKaryawanResign = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storeKaryawanResignFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('karyawan-resign');
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
export const useCreateKaryawanMutasi = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(storeKaryawanMutasiFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('karyawan-mutasi');
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
export const useUpdateKaryawan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateKaryawanFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('karyawan');
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
export const useDeleteKaryawan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(deleteKaryawanFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('karyawan');
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
export const useGetKaryawanNomorDarurat = (id?: number, activeTab?: string) => {
  return useQuery(
    ['nomor-darurat', id],
    async () => await getKaryawanNomorDarurat(id!),
    {
      enabled: !!id && activeTab === 'nomordarurat'
    }
  );
};
export const useGetKaryawanVaksin = (
  id?: number,
  activeTab?: string,
  sortBy: string = 'created_at', // Default sortBy is 'created_at'
  sortDirection: string = 'desc' // Default sortDirection is 'desc'
) => {
  return useQuery(
    ['vaksin', id],
    async () => await getKaryawanVaksinFn(id!, sortBy, sortDirection),
    {
      enabled: !!id && activeTab === 'vaksin'
    }
  );
};
export const useGetKaryawanBerkas = (id?: number, activeTab?: string) => {
  return useQuery(['berkas', id], async () => await getKaryawanBerkasFn(id!), {
    enabled: !!id && activeTab === 'berkas'
  });
};
export const useGetKaryawanPendidikan = (id?: number, activeTab?: string) => {
  return useQuery(
    ['pendidikan', id],
    async () => await getKaryawanPendidikanFn(id!),
    {
      enabled: !!id && activeTab === 'pendidikan' // Hanya aktifkan query jika tab aktif adalah "pendidikan"
    }
  );
};
export const useGetKaryawanPengalamanKerja = (
  id?: number,
  activeTab?: string
) => {
  return useQuery(
    ['pengalaman-kerja', id],
    async () => await getKaryawanPengalamanKerjaFn(id!),
    {
      enabled: !!id && activeTab === 'pengalamankerja' // Hanya aktifkan query jika tab aktif adalah "pengalamankerja"
    }
  );
};

export const useUpdateKaryawanNomorDaruratFn = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateNomorDaruratFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('nomor-darurat');
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
export const useUpdateKaryawanPendidikanFn = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updatePendidikanFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('pendidikan');
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
export const useUpdateKaryawanPengalamanKerjaFn = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updatePengalamanKerjaFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('pengalaman-kerja');
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
export const useUpdateKaryawanVaksinFn = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateVaksinFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('vaksin');
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
export const useUpdateKaryawanBerkasFn = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(updateBerkasFn, {
    onSuccess: () => {
      void queryClient.invalidateQueries('berkas');
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
