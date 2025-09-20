import { PenerimaanemklheaderHeaderInput } from '../validations/penerimaanemklheader.validation';
import { GetParams } from '../types/all.type';
import {
  IAllPenerimaanEmklDetail,
  IAllPenerimaanEmklHeader
} from '../types/penerimaanemklheader.type';
import { api2 } from '../utils/AxiosInstance';
import { buildQueryParams } from '../utils';

interface UpdateParams {
  id: string;
  fields: PenerimaanemklheaderHeaderInput;
}
export const getPenerimaanEmklHeaderFn = async (
  filters: GetParams = {}
): Promise<IAllPenerimaanEmklHeader> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/penerimaanemklheader', {
      params: queryParams
    });

    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed');
  }
};
export const storePenerimaanEmklHeaderFn = async (
  fields: PenerimaanemklheaderHeaderInput
) => {
  const response = await api2.post(`/penerimaanemklheader`, fields);

  return response.data;
};
export const getPenerimaanEmklDetailFn = async (
  filters: GetParams = {}
): Promise<IAllPenerimaanEmklDetail> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/penerimaanemkldetail', {
      params: queryParams
    });

    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed');
  }
};
export const updatePenerimaanEmklHeaderFn = async ({
  id,
  fields
}: UpdateParams) => {
  const response = await api2.put(`/penerimaanemklheader/${id}`, fields);
  return response.data;
};
export const deletePenerimaanEmklHeaderFn = async (id: string) => {
  try {
    const response = await api2.delete(`/penerimaanheader/${id}`);
    return response.data; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
export const getPenerimaanEmklHeaderByIdFn = async (
  id: number
): Promise<IAllPenerimaanEmklHeader> => {
  try {
    const response = await api2.get(`/penerimaanemklheader/${id}`);

    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed');
  }
};
export const exportPenerimaanEmklHeaderFn = async (
  id: number,
  filters: any
): Promise<Blob> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get(`/penerimaanemklheader/export/${id}`, {
      params: queryParams,
      responseType: 'blob' // backend return file (Excel)
    });

    return response.data; // ini sudah Blob
  } catch (error) {
    console.error('Error exporting data penerimaan emkl header:', error);
    throw new Error('Failed to export data penerimaan emkl header');
  }
};
