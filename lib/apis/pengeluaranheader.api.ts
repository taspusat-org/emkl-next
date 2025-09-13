import { GetParams } from '../types/all.type';
import {
  IAllPengeluaranDetail,
  IAllPengeluaranHeader
} from '../types/pengeluaran.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';
import { PengeluaranHeaderInput } from '../validations/pengeluaran.validation';
interface UpdateParams {
  id: string;
  fields: PengeluaranHeaderInput;
}
interface validationFields {
  aksi: string;
  value: number | string;
}
export const getPengeluaranHeaderFn = async (
  filters: GetParams = {}
): Promise<IAllPengeluaranHeader> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/pengeluaranheader', {
      params: queryParams
    });

    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed');
  }
};

export const getPengeluaranHeaderByNobuktiFn = async (
  nobukti: string,
  filters: GetParams = {}
): Promise<IAllPengeluaranHeader> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get(`/pengeluaranheader/report`, {
      params: {
        mainNobukti: nobukti,
        ...queryParams
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed');
  }
};
export const getPengeluaranDetailFn = async (
  nobukti: string,
  filters: GetParams = {}
): Promise<IAllPengeluaranDetail> => {
  const queryParams = buildQueryParams(filters);
  const response = await api2.get(`/pengeluarandetail/detail`, {
    params: {
      mainNobukti: nobukti,
      ...queryParams
    }
  });
  return response.data;
};
export const storePengeluaranFn = async (fields: PengeluaranHeaderInput) => {
  const response = await api2.post(`/pengeluaranheader`, fields);

  return response.data;
};
export const updatePengeluaranFn = async ({ id, fields }: UpdateParams) => {
  const response = await api2.put(`/pengeluaranheader/${id}`, fields);
  return response.data;
};
export const getPengeluaranListFn = async (dari: string, sampai: string) => {
  try {
    // Construct the URL with query params
    const url = `/pengeluaranheader/list?dari=${dari}&sampai=${sampai}`;

    // Using GET request with the full URL
    const response = await api2.get(url);

    return response.data;
  } catch (error) {
    console.error('Error fetching pengeluaran:', error);
    throw new Error('Failed to fetch pengeluaran');
  }
};
export const getPengeluaranFn = async (
  id: string,
  dari: string,
  sampai: string
) => {
  try {
    // Construct the URL with query params
    const url = `/pengeluaranheader/pengembalian?dari=${dari}&sampai=${sampai}&id=${id}`;

    // Using GET request with the full URL
    const response = await api2.get(url);

    return response.data;
  } catch (error) {
    console.error('Error fetching pengeluaran:', error);
    throw new Error('Failed to fetch pengeluaran');
  }
};
export const deletePengeluaranFn = async (id: string) => {
  try {
    const response = await api2.delete(`/pengeluaranheader/${id}`);
    return response.data; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
export const checkValidationPengeluaranFn = async (
  fields: validationFields
) => {
  const response = await api2.post(
    `/pengeluaranheader/check-validation`,
    fields
  );
  return response.data;
};
export const exportPengeluaranFn = async (
  nobukti: string,
  filters: any
): Promise<Blob> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get(`/pengeluaranheader/export/`, {
      params: {
        mainNobukti: nobukti,
        ...queryParams
      },
      responseType: 'blob' // backend return file (Excel)
    });

    return response.data; // ini sudah Blob
  } catch (error) {
    console.error('Error exporting data pengeluaran:', error);
    throw new Error('Failed to export data pengeluaran');
  }
};
