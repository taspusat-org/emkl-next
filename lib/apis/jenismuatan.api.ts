import { GetParams } from '../types/all.type';
import { IAllJenisMuatan } from '../types/jenismuatan.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';
import { JenisMuatanInput } from '../validations/jenismuatan.validation';

interface UpdateJenisMuatanParams {
  id: string;
  fields: JenisMuatanInput;
}

export const getJenisMuatanFn = async (
  filters: GetParams = {}
): Promise<IAllJenisMuatan> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/jenismuatan', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching jenismuatan:', error);
    throw new Error('failed to fetch jenis muatan');
  }
};

export const storeJenisMuatanFn = async (fields: JenisMuatanInput) => {
  const response = await api2.post(`/jenismuatan`, fields);
  return response.data;
};

export const deleteJenisMuatanFn = async (id: string) => {
  try {
    const response = await api2.delete(`/jenismuatan/${id}`);
    return response.data; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
export const updateJenisMuatanFn = async ({
  id,
  fields
}: UpdateJenisMuatanParams) => {
  const response = await api2.put(`/jenismuatan/${id}`, fields);
  return response.data;
};
