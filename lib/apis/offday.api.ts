import { GetParams } from '../types/all.type';
import { IAllOffdays } from '../types/offday.type';
import { buildQueryParams } from '../utils';
import { api, api2 } from '../utils/AxiosInstance';
import { OffdayInput } from '../validations/offday.validation';
interface UpdateParams {
  id: string;
  fields: OffdayInput;
}

export const getOffdayFn = async (
  filters: GetParams = {}
): Promise<IAllOffdays> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/offdays', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching ACOS data:', error);
    throw new Error('Failed to fetch ACOS data');
  }
};
export const storeOffdaysFn = async (fields: OffdayInput) => {
  const response = await api2.post(`/offdays`, fields);

  return response.data;
};
export const updateOffdaysFn = async ({ id, fields }: UpdateParams) => {
  const response = await api2.put(`/offdays/${id}`, fields);

  return response.data;
};
export const deleteOffdaysFn = async (id: string) => {
  try {
    const response = await api2.delete(`/offdays/${id}`);
    return response.data; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};

export const getAllOffdaysFn = async (): Promise<IAllOffdays> => {
  const response = await api2.get('/offdays');

  return response.data;
};
