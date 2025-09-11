import { GetParams } from '../types/all.type';
import { IAllKasGantungHeader } from '../types/kasgantungheader.type';
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

export const getPengembalianKasGantungHeaderByIdFn = async (
  id: number,
  filters: GetParams = {}
): Promise<IAllPengembalianKasGantung> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get(`/pengembaliankasgantungheader/${id}`, {
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
  filters: GetParams = {}
): Promise<IAllPengembalianKasGantungDetail> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/pengembaliankasgantungdetail', {
      params: queryParams
    });

    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed');
  }
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
export const exportPengembalianKasGantungFn = async (
  id: string,
  filters: any
): Promise<Blob> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get(
      `/pengembaliankasgantungheader/export/${id}`,
      {
        params: queryParams,
        responseType: 'blob' // backend return file (Excel)
      }
    );

    return response.data; // ini sudah Blob
  } catch (error) {
    console.error('Error exporting data pengembalian kas gantung:', error);
    throw new Error('Failed to export data pengembalian kas gantung');
  }
};
