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
  filters: GetParams = {}
): Promise<IAllJurnalUmumDetail> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/jurnalumumdetail', {
      params: queryParams
    });

    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed');
  }
};
export const getJurnalUmumHeaderByIdFn = async (
  id: number
): Promise<IAllJurnalUmumHeader> => {
  try {
    const response = await api2.get(`/jurnalumumheader/${id}`);

    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed');
  }
};
export const storeJurnalUmumFn = async (fields: JurnalUmumHeaderInput) => {
  const response = await api2.post(`/jurnalumumheader`, fields);

  return response.data;
};
export const updateJurnalUmumFn = async ({ id, fields }: UpdateParams) => {
  const response = await api2.put(`/jurnalumumheader/${id}`, fields);
  return response.data;
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
export const exportJurnalUmumFn = async (
  id: number,
  filters: any
): Promise<Blob> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get(`/jurnalumumheader/export/${id}`, {
      params: queryParams,
      responseType: 'blob' // backend return file (Excel)
    });

    return response.data; // ini sudah Blob
  } catch (error) {
    console.error('Error exporting data jurnal umum:', error);
    throw new Error('Failed to export data jurnal umum');
  }
};
