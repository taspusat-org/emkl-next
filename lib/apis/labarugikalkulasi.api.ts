import { buildQueryParams } from '../utils';
import { GetParams } from '../types/all.type';
import { api2 } from '../utils/AxiosInstance';
import { IAllLabaRugiKalkulasi } from '../types/labarugikalkulasi.type';
import { labaRugiKalkulasiInput } from '../validations/labarugikalkulasi.validation';

interface UpdateLabaRugiKalkulasiParams {
  id: string;
  fields: labaRugiKalkulasiInput;
}

interface validationFields {
  aksi: string;
  value: number | string;
}

export const getAllLabaRugiKalkulasiFn = async (
  filters: GetParams = {},
  signal?: AbortSignal
): Promise<IAllLabaRugiKalkulasi> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('labarugikalkulasi', {
      params: queryParams,
      signal
    });

    return response.data;
  } catch (error) {
    if (signal?.aborted) {
      // Jika error karena abort, jangan log sebagai error
      throw new Error('Request was cancelled');
    }
    console.error('Error fetching Laba Rugi Kalkulasi data:', error);
    throw new Error('Failed to fetch Laba Rugi Kalkulasi data');
  }
};

export const storeLabaRugiKalkulasiFn = async (
  fields: labaRugiKalkulasiInput
) => {
  const response = await api2.post(`/labarugikalkulasi`, fields);

  return response.data;
};

export const updateLabaRugiKalkulasiFn = async ({
  id,
  fields
}: UpdateLabaRugiKalkulasiParams) => {
  const response = await api2.put(`/labarugikalkulasi/${id}`, fields);

  return response.data;
};

export const deleteLabaRugiKalkulasiFn = async (id: string) => {
  try {
    const response = await api2.delete(`labarugikalkulasi/${id}`);

    return response;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

export const checkValidationLabaRugiKalkulasiFn = async (
  fields: validationFields
) => {
  const response = await api2.post(
    `/labarugikalkulasi/check-validation`,
    fields
  );

  return response;
};

export const exportLabaRugiKalkulasiFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/labarugikalkulasi/export', {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data laba rugi kalkulasi:', error);
    throw new Error('Failed to export data laba rugi kalkulasi');
  }
};
