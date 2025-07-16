import { GetParams } from '../types/all.type';
import { IAllJenisIzin } from '../types/jenisizin.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';
import { JenisIzinInput } from '../validations/jenisizin.validation';
interface updateJenisIzinParams {
  id: number;
  fields: JenisIzinInput;
}
export const getAllJenisIzinFn = async (
  filters: GetParams = {}
): Promise<IAllJenisIzin> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/jenisizin', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching jenisizin data:', error);
    throw new Error('Failed to fetch jenisizin data');
  }
};
export const storeJenisIzinFn = async (fields: JenisIzinInput) => {
  const response = await api2.post(`/jenisizin`, fields);
  return response.data;
};
export const updateJenisIzinFn = async ({
  id,
  fields
}: updateJenisIzinParams) => {
  const response = await api2.put(`/jenisizin/${id}`, fields);

  return response.data;
};
export const deleteJenisIzinFn = async (id: string) => {
  try {
    const response = await api2.delete(`/jenisizin/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};
