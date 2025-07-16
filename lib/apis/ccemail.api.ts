import { GetParams } from '../types/all.type';
import { IAllCcEmail } from '../types/ccemail.type';
import { buildQueryParams } from '../utils';
import { api, api2 } from '../utils/AxiosInstance';
import { CcEmailInput } from '../validations/ccemail.validation';

interface updateCcEmailParams {
  id: number;
  fields: CcEmailInput;
}

export const getAllCcEmailFn = async (
  filters: GetParams = {}
): Promise<IAllCcEmail> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/ccemail', { params: queryParams });

    return response.data;
  } catch (error) {
    console.error('Error fetching CC EMAIL data:', error);
    throw new Error('Failed to fetch CC EMAIL data');
  }
};

export const storeCcemailFn = async (fields: CcEmailInput) => {
  const response = await api2.post(`/ccemail`, fields);

  return response.data;
};

export const updateCcEmailFn = async ({ id, fields }: updateCcEmailParams) => {
  const response = await api2.put(`/ccemail/${id}`, fields);

  return response.data;
};

export const deleteCcemailFn = async (id: string) => {
  try {
    const response = await api2.delete(`/ccemail/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

export const reportCcemailBySelectFn = async (ids: { id: number }[]) => {
  try {
    // Sending the data in the correct format to the NestJS API
    const response = await api2.post(`/ccemail/report-byselect`, ids);

    return response.data; // Assuming the API returns the data properly
  } catch (error) {
    console.error('Error in sending data:', error);
    throw new Error('Failed to send data to the API');
  }
};

export const exportCcemailFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/ccemail/export', {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};

export const exportCcemailBySelectFn = async (ids: { id: number }[]) => {
  try {
    const response = await api2.post('/ccemail/export-byselect', ids, {
      responseType: 'blob'
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
