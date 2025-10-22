import { GetParams } from '../types/all.type';
import { IAllRelasi } from '../types/relasi.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';

export const getRelasiFn = async (
  filters: GetParams = {},
  signal?: AbortSignal
): Promise<IAllRelasi> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/relasi', {
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
