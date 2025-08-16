import { GetParams } from '../types/all.type';
import { IAllKapal } from '../types/kapal.type';
import { buildQueryParams } from '../utils';
import { api, api2 } from '../utils/AxiosInstance';
import { KapalInput } from '../validations/kapal.validation';

interface updateKapalParams {
  id: number;
  fields: KapalInput;
}

export const getKapalFn = async (
  filters: GetParams = {}
): Promise<IAllKapal> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/kapal', { params: queryParams });

    return response.data;
  } catch (error) {
    console.error('Error fetching kapal:', error);
    throw new Error('Failed to fetch kapal');
  }
};

export const getAllKapalFn = async (
  filters: GetParams = {}
): Promise<IAllKapal> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/kapal', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching kapal data:', error);
    throw new Error('Failed to fetch kapal data');
  }
};

export const reportKapalBySelectFn = async (ids: { id: number }[]) => {
  try {
    // Sending the data in the correct format to the NestJS API
    const response = await api2.post(`/kapal/report-byselect`, ids);

    return response.data; // Assuming the API returns the data properly
  } catch (error) {
    console.error('Error in sending data:', error);
    throw new Error('Failed to send data to the API');
  }
};

export const exportKapalFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/kapal/export', {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
export const exportKapalBySelectFn = async (ids: { id: number }[]) => {
  try {
    const response = await api2.post('/kapal/export-byselect', ids, {
      responseType: 'blob'
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
export const storeKapalFn = async (fields: KapalInput) => {
  // console.log('fields', fields);
  
  const response = await api2.post(`/kapal`, fields);
  return response.data;
};
export const updateKapalFn = async ({ id, fields }: updateKapalParams) => {
  const response = await api2.put(`/kapal/${id}`, fields);

  return response.data;
};

export const checkKapalFn = async (id: number) => {
  const response = await api2.get(`/kapal/check/${id}`);
  return response.data;
};

export const deleteKapalFn = async (id: string) => {
  try {
    const response = await api2.delete(`/kapal/${id}`);
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error deleting order:', error);
    throw error;
  }
};
