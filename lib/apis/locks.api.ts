import { GetParams } from '../types/all.type';
import { IAllLocks } from '../types/locks.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';
import { LocksInput } from '../validations/locks.validation';

export const getLocksFn = async (
  filters: GetParams = {}
): Promise<IAllLocks> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/locks', { params: queryParams });

    return response.data;
  } catch (error) {
    console.error('Error fetching menus:', error);
    throw new Error('Failed to fetch menus');
  }
};
export const openLocksFn = async (fields: LocksInput) => {
  const response = await api2.post(`/locks/open-locks`, fields);

  return response.data;
};
