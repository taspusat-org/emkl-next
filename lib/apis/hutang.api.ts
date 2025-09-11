import { GetParams } from '../types/all.type';
import { IAllHutangDetail, IAllHutangHeader } from '../types/hutang.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';
import { HutangHeaderInput } from '../validations/hutang.validation';
interface UpdateParams {
  id: string;
  fields: HutangHeaderInput;
}
interface validationFields {
  aksi: string;
  value: number | string;
}
export const getHutangHeaderFn = async (
  filters: GetParams = {}
): Promise<IAllHutangHeader> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/hutangheader', {
      params: queryParams
    });

    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed');
  }
};
export const getHutangHeaderByIdFn = async (
  id: number,
  filters: GetParams = {}
): Promise<IAllHutangHeader> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get(`/hutangheader/${id}`, {
      params: queryParams
    });

    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed');
  }
};
export const getHutangDetailFn = async (
  id: number
): Promise<IAllHutangDetail> => {
  const response = await api2.get(`/hutangdetail/${id}`);

  return response.data;
};
export const storeHutangFn = async (fields: HutangHeaderInput) => {
  const response = await api2.post(`/hutangheader`, fields);

  return response.data;
};
export const updateHutangFn = async ({ id, fields }: UpdateParams) => {
  const response = await api2.put(`/hutangheader/${id}`, fields);
  return response.data;
};
export const getHutangListFn = async (dari: string, sampai: string) => {
  try {
    // Construct the URL with query params
    const url = `/hutangheader/list?dari=${dari}&sampai=${sampai}`;

    // Using GET request with the full URL
    const response = await api2.get(url);

    return response.data;
  } catch (error) {
    console.error('Error fetching hutangheader:', error);
    throw new Error('Failed to fetch hutangheader');
  }
};
export const getHutangFn = async (id: string, dari: string, sampai: string) => {
  try {
    // Construct the URL with query params
    const url = `/hutangheader/?dari=${dari}&sampai=${sampai}&id=${id}`;

    // Using GET request with the full URL
    const response = await api2.get(url);

    return response.data;
  } catch (error) {
    console.error('Error fetching hutangheader:', error);
    throw new Error('Failed to fetch hutangheader');
  }
};
export const deleteHutangFn = async (id: string) => {
  try {
    const response = await api2.delete(`/hutangheader/${id}`);
    return response.data; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
export const checkValidationHutangFn = async (fields: validationFields) => {
  const response = await api2.post(`/hutangheader/check-validation`, fields);
  return response.data;
};
export const exportHutangFn = async (
  id: number,
  filters: any
): Promise<Blob> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get(`/hutangheader/export/${id}`, {
      params: queryParams,
      responseType: 'blob' // backend return file (Excel)
    });

    return response.data; // ini sudah Blob
  } catch (error) {
    console.error('Error exporting data Hutang:', error);
    throw new Error('Failed to export data Hutang');
  }
};
