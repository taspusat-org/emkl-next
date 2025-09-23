import { buildQueryParams } from '../utils';
import { GetParams } from '../types/all.type';
import { api2 } from '../utils/AxiosInstance';
import { IAllTrado } from '../types/trado.type';

export const getAllTradoFn = async (
  filters: GetParams = {}
): Promise<IAllTrado> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('trado', { params: queryParams });

    return response.data;
  } catch (error) {
    console.error('Error fetching trado data:', error);
    throw new Error('Failed to fetch trado data');
  }
};
