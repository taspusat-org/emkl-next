import { GetParams } from '../types/all.type';
import {
  IAllKaryawan,
  IAllKaryawanBerkas,
  IAllKaryawanNomorDarurat,
  IAllKaryawanPendidikan,
  IAllKaryawanPengalamanKerja,
  IAllKaryawanVaksin,
  IKaryawan
} from '../types/karyawan.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';
import { KaryawanInput } from '../validations/karyawan.validation';
import { KaryawanResignInput } from '../validations/karyawanresign.validation';
interface updateKaryawanParams {
  id: number;
  fields: KaryawanInput;
}

export const getAllKaryawanFn = async (
  filters: GetParams = {}
): Promise<IAllKaryawan> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/karyawan', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching ACOS data:', error);
    throw new Error('Failed to fetch ACOS data');
  }
};
export const getAllKaryawanResignFn = async (
  filters: GetParams = {}
): Promise<IAllKaryawan> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/karyawan-resign', {
      params: queryParams
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching ACOS data:', error);
    throw new Error('Failed to fetch ACOS data');
  }
};
export const getAllKaryawanMutasiFn = async (
  filters: GetParams = {}
): Promise<IAllKaryawan> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/karyawan-mutasi', {
      params: queryParams
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching ACOS data:', error);
    throw new Error('Failed to fetch ACOS data');
  }
};
export const storeKaryawanFn = async (payload: any) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (value instanceof File) {
      formData.append(key, value);
    } else if (value instanceof Date) {
      // Cek jika nilai Date kosong (null atau undefined)
      if (isNaN(value.getTime())) {
        // getTime() mengembalikan NaN jika nilai Date invalid
        return; // Lewati penambahan key jika nilai Date tidak valid
      }
      formData.append(key, value.toISOString());
    } else if (typeof value === 'object') {
      // Ubah objek (misalnya filter) menjadi string JSON
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });

  const response = await api2.post('/karyawan', formData);
  return response.data;
};
export const exportKaryawanFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/karyawan/export', {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
export const exportKaryawanResignFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/karyawan-resign/export', {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};

export const exportKaryawanBySelectFn = async (ids: { id: number }[]) => {
  try {
    const response = await api2.post('/karyawan/export-byselect', ids, {
      responseType: 'blob'
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
export const exportKaryawanResignBySelectFn = async (ids: { id: number }[]) => {
  try {
    const response = await api2.post('/karyawan-resign/export-byselect', ids, {
      responseType: 'blob'
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
export const storeKaryawanResignFn = async (fields: KaryawanResignInput) => {
  const response = await api2.post(`/karyawan-resign`, fields);
  return response.data;
};
export const storeKaryawanMutasiFn = async (fields: KaryawanResignInput) => {
  const response = await api2.post(`/karyawan-mutasi`, fields);
  return response.data;
};
export const updateKaryawanFn = async ({ id, fields }: any) => {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (value instanceof File) {
      formData.append(key, value);
    } else if (value instanceof Date) {
      formData.append(key, value.toISOString());
    } else if (typeof value === 'object') {
      // Ubah objek (misalnya filter) menjadi string JSON
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });
  const response = await api2.put(`/karyawan/${id}`, formData);

  return response.data;
};
export const updateProfileKaryawanFn = async ({ id, fields }: any) => {
  const response = await api2.put(`/karyawan/profile/${id}`, fields);
  return response.data;
};

export const deleteKaryawanFn = async (id: string) => {
  try {
    const response = await api2.delete(`/karyawan/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

export const updateNomorDaruratFn = async ({ id, fields }: any) => {
  const response = await api2.put(`/karyawan-nomordarurat/${id}`, fields);

  return response.data;
};
export const updatePendidikanFn = async ({ id, fields }: any) => {
  const response = await api2.put(`/karyawan-pendidikan/${id}`, fields);

  return response.data;
};
export const updatePengalamanKerjaFn = async ({ id, fields }: any) => {
  const response = await api2.put(`/karyawan-pengalamankerja/${id}`, fields);

  return response.data;
};
export const updateVaksinFn = async ({ id, fields }: any) => {
  const formData = new FormData();

  fields.forEach((item: any, index: number) => {
    formData.append(`data[${index}][id]`, item.id);
    formData.append(`data[${index}][karyawan_id]`, item.karyawan_id);
    formData.append(`data[${index}][tglvaksin]`, item.tglvaksin);
    formData.append(`data[${index}][keterangan]`, item.keterangan);
    formData.append(`data[${index}][statusaktif]`, item.statusaktif);
    formData.append(`data[${index}][info]`, item.info);

    item.filefoto.forEach((file: any, fileIndex: any) => {
      if (file) {
        formData.append(`data[${index}][filefoto][${fileIndex}]`, file);
      }
    });
  });

  // Now send the formData via the POST request
  const response = await api2.put(`/karyawan-vaksin/${id}`, formData);

  return response.data;
};
export const updateBerkasFn = async ({ id, fields }: any) => {
  const formData = new FormData();

  fields.forEach((item: any, index: number) => {
    formData.append(`data[${index}][id]`, item.id);
    formData.append(`data[${index}][karyawan_id]`, item.karyawan_id); // Ensure karyawan_id is always added
    formData.append(`data[${index}][jenisberkas_id]`, item.jenisberkas_id);
    formData.append(`data[${index}][keterangan]`, item.keterangan);
    formData.append(`data[${index}][statusaktif]`, item.statusaktif);
    formData.append(`data[${index}][info]`, item.info);

    // Check if fileberkas exists and has files, else append empty array
    item.fileberkas.forEach((file: any, fileIndex: any) => {
      if (file) {
        formData.append(`data[${index}][fileberkas][${fileIndex}]`, file);
      }
    });
  });

  // Now send the formData via the POST request
  const response = await api2.put(`/karyawan-berkas/${id}`, formData);

  return response.data;
};

export const getKaryawanByIdFn = async (id: string): Promise<IKaryawan> => {
  const response = await api2.get(`/karyawan/${id}`);

  return response.data;
};
export const getCutiKaryawanByIdFn = async (id: string) => {
  const response = await api2.get(`/karyawan/cutikaryawan/${id}`);

  return response.data;
};
export const getKaryawanNomorDarurat = async (
  id: number
): Promise<IAllKaryawanNomorDarurat> => {
  const response = await api2.get(`/karyawan-nomordarurat/${id}`);

  return response.data;
};

export const getKaryawanPengalamanKerjaFn = async (
  id: number
): Promise<IAllKaryawanPengalamanKerja> => {
  const response = await api2.get(`/karyawan-pengalamankerja/${id}`);

  return response.data;
};
export const getKaryawanVaksinFn = async (
  id: number,
  sortBy: string = 'created_at', // Default sortBy is 'created_at'
  sortDirection: string = 'desc' // Default sortDirection is 'desc'
): Promise<IAllKaryawanVaksin> => {
  const response = await api2.get(`/karyawan-vaksin/${id}`, {
    params: { sortBy, sortDirection } // Add sorting parameters in the request
  });

  return response.data;
};
export const checkDeleteKaryawanFn = async (fields: any) => {
  const response = await api2.post(`/karyawan/check-delete`, fields);
  return response.data;
};
export const getKaryawanPendidikanFn = async (
  id: number
): Promise<IAllKaryawanPendidikan> => {
  const response = await api2.get(`/karyawan-pendidikan/${id}`);

  return response.data;
};
export const getKaryawanBerkasFn = async (
  id: number
): Promise<IAllKaryawanBerkas> => {
  const response = await api2.get(`/karyawan-berkas/${id}`);

  return response.data;
};
export const reportKaryawanResignBySelectFn = async (ids: { id: number }[]) => {
  try {
    // Sending the data in the correct format to the NestJS API
    const response = await api2.post(`/karyawan-resign/report-byselect`, ids);

    return response.data; // Assuming the API returns the data properly
  } catch (error) {
    console.error('Error in sending data:', error);
    throw new Error('Failed to send data to the API');
  }
};
export const reportKaryawanBySelectFn = async (ids: { id: number }[]) => {
  try {
    // Sending the data in the correct format to the NestJS API
    const response = await api2.post(`/karyawan/report-byselect`, ids);

    return response.data; // Assuming the API returns the data properly
  } catch (error) {
    console.error('Error in sending data:', error);
    throw new Error('Failed to send data to the API');
  }
};
