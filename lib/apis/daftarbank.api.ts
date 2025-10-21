import { GetParams } from '../types/all.type';
import { IAllDaftarBank } from '../types/daftarbank.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';
import { DaftarBankInput } from '../validations/daftarbank.validation';

interface UpdateDaftarBankParams {
  id: string;
  fields: DaftarBankInput;
}

export const getDaftarBankFn = async (
  filters: GetParams = {},
  signal?: AbortSignal
): Promise<IAllDaftarBank> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/daftarbank', {
      params: queryParams,
      signal
    });

    return response.data;
  } catch (error) {
    if (signal?.aborted) {
      throw new Error('Request was cancelled');
    }
    console.error('Error fetching Akun Pusat:', error);
    throw new Error('Failed to fetch Akun Pusat');
  }
};

export const storeDaftarBankFn = async (fields: DaftarBankInput) => {
  const response = await api2.post(`/daftarbank`, fields);
  return response.data;
};

export const deleteDaftarBankFn = async (id: string) => {
  try {
    const response = await api2.delete(`/daftarbank/${id}`);
    return response.data; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
export const updateDaftarBankFn = async ({
  id,
  fields
}: UpdateDaftarBankParams) => {
  const response = await api2.put(`/daftarbank/${id}`, fields);
  return response.data;
};

export const exportDaftarbankFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/daftarbank/export', {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
