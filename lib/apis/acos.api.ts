import { IAcos, IAllAcos } from '../types/acos.type';
import { GetParams } from '../types/all.type';
import { buildQueryParams } from '../utils';
import { api, api2 } from '../utils/AxiosInstance';

export const getAcosFn = async (): Promise<IAcos[]> => {
  const response = await api2.get('/acos');

  return response.data;
};
export const syncAcosFn = async () => {
  const response = await api2.post('/acos/sync');
  return response.data;
};
export const getAllAcosFn = async (
  filters: GetParams = {}
): Promise<IAllAcos> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/acos/get-all', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching ACOS data:', error);
    throw new Error('Failed to fetch ACOS data');
  }
};
