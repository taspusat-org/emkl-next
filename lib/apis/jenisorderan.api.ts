import { GetParams } from '../types/all.type';
import { IAllJenisOrderan } from '../types/jenisorderan.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';
import { JenisOrderanInput } from '../validations/jenisorderan.validation';

interface UpdateJenisOrderanParams {
  id: string;
  fields: JenisOrderanInput;
}

export const getJenisOrderanFn = async (
  filters: GetParams = {}
): Promise<IAllJenisOrderan> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/jenisorderan', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching jenisorderan:', error);
    throw new Error('failed to fetch jenis orderan');
  }
};

export const storeJenisOrderanFn = async (fields: JenisOrderanInput) => {
  const response = await api2.post(`/jenisorderan`, fields);
  return response.data;
};

export const deleteJenisOrderanFn = async (id: string) => {
  try {
    const response = await api2.delete(`/jenisorderan/${id}`);
    return response.data; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
export const updateJenisOrderanFn = async ({
  id,
  fields
}: UpdateJenisOrderanParams) => {
  const response = await api2.put(`/jenisorderan/${id}`, fields);
  return response.data;
};

export const exportJenisOrderanFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/jenisorderan/export', {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
