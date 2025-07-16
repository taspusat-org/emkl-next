import { GetParams } from '../types/all.type';
import { IAllCuti, ICutiApproval, IDetailCuti } from '../types/cuti.type';
import { IAllError } from '../types/error.type';
import { IIzinApproval } from '../types/izin.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';
import { CutiInput } from '../validations/cuti.validation';
interface UpdateCutiParams {
  id: string;
  fields: any;
}
interface ICutiBody {
  cutiId: number;
  karyawanId: number;
}
export const getCutiFn = async (filters: GetParams = {}): Promise<IAllCuti> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/cuti', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching ACOS data:', error);
    throw new Error('Failed to fetch ACOS data');
  }
};
export const getApprovalCutiFn = async (
  filters: GetParams = {}
): Promise<IAllCuti> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/cuti/approval-cuti', {
      params: queryParams
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching ACOS data:', error);
    throw new Error('Failed to fetch ACOS data');
  }
};
export const approveCutiFn = async (fields: ICutiBody) => {
  const response = await api2.put(`/cutiapproval/approve`, fields);
  return response.data;
};
export const checkApproveCutiFn = async (fields: any) => {
  const response = await api2.post(`/cuti/check-approval`, fields);
  return response.data;
};
export const checkAddCutiFn = async (fields: any) => {
  const response = await api2.post(`/cuti/check-cuti`, fields);
  return response.data;
};
export const checkRejectCutiFn = async (fields: any) => {
  const response = await api2.post(`/cuti/check-reject`, fields);
  return response.data;
};
export const checkCancelCutiFn = async (fields: any) => {
  const response = await api2.post(`/cuti/check-cancel`, fields);
  return response.data;
};
export const checkCancelCutiKaryawanFn = async (fields: any) => {
  const response = await api2.post(`/cuti/check-cancel-karyawan`, fields);
  return response.data;
};
export const rejectCutiFn = async (fields: ICutiBody) => {
  await api2.put(`/cutiapproval/reject`, fields);
};
export const cancelCutiFn = async (cutiId: number) => {
  await api2.put(`/cuti/cancel-cuti/${cutiId}`);
};
export const storeCutiFn = async (payload: CutiInput) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value) && value.every((item) => item instanceof File)) {
      // Jika nilai adalah array yang berisi file
      value.forEach((file, index) => {
        formData.append(`${key}[${index}]`, file); // Menambahkan file ke FormData
      });
    } else if (value instanceof File) {
      formData.append(key, value); // Jika hanya satu file
    } else if (value instanceof Date) {
      // Cek jika nilai Date kosong (null atau undefined)
      if (isNaN(value.getTime())) {
        // getTime() mengembalikan NaN jika nilai Date tidak valid
        return; // Lewati penambahan key jika nilai Date tidak valid
      }
      formData.append(key, value.toISOString());
    } else if (typeof value === 'object') {
      // Jika nilai adalah array atau objek, kita periksa lebih lanjut
      if (Array.isArray(value)) {
        // Jika array (misalnya detailCuti), kita stringify tiap elemen
        formData.append(key, JSON.stringify(value));
      } else {
        // Ubah objek (misalnya filter) menjadi string JSON
        formData.append(key, JSON.stringify(value));
      }
    } else {
      formData.append(key, String(value)); // Untuk tipe lainnya, cukup konversi ke string
    }
  });

  try {
    // Make the POST request using FormData
    const response = await api2.post('/cuti', formData);

    return response.data;
  } catch (error) {
    console.error('Error during Cuti submission:', error);
    throw error; // Rethrow or handle the error as needed
  }
};

export const GetCutiDetailFn = async (id: string): Promise<IDetailCuti[]> => {
  const response = await api2.get(`/cutidetail/${id}`);

  return response.data;
};
export const GetCutiApprovalFn = async (
  id: string
): Promise<ICutiApproval[]> => {
  const response = await api2.get(`/cutiapproval/${id}`);

  return response.data;
};

export const updateCutiFn = async ({ id, fields }: UpdateCutiParams) => {
  const formData = new FormData();

  // 1. Loop semua field kecuali 'lampiran'
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === 'lampiran') return; // SKIP lampiran di sini

    if (Array.isArray(value) && value.every((item) => item instanceof File)) {
      // Array of File
      value.forEach((file, idx) => {
        formData.append(`${key}[${idx}]`, file);
      });
    } else if (value instanceof File) {
      formData.append(key, value);
    } else if (value instanceof Date) {
      if (!isNaN(value.getTime())) {
        formData.append(key, value.toISOString());
      }
    } else if (typeof value === 'object') {
      // Array non-file atau objek biasa
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });

  // 2. Tangani lampiran sekali saja
  if (fields.lampiran != null) {
    // normalisasi ke array
    const arr = Array.isArray(fields.lampiran)
      ? fields.lampiran
      : [fields.lampiran];

    arr.forEach((item: File | string) => {
      // hanya File atau string URL
      if (item instanceof File || typeof item === 'string') {
        formData.append('lampiran', item);
      }
    });
  }

  try {
    const response = await api2.put(`/cuti/${id}`, formData);
    return response.data;
  } catch (error) {
    console.error('Error during Cuti update:', error);
    throw error;
  }
};

export const getCutiByIdFn = async (id: string) => {
  try {
    const response = await api2.get(`/cutites/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ACOS data:', error);
    throw new Error('Failed to fetch ACOS data');
  }
};
export const getOverviewCutiFn = async (karyawan_id: string) => {
  try {
    const response = await api2.get(
      `/cuti/overview?karyawan_id=${karyawan_id}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching ACOS data:', error);
    throw new Error('Failed to fetch ACOS data');
  }
};
export const exportCutiFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/cuti/export', {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};

export const exportHistoryCutiFn = async (payload: any): Promise<any> => {
  try {
    const response = await api2.post('/karyawan/export-history-cuti', payload, {
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
export const exportCutiBySelectFn = async (ids: { id: number }[]) => {
  try {
    const response = await api2.post('/cuti/export-byselect', ids, {
      responseType: 'blob'
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
export const getRekapCutiFn = async (
  idcabang: number,
  tanggalDari: string,
  tanggalSampai: string
) => {
  try {
    const response = await api2.get(`/cuti/rekap`, {
      params: { idcabang, tanggalDari, tanggalSampai }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching rekap cuti data:', error);
    throw new Error('Failed to fetch rekap cuti data');
  }
};
export const exportRekapCutiFn = async (
  idcabang: number,
  tanggalDari: string,
  tanggalSampai: string
) => {
  try {
    const response = await api2.get(`/cuti/export-rekap`, {
      params: { idcabang, tanggalDari, tanggalSampai },
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching rekap cuti data:', error);
    throw new Error('Failed to fetch rekap cuti data');
  }
};
export const exportRekapSaldoCutiFn = async (
  idcabang: number,
  tahun: string
) => {
  try {
    const response = await api2.get(`/cuti/export-rekap-saldocuti`, {
      params: { idcabang, tahun },
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching rekap cuti data:', error);
    throw new Error('Failed to fetch rekap cuti data');
  }
};
export const getRekapSaldoCutiFn = async (idcabang: number, tahun: string) => {
  try {
    const response = await api2.get(`/cuti/rekap-saldo-cuti`, {
      params: { idcabang, tahun }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching rekap cuti data:', error);
    throw new Error('Failed to fetch rekap cuti data');
  }
};
export const reportCutiBySelectFn = async (ids: { id: number }[]) => {
  try {
    // Sending the data in the correct format to the NestJS API
    const response = await api2.post(`/cuti/report-byselect`, ids);

    return response.data; // Assuming the API returns the data properly
  } catch (error) {
    console.error('Error in sending data:', error);
    throw new Error('Failed to send data to the API');
  }
};
export const historyCutiFn = async (fields: any) => {
  const response = await api2.post(`/karyawan/rekap-histories`, fields);

  return response;
};
