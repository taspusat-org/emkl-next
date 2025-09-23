import { buildQueryParams } from '../utils';
import { GetParams } from '../types/all.type';
import { api2 } from '../utils/AxiosInstance';
import { IAllGandengan } from '../types/gandengan.type';

export const getAllGandenganFn = async (
  filters: GetParams = {}
): Promise<IAllGandengan> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('gandengan', { params: queryParams });

    return response.data;
  } catch (error) {
    console.error('Error fetching gandengan data:', error);
    throw new Error('Failed to fetch gandengan data');
  }
};
