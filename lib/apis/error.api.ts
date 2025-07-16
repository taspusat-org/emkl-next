import { GetParams } from '../types/all.type';
import { IAllError } from '../types/error.type';
import { IAllParameters } from '../types/parameter.type';
import { buildQueryParams } from '../utils';
import { api, api2 } from '../utils/AxiosInstance';
import { ErrorInput } from '../validations/error.validation';
interface UpdateErrorParams {
  id: string;
  fields: ErrorInput;
}
interface ErrorDelete {
  id: string;
}

export const getErrorFn = async (
  filters: GetParams = {}
): Promise<IAllError> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/error', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching ACOS data:', error);
    throw new Error('Failed to fetch ACOS data');
  }
};
export const getErrorReportFn = async (
  filters: GetParams = {}
): Promise<IAllError> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/error/report-all', {
      params: queryParams
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching ACOS data:', error);
    throw new Error('Failed to fetch ACOS data');
  }
};

export const reportErrorBySelectFn = async (ids: { id: number }[]) => {
  try {
    // Sending the data in the correct format to the NestJS API
    const response = await api2.post(`/error/report-byselect`, ids);

    return response.data; // Assuming the API returns the data properly
  } catch (error) {
    console.error('Error in sending data:', error);
    throw new Error('Failed to send data to the API');
  }
};

export const exportErrorBySelectFn = async (ids: { id: number }[]) => {
  try {
    const response = await api2.post('/error/export-byselect', ids, {
      responseType: 'blob'
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};

export const storeErrorFn = async (fields: ErrorInput) => {
  const response = await api2.post(`/error`, fields);

  return response.data;
};
export const updateErrorFn = async ({ id, fields }: UpdateErrorParams) => {
  const response = await api2.put(`/error/${id}`, fields);
  return response.data;
};

export const deleteErrorFn = async (id: number) => {
  try {
    const response = await api2.delete(`/error/${id}`);
    return response.data; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
export const getErrorByIdFn = async (id: number) => {
  try {
    const response = await api2.get(`/error/${id}`);
    return response; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
export const exportErrorFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/error/export', {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
