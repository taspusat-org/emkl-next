import { GetParams } from '../types/all.type';
import {
  IAllPengembalianKasGantung,
  IAllPengembalianKasGantungDetail
} from '../types/pengembaliankasgantung.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';
import { PengembalianKasGantungHeaderInput } from '../validations/pengembaliankasgantung.validation';

export const getPengembalianKasGantungHeaderFn = async (
  filters: GetParams = {}
): Promise<IAllPengembalianKasGantung> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/pengembaliankasgantungheader', {
      params: queryParams
    });

    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed');
  }
};
export const getPengembalianKasGantungReportFn = async (
  filters: GetParams = {}
): Promise<IAllPengembalianKasGantung> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get(
      '/pengembaliankasgantungheader/report-all',
      {
        params: queryParams
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed');
  }
};
export const storePengembalianKasGantungFn = async (
  fields: PengembalianKasGantungHeaderInput
) => {
  const response = await api2.post(`/pengembaliankasgantungheader`, fields);

  return response.data;
};
export const getPengembalianKasGantungDetailFn = async (
  id: number
): Promise<IAllPengembalianKasGantungDetail> => {
  const response = await api2.get(`/pengembaliankasgantungdetail/${id}`);

  return response.data;
};
