import { GetParams } from '../types/all.type';
import { IAllIzin, IIzinApproval } from '../types/izin.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';
import { IzinInput } from '../validations/izin.validation';
interface UpdateParams {
  id: string;
  fields: IzinInput;
}
interface IIzinBody {
  izinId: number;
  karyawanId: number;
}
export const getIzinFn = async (filters: GetParams = {}): Promise<IAllIzin> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/izin', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching ACOS data:', error);
    throw new Error('Failed to fetch ACOS data');
  }
};
export const cancelIzinFn = async (cutiId: number) => {
  await api2.put(`/izin/cancel-izin/${cutiId}`);
};
export const checkApproveIzinFn = async (fields: any) => {
  const response = await api2.post(`/izin/check-approval`, fields);
  return response.data;
};
export const checkRejectIzinFn = async (fields: any) => {
  const response = await api2.post(`/izin/check-reject`, fields);
  return response.data;
};
export const checkCancelIzinFn = async (fields: any) => {
  const response = await api2.post(`/izin/check-cancel`, fields);
  return response.data;
};
export const checkAddIzinFn = async (fields: any) => {
  const response = await api2.post(`/izin/check-izin`, fields);
  return response.data;
};
export const getApprovalIzinFn = async (
  filters: GetParams = {}
): Promise<IAllIzin> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/izin/approval-izin', {
      params: queryParams
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching ACOS data:', error);
    throw new Error('Failed to fetch ACOS data');
  }
};
export const storeIzinFn = async (fields: IzinInput) => {
  const response = await api2.post(`/izin`, fields);

  return response.data;
};
export const updateIzinFn = async ({ id, fields }: UpdateParams) => {
  const response = await api2.put(`/izin/${id}`, fields);
  return response.data;
};
export const deleteIzinFn = async (id: number) => {
  try {
    const response = await api2.delete(`/izin/${id}`);
    return response.data; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
export const exportIzinFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/izin/export', {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
export const exportIzinBySelectFn = async (ids: { id: number }[]) => {
  try {
    const response = await api2.post('/izin/export-byselect', ids, {
      responseType: 'blob'
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
export const GetIzinApprovalFn = async (
  id: string
): Promise<IIzinApproval[]> => {
  const response = await api2.get(`/izinapproval/${id}`);

  return response.data;
};
export const approveIzinFn = async (fields: IIzinBody) => {
  await api2.put(`/izinapproval/approve`, fields);
};
export const rejectIzinFn = async (fields: IIzinBody) => {
  await api2.put(`/izinapproval/reject`, fields);
};
export const getRekapIzinFn = async (
  idcabang: number,
  tanggalDari: string,
  tanggalSampai: string
) => {
  try {
    const response = await api2.get(`/izin/rekap`, {
      params: { idcabang, tanggalDari, tanggalSampai }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching rekap cuti data:', error);
    throw new Error('Failed to fetch rekap cuti data');
  }
};
export const reportIzinBySelectFn = async (ids: { id: number }[]) => {
  try {
    // Sending the data in the correct format to the NestJS API
    const response = await api2.post(`/izin/report-byselect`, ids);

    return response.data; // Assuming the API returns the data properly
  } catch (error) {
    console.error('Error in sending data:', error);
    throw new Error('Failed to send data to the API');
  }
};
export const exportRekapIzinFn = async (
  idcabang: number,
  tanggalDari: string,
  tanggalSampai: string
) => {
  try {
    const response = await api2.get(`/izin/export-rekap`, {
      params: { idcabang, tanggalDari, tanggalSampai },
      responseType: 'blob'
    });

    // Mengecek jika response status 500 atau tidak ada data
    if (response.status === 500) {
      throw new Error(
        response.data.message || 'Tidak ada data rekap izin yang ditemukan'
      );
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching rekap izin data:', error);
    throw new Error(error.message || 'Failed to fetch rekap izin data');
  }
};
