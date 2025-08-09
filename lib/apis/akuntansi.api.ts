import { GetParams } from '../types/all.type';
import { IAllAkuntansi } from '../types/akuntansi.type';
import { buildQueryParams } from '../utils';
import { api, api2 } from '../utils/AxiosInstance';
import { AkuntansiInput } from '../validations/akuntansi.validation';

interface updateAkuntansiParams {
  id: number;
  fields: AkuntansiInput;
}

export const getAkuntansiFn = async (
  filters: GetParams = {}
): Promise<IAllAkuntansi> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/akuntansi', { params: queryParams });

    return response.data;
  } catch (error) {
    console.error('Error fetching akuntansi:', error);
    throw new Error('Failed to fetch akuntansi');
  }
};

export const getAllAkuntansiFn = async (
  filters: GetParams = {}
): Promise<IAllAkuntansi> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/akuntansi', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching akuntansi data:', error);
    throw new Error('Failed to fetch akuntansi data');
  }
};

export const reportAkuntansiBySelectFn = async (ids: { id: number }[]) => {
  try {
    // Sending the data in the correct format to the NestJS API
    const response = await api2.post(`/akuntansi/report-byselect`, ids);

    return response.data; // Assuming the API returns the data properly
  } catch (error) {
    console.error('Error in sending data:', error);
    throw new Error('Failed to send data to the API');
  }
};

export const exportAkuntansiFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/akuntansi/export', {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
export const exportAkuntansiBySelectFn = async (ids: { id: number }[]) => {
  try {
    const response = await api2.post('/akuntansi/export-byselect', ids, {
      responseType: 'blob'
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
export const storeAkuntansiFn = async (fields: AkuntansiInput) => {
  // console.log('fields', fields);
  
  const response = await api2.post(`/akuntansi`, fields);
  return response.data;
};
export const updateAkuntansiFn = async ({ id, fields }: updateAkuntansiParams) => {
  const response = await api2.put(`/akuntansi/${id}`, fields);

  return response.data;
};

export const checkAkuntansiFn = async (id: number) => {
  const response = await api2.get(`/akuntansi/check/${id}`);
  return response.data;
};

export const deleteAkuntansiFn = async (id: string) => {
  try {
    const response = await api2.delete(`/akuntansi/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};
