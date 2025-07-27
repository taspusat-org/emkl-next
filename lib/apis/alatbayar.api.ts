import { GetParams } from '../types/all.type';
import { IAllRelasi } from '../types/relasi.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';

export const getAlatBayarFn = async (
  filters: GetParams = {}
): Promise<IAllRelasi> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/alatbayar', { params: queryParams });

    return response.data;
  } catch (error) {
    console.error('Error fetching menus:', error);
    throw new Error('Failed to fetch menus');
  }
};
