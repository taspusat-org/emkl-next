import { GetParams } from '../types/all.type';
import { IAllJenisCatatan } from '../types/jeniscatatan.type';
import { buildQueryParams } from '../utils';
import { api, api2 } from '../utils/AxiosInstance';
import { JenisCatatanInput } from '../validations/jeniscatatan.validation';

interface updateJenisCatatanParams {
  id: number;
  fields: JenisCatatanInput;
}

export const getAllJenisCatatanFn = async (
  filters: GetParams = {}
): Promise<IAllJenisCatatan> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/jeniscatatan', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching jeniscatatan data:', error);
    throw new Error('Failed to fetch jeniscatatan data');
  }
};

export const reportJenisCatatanBySelectFn = async (ids: { id: number }[]) => {
  try {
    // Sending the data in the correct format to the NestJS API
    const response = await api2.post(`/jeniscatatan/report-byselect`, ids);

    return response.data; // Assuming the API returns the data properly
  } catch (error) {
    console.error('Error in sending data:', error);
    throw new Error('Failed to send data to the API');
  }
};

export const exportJenisCatatanFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/jeniscatatan/export', {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
export const exportJenisCatatanBySelectFn = async (ids: { id: number }[]) => {
  try {
    const response = await api2.post('/jeniscatatan/export-byselect', ids, {
      responseType: 'blob'
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
export const storeJenisCatatanFn = async (fields: JenisCatatanInput) => {
  const response = await api2.post(`/jeniscatatan`, fields);
  return response.data;
};
export const updateJenisCatatanFn = async ({
  id,
  fields
}: updateJenisCatatanParams) => {
  const response = await api2.put(`/jeniscatatan/${id}`, fields);

  return response.data;
};

export const checkJenisCatatanFn = async (id: number) => {
  const response = await api2.get(`/jeniscatatan/check/${id}`);
  return response.data;
};

export const deleteJenisCatatanFn = async (id: string) => {
  try {
    const response = await api2.delete(`/jeniscatatan/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};
