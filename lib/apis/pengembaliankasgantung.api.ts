import { GetParams } from '../types/all.type';
import {
  IAllPengembalianKasGantung,
  IAllPengembalianKasGantungDetail
} from '../types/pengembaliankasgantung.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';
import { PengembalianKasGantungHeaderInput } from '../validations/pengembaliankasgantung.validation';
interface UpdateParams {
  id: string;
  fields: PengembalianKasGantungHeaderInput;
}
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
export const updatePengembalianKasGantungFn = async ({
  id,
  fields
}: UpdateParams) => {
  const response = await api2.put(
    `/pengembaliankasgantungheader/${id}`,
    fields
  );
  return response.data;
};
export const deletePengembalianKasGantung = async (id: string) => {
  try {
    const response = await api2.delete(`/pengembaliankasgantungheader/${id}`);
    return response.data; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
