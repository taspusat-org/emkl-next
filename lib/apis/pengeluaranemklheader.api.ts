import { GetParams } from '../types/all.type';
import { api2 } from '../utils/AxiosInstance';
import { buildQueryParams } from '../utils';
import { IAllPenerimaanHeader } from '../types/penerimaan.type';
import { PenerimaanHeaderInput } from '../validations/penerimaan.validation';
import { IAllPenerimaanDetail } from '../types/penerimaan.type';
import {
  IAllPengeluaranEmklDetail,
  IAllPengeluaranEmklHeader
} from '../types/pengeluaranemklheader.type';
import { PengeluaranemklheaderHeaderInput } from '../validations/pengeluaranemklheader.validation';
interface UpdateParams {
  id: string;
  fields: PengeluaranemklheaderHeaderInput;
}
export const getPengeluaranEmklHeaderFn = async (
  filters: GetParams = {}
): Promise<IAllPengeluaranEmklHeader> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/pengeluaranemklheader', {
      params: queryParams
    });

    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed');
  }
};
export const storePengeluaranEmklHeaderFn = async (
  fields: PengeluaranemklheaderHeaderInput
) => {
  const response = await api2.post(`/pengeluaranemklheader`, fields);

  return response.data;
};
export const getPengeluaranEmklDetailFn = async (
  filters: GetParams = {}
): Promise<IAllPengeluaranEmklDetail> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/pengeluaranemkldetail', {
      params: queryParams
    });

    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed');
  }
};
export const updatePengeluaranEmklHeaderFn = async ({
  id,
  fields
}: UpdateParams) => {
  const response = await api2.put(`/pengeluaranemklheader/${id}`, fields);
  return response.data;
};
export const deletePenerimaanFn = async (id: string) => {
  try {
    const response = await api2.delete(`/penerimaanheader/${id}`);
    return response.data; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
export const getPenerimaanHeaderByIdFn = async (
  id: number
): Promise<IAllPenerimaanHeader> => {
  try {
    const response = await api2.get(`/penerimaanheader/${id}`);

    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed');
  }
};
export const exportPenerimaanFn = async (
  id: number,
  filters: any
): Promise<Blob> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get(`/penerimaanheader/export/${id}`, {
      params: queryParams,
      responseType: 'blob' // backend return file (Excel)
    });

    return response.data; // ini sudah Blob
  } catch (error) {
    console.error('Error exporting data penerimaan:', error);
    throw new Error('Failed to export data penerimaan');
  }
};
