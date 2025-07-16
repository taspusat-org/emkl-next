import { api2 } from '../utils/AxiosInstance';

export const getRekapKeterlambatanFn = async (
  pidcabang: number = 26,
  tanggalDari: string,
  tanggalSampai: string,
  idabsenFrom: string,
  idabsenTo: string,
  search: string = '',
  sortBy: string = 'namakaryawan',
  sortDirection: 'asc' | 'desc' = 'asc'
) => {
  try {
    // Menggunakan GET request dengan query params
    const response = await api2.get(`/rekapketerlambatan/`, {
      params: {
        pidcabang,
        tanggalDari,
        tanggalSampai,
        idabsenFrom,
        idabsenTo,
        search, // Pencarian berdasarkan nama karyawan
        sortBy: sortBy, // Kolom yang digunakan untuk pengurutan
        sortDirection: sortDirection // Arah pengurutan
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching rekap kehadiran:', error);
    throw new Error('Failed to fetch rekap kehadiran');
  }
};
export const exportRekapKeterlambatanFn = async (
  pidcabang: number = 26,
  tanggalDari: string,
  tanggalSampai: string,
  idabsenFrom: string,
  idabsenTo: string,
  search: string = '',
  sortBy: string = 'namakaryawan',
  sortDirection: 'asc' | 'desc' = 'asc'
): Promise<any> => {
  try {
    const response = await api2.get('/rekapketerlambatan/export', {
      params: {
        pidcabang,
        tanggalDari,
        tanggalSampai,
        idabsenFrom,
        idabsenTo,
        search, // Pencarian berdasarkan nama karyawan
        sortBy: sortBy, // Kolom yang digunakan untuk pengurutan
        sortDirection: sortDirection // Arah pengurutan
      },
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
