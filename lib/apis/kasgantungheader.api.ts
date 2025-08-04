import { GetParams } from '../types/all.type';
import {
  IAllKasGantungDetail,
  IAllKasGantungHeader
} from '../types/kasgantungheader.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';

export const getKasGantungHeaderFn = async (
  filters: GetParams = {}
): Promise<IAllKasGantungHeader> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/kasgantungheader', {
      params: queryParams
    });

    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed');
  }
};
export const getKasGantungDetailFn = async (
  id: number
): Promise<IAllKasGantungDetail> => {
  const response = await api2.get(`/kasgantungdetail/${id}`);

  return response.data;
};
