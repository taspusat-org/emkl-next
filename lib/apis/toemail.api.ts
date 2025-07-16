import { GetParams } from '../types/all.type';
import { IAllToemail } from '../types/toemail.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';
import { ToemailInput } from '../validations/toemail.validation';
interface UpdateToemailParams {
  id: number;
  fields: ToemailInput;
}
interface ToemailDelete {
  id: string;
}
export const getToemailFn = async (
  filters: GetParams = {}
): Promise<IAllToemail> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/toemail', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching Toemail data:', error);
    throw new Error('Failed to fetch Toemail data');
  }
};
export const getToemailReportFn = async (
  filters: GetParams = {}
): Promise<IAllToemail> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/toemail/report-all', {
      params: queryParams
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching toemail data:', error);
    throw new Error('Failed to fetch toemail data');
  }
};

export const reportToemailBySelectFn = async (ids: { id: number }[]) => {
  try {
    // Sending the data in the correct format to the NestJS API
    const response = await api2.post(`/toemail/report-byselect`, ids);

    return response.data; // Assuming the API returns the data properly
  } catch (error) {
    console.error('Error in sending data:', error);
    throw new Error('Failed to send data to the API');
  }
};

export const exportToemailBySelectFn = async (ids: { id: number }[]) => {
  try {
    const response = await api2.post('/toemail/export-byselect', ids, {
      responseType: 'blob'
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};

export const storeToemailFn = async (fields: ToemailInput) => {
  const response = await api2.post(`/toemail`, fields);

  return response.data;
};
export const updateToemailFn = async ({ id, fields }: UpdateToemailParams) => {
  const response = await api2.put(`/toemail/${id}`, fields);

  return response.data;
};

export const checkToemailFn = async (id: number) => {
  const response = await api2.get(`/toemail/check/${id}`);
  return response.data;
};

export const deleteToemailFn = async (id: string) => {
  try {
    const response = await api2.delete(`/toemail/${id}`);
    return response.data; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting Toemail:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
export const getToemailByIdFn = async (id: number) => {
  try {
    const response = await api2.get(`/toemail/${id}`);
    return response; // Optionally return response data if needed
  } catch (error) {
    console.error('Error fetching toemail by id:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
export const exportToemailFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/toemail/export', {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
