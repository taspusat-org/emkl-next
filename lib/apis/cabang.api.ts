import { GetParams } from '../types/all.type';
import { IAllCabang } from '../types/cabang.type';
import { buildQueryParams } from '../utils';
import { api, api2 } from '../utils/AxiosInstance';
import { CabangInput } from '../validations/cabang.validation';

interface updateCabangParams {
  id: number;
  fields: CabangInput;
}

export const getAllCabangFn = async (
  filters: GetParams = {}
): Promise<IAllCabang> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/cabang', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching cabang data:', error);
    throw new Error('Failed to fetch cabang data');
  }
};

export const reportCabangBySelectFn = async (ids: { id: number }[]) => {
  try {
    // Sending the data in the correct format to the NestJS API
    const response = await api2.post(`/cabang/report-byselect`, ids);

    return response.data; // Assuming the API returns the data properly
  } catch (error) {
    console.error('Error in sending data:', error);
    throw new Error('Failed to send data to the API');
  }
};

export const exportCabangFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/cabang/export', {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
export const exportCabangBySelectFn = async (ids: { id: number }[]) => {
  try {
    const response = await api2.post('/cabang/export-byselect', ids, {
      responseType: 'blob'
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
export const storeCabangFn = async (fields: CabangInput) => {
  const response = await api2.post(`/cabang`, fields);
  return response.data;
};
export const updateCabangFn = async ({ id, fields }: updateCabangParams) => {
  const response = await api2.put(`/cabang/${id}`, fields);

  return response.data;
};

export const checkCabangFn = async (id: number) => {
  const response = await api2.get(`/cabang/check/${id}`);
  return response.data;
};

export const deleteCabangFn = async (id: string) => {
  try {
    const response = await api2.delete(`/cabang/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};
