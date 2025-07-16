import { useQuery } from 'react-query';
import {
  getRekapitulasiKehadiranFn,
  getRekapKehadiranFn
} from '../apis/kehadiran.api';
import { useDispatch } from 'react-redux';
import {
  setProcessed,
  setProcessing
} from '../store/loadingSlice/loadingSlice';
export const useGetRekapitulasiKehadiran = (
  params: any,
  activeTab?: string
) => {
  const dispatch = useDispatch(); // Use dispatch here

  return useQuery(
    ['rekapitulasi-kehadiran', params],
    async () => {
      const {
        pidcabang,
        tanggalDari,
        tanggalSampai,
        idabsenFrom,
        idabsenTo,
        search,
        sortBy,
        sortDirection
      } = params;
      dispatch(setProcessing());

      // Pastikan semua parameter yang diperlukan ada
      if (!pidcabang || !tanggalDari || !tanggalSampai) {
        throw new Error('Parameter yang diperlukan tidak lengkap');
      }

      // Pastikan fungsi getRekapitulasiKehadiranFn mengembalikan data yang diharapkan
      const data = await getRekapitulasiKehadiranFn(
        pidcabang,
        tanggalDari,
        tanggalSampai,
        idabsenFrom,
        idabsenTo,
        search,
        sortBy,
        sortDirection
      );
      dispatch(setProcessed());

      return data;
    },
    {
      // Query hanya akan dijalankan jika parameter yang penting ada
      enabled: !!params.tanggalDari && !!params.tanggalSampai,
      onError: () => {
        dispatch(setProcessed()); // Ensure to set processed even if an error occurs
      },
      onSettled: () => {
        dispatch(setProcessed()); // Ensure to set processed in both success or error cases
      }
    }
  );
};

export const useGetRekapKehadiran = (params: any, activeTab?: string) => {
  const dispatch = useDispatch(); // Use dispatch here
  return useQuery(
    ['rekap-kehadiran', params],
    async () => {
      const {
        pidcabang,
        tanggalDari,
        tanggalSampai,
        idabsenFrom,
        idabsenTo,
        search,
        sortBy,
        sortDirection
      } = params;
      dispatch(setProcessing());

      // Make sure the function getRekapitulasiKehadiranFn returns the data as expected
      const data = await getRekapKehadiranFn(
        pidcabang,
        tanggalDari,
        tanggalSampai,
        idabsenFrom,
        idabsenTo,
        search,
        sortBy,
        sortDirection
      );
      dispatch(setProcessed());

      return data;
    },
    {
      // Use the `enabled` option correctly here
      enabled: !!params.tanggalDari && !!params.tanggalSampai,
      onError: () => {
        dispatch(setProcessed()); // Ensure to set processed even if an error occurs
      },
      onSettled: () => {
        dispatch(setProcessed()); // Ensure to set processed in both success or error cases
      }
    }
  );
};
