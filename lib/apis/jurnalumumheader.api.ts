import { GetParams } from '../types/all.type';
import {
  IAllJurnalUmumDetail,
  IAllJurnalUmumHeader
} from '../types/jurnalumumheader.type';
import {
  IAllKasGantungDetail,
  IAllKasGantungHeader
} from '../types/kasgantungheader.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';
import { JurnalUmumHeaderInput } from '../validations/jurnalumum.validation';
import { KasGantungHeaderInput } from '../validations/kasgantung.validation';
interface UpdateParams {
  id: string;
  fields: KasGantungHeaderInput;
}
interface validationFields {
  aksi: string;
  value: number | string;
}
export const getJurnalUmumHeaderFn = async (
  filters: GetParams = {}
): Promise<IAllJurnalUmumHeader> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/jurnalumumheader', {
      params: queryParams
    });

    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed');
  }
};

export const getJurnalUmumDetailFn = async (
  id: number
): Promise<IAllJurnalUmumDetail> => {
  const response = await api2.get(`/jurnalumumdetail/${id}`);
  return response.data;
};

export const storeJurnalUmumFn = async (fields: JurnalUmumHeaderInput) => {
  const response = await api2.post(`/jurnalumumheader`, fields);

  return response.data;
};
export const updateJurnalUmumFn = async ({ id, fields }: UpdateParams) => {
  const response = await api2.put(`/jurnalumumheader/${id}`, fields);
  return response.data;
};
export const getKasgantungListFn = async (dari: string, sampai: string) => {
  try {
    // Construct the URL with query params
    const url = `/kasgantungheader/list?dari=${dari}&sampai=${sampai}`;

    // Using GET request with the full URL
    const response = await api2.get(url);

    return response.data;
  } catch (error) {
    console.error('Error fetching rekap kehadiran:', error);
    throw new Error('Failed to fetch rekap kehadiran');
  }
};
export const getKasgantungPengembalianFn = async (
  id: string,
  dari: string,
  sampai: string
) => {
  try {
    // Construct the URL with query params
    const url = `/kasgantungheader/pengembalian?dari=${dari}&sampai=${sampai}&id=${id}`;

    // Using GET request with the full URL
    const response = await api2.get(url);

    return response.data;
  } catch (error) {
    console.error('Error fetching rekap kehadiran:', error);
    throw new Error('Failed to fetch rekap kehadiran');
  }
};
export const deleteJurnalUmumFn = async (id: string) => {
  try {
    const response = await api2.delete(`/jurnalumumheader/${id}`);
    return response.data; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
export const checkValidationJurnalUmumFn = async (fields: validationFields) => {
  const response = await api2.post(
    `/jurnalumumheader/check-validation`,
    fields
  );
  return response.data;
};
