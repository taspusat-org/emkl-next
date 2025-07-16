import { GetParams } from '../types/all.type';
import { IAllMutasi } from '../types/mutasi.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';
import { MutasiInput } from '../validations/mutasi.validation';
interface UpdateParams {
  id: string;
  fields: MutasiInput;
}
export const getMutasiFn = async (
  filters: GetParams = {}
): Promise<IAllMutasi> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/mutasi', { params: queryParams });

    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch data');
  }
};
export const storeMutasiFn = async (fields: MutasiInput) => {
  const response = await api2.post(`/mutasi`, fields);

  return response.data;
};
export const updateMutasiFn = async ({ id, fields }: UpdateParams) => {
  const response = await api2.put(`/mutasi/${id}`, fields);
  return response.data;
};
export const deleteMutasiFn = async (id: number) => {
  try {
    const response = await api2.delete(`/mutasi/${id}`);
    return response.data; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
export const exportMutasiFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/mutasi/export', {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
export const exportMutasiBySelectFn = async (ids: { id: number }[]) => {
  try {
    const response = await api2.post('/mutasi/export-byselect', ids, {
      responseType: 'blob'
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
export const reportMutasiBySelectFn = async (ids: { id: number }[]) => {
  try {
    // Sending the data in the correct format to the NestJS API
    const response = await api2.post(`/mutasi/report-byselect`, ids);

    return response.data; // Assuming the API returns the data properly
  } catch (error) {
    console.error('Error in sending data:', error);
    throw new Error('Failed to send data to the API');
  }
};
