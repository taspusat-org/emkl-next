import { GetParams } from '../types/all.type';
import {
  IAllKasGantungDetail,
  IAllKasGantungHeader
} from '../types/kasgantungheader.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';
import { KasGantungHeaderInput } from '../validations/kasgantung.validation';
interface UpdateParams {
  id: string;
  fields: KasGantungHeaderInput;
}
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
export const storeKasGantungFn = async (fields: KasGantungHeaderInput) => {
  const response = await api2.post(`/kasgantungheader`, fields);

  return response.data;
};
export const updateKasGantungFn = async ({ id, fields }: UpdateParams) => {
  const response = await api2.put(`/kasgantungheader/${id}`, fields);
  return response.data;
};
export const getKasgantungPengembalianFn = async (
  dari: string,
  sampai: string
) => {
  try {
    // Construct the URL with query params
    const url = `/kasgantungheader/pengembalian?dari=${dari}&sampai=${sampai}`;

    // Using GET request with the full URL
    const response = await api2.get(url);

    return response.data;
  } catch (error) {
    console.error('Error fetching rekap kehadiran:', error);
    throw new Error('Failed to fetch rekap kehadiran');
  }
};
