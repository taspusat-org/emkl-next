import { buildQueryParams } from '../utils';
import { GetParams } from '../types/all.type';
import { api2 } from '../utils/AxiosInstance';
import { IAllPengeluaranEmkl } from '../types/pengeluaranemkl.type';
import { pengeluaranEmklInput } from '../validations/pengeluaranemkl.validation';

interface UpdatePengeluaranEmklParams {
  id: string;
  fields: pengeluaranEmklInput;
}

interface validationFields {
  aksi: string;
  value: number | string;
}

export const getAllPengeluaranEmklFn = async (
  filters: GetParams = {},
  signal?: AbortSignal
): Promise<IAllPengeluaranEmkl> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('pengeluaranemkl', {
      params: queryParams,
      signal
    });

    return response.data;
  } catch (error) {
    if (signal?.aborted) {
      // Jika error karena abort, jangan log sebagai error
      throw new Error('Request was cancelled');
    }
    console.error('Error fetching Pengeluaran Emkl data:', error);
    throw new Error('Failed to fetch Pengeluaran Emkl data');
  }
};

export const storePengeluaranEmklFn = async (fields: pengeluaranEmklInput) => {
  const response = await api2.post(`/pengeluaranemkl`, fields);

  return response.data;
};

export const updatePengeluaranEmklFn = async ({
  id,
  fields
}: UpdatePengeluaranEmklParams) => {
  const response = await api2.put(`/pengeluaranemkl/${id}`, fields);

  return response.data;
};

export const deletePengeluaranEmklFn = async (id: string) => {
  try {
    const response = await api2.delete(`pengeluaranemkl/${id}`);

    return response;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

export const checkValidationPengeluaranEmklFn = async (
  fields: validationFields
) => {
  const response = await api2.post(`/pengeluaranemkl/check-validation`, fields);

  return response;
};

export const exportPengeluaranEmklFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/pengeluaranemkl/export', {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data pengeluaran emkl:', error);
    throw new Error('Failed to export data pengeluaran emkl');
  }
};
export const getPengeluaranEmklListFn = async (
  dari: string,
  sampai: string
) => {
  try {
    // Construct the URL with query params
    const url = `/pengeluaranemklheader/list?dari=${dari}&sampai=${sampai}`;

    // Using GET request with the full URL
    const response = await api2.get(url);

    return response.data;
  } catch (error) {
    console.error('Error fetching pengeluaran emkl:', error);
    throw new Error('Failed to fetch pengeluaran emkl');
  }
};
