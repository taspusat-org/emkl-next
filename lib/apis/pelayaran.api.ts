import { GetParams } from '../types/all.type';
import { IAllPelayaran } from '../types/pelayaran.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';
import { PelayaranInput } from '../validations/pelayaran.validation';

interface UpdatePelayaranParams {
  id: string;
  fields: PelayaranInput;
}

export const getPelayaranFn = async (
  filters: GetParams = {}
): Promise<IAllPelayaran> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/pelayaran', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching pelayaran:', error);
    throw new Error('failed to fetch pelayaran');
  }
};

export const storePelayaranFn = async (fields: PelayaranInput) => {
  const response = await api2.post(`/pelayaran`, fields);
  return response.data;
};

export const deletePelayaranFn = async (id: string) => {
  try {
    const response = await api2.delete(`/pelayaran/${id}`);
    return response.data; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
export const updatePelayaranFn = async ({
  id,
  fields
}: UpdatePelayaranParams) => {
  const response = await api2.put(`/pelayaran/${id}`, fields);
  return response.data;
};
