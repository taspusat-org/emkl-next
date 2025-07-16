import { GetParams } from '../types/all.type';
import { IAllCatatan } from '../types/catatan.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';
import { CatatanInput } from '../validations/catatan.validation';

interface UpdateParams {
  id: string;
  fields: CatatanInput;
}
export const getCatatanFn = async (
  filters: GetParams = {}
): Promise<IAllCatatan> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/catatan', { params: queryParams });

    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch data');
  }
};
export const storeCatatanFn = async (fields: CatatanInput) => {
  const response = await api2.post(`/catatan`, fields);

  return response.data;
};
export const updateCatatanFn = async ({ id, fields }: UpdateParams) => {
  const response = await api2.put(`/catatan/${id}`, fields);
  return response.data;
};
export const deleteCatatanFn = async (id: number) => {
  try {
    const response = await api2.delete(`/catatan/${id}`);
    return response.data; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
export const exportCatatanFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/catatan/export', {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
export const exportCatatanBySelectFn = async (ids: { id: number }[]) => {
  try {
    const response = await api2.post('/catatan/export-byselect', ids, {
      responseType: 'blob'
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
export const reportCatatanBySelectFn = async (ids: { id: number }[]) => {
  try {
    // Sending the data in the correct format to the NestJS API
    const response = await api2.post(`/catatan/report-byselect`, ids);

    return response.data; // Assuming the API returns the data properly
  } catch (error) {
    console.error('Error in sending data:', error);
    throw new Error('Failed to send data to the API');
  }
};
