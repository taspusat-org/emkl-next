import { buildQueryParams } from '../utils';
import { GetParams } from '../types/all.type';
import { api2 } from '../utils/AxiosInstance';
import { penerimaanEmklInput } from '../validations/penerimaanemkl.validation';
import { IAllPenerimaanEmkl } from '../types/penerimaanemkl.type';

interface UpdatePenerimaanEmklParams {
  id: string;
  fields: penerimaanEmklInput;
}

interface validationFields {
  aksi: string;
  value: number | string;
}

export const getAllPenerimaanEmklFn = async (
  filters: GetParams = {},
  signal?: AbortSignal
): Promise<IAllPenerimaanEmkl> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('penerimaanemkl', {
      params: queryParams,
      signal
    });

    return response.data;
  } catch (error) {
    if (signal?.aborted) {
      // Jika error karena abort, jangan log sebagai error
      throw new Error('Request was cancelled');
    }
    console.error('Error fetching Penerimaan Emkl data:', error);
    throw new Error('Failed to fetch Penerimaan Emkl data');
  }
};

export const storePenerimaanEmklFn = async (fields: penerimaanEmklInput) => {
  const response = await api2.post(`/penerimaanemkl`, fields);

  return response.data;
};

export const updatePenerimaanEmklFn = async ({
  id,
  fields
}: UpdatePenerimaanEmklParams) => {
  const response = await api2.put(`/penerimaanemkl/${id}`, fields);

  return response.data;
};

export const deletePenerimaanEmklFn = async (id: string) => {
  try {
    const response = await api2.delete(`penerimaanemkl/${id}`);

    return response;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

export const checkValidationPenerimaanEmklFn = async (
  fields: validationFields
) => {
  const response = await api2.post(`/penerimaanemkl/check-validation`, fields);

  return response;
};

export const exportPenerimaanEmklFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/penerimaanemkl/export', {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data penerimaan emkl:', error);
    throw new Error('Failed to export data penerimaan emkl');
  }
};
