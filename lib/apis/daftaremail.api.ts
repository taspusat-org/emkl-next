import { GetParams } from '../types/all.type';
import {
  IAllDaftarEmail,
  IAllDaftarEmailToDetail
} from '../types/daftaremail.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';
import { DaftarEmailInput } from '../validations/daftaremail.validation';
interface UpdateParams {
  id: string;
  fields: DaftarEmailInput;
}
export const getDaftarEmailFn = async (
  filters: GetParams = {}
): Promise<IAllDaftarEmail> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/daftaremail', { params: queryParams });

    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch data');
  }
};
export const storeDaftarEmailFn = async (fields: DaftarEmailInput) => {
  const response = await api2.post(`/daftaremail`, fields);

  return response.data;
};
export const updateDaftarEmailFn = async ({ id, fields }: UpdateParams) => {
  const response = await api2.put(`/daftaremail/${id}`, fields);
  return response.data;
};
export const deleteDaftarEmailFn = async (id: number) => {
  try {
    const response = await api2.delete(`/daftaremail/${id}`);
    return response.data; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
export const getToEmailDetail = async (
  id: number
): Promise<IAllDaftarEmailToDetail> => {
  const response = await api2.get(`/daftaremailtodetail/${id}`);

  return response.data;
};
export const getCcEmailDetail = async (
  id: number
): Promise<IAllDaftarEmailToDetail> => {
  const response = await api2.get(`/daftaremailccdetail/${id}`);

  return response.data;
};
export const updateDaftarEmailToDetailFn = async (fields: any) => {
  const response = await api2.put(
    `/daftaremailtodetail/${fields[0].daftaremail_id}`,
    fields
  );
  return response.data;
};
export const updateDaftarEmailCcDetailFn = async (fields: any) => {
  const response = await api2.put(
    `/daftaremailccdetail/${fields[0].daftaremail_id}`,
    fields
  );
  return response.data;
};
export const reportdaftaremailBySelectFn = async (ids: { id: number }[]) => {
  try {
    // Sending the data in the correct format to the NestJS API
    const response = await api2.post(`/daftaremail/report-byselect`, ids);

    return response.data; // Assuming the API returns the data properly
  } catch (error) {
    console.error('Error in sending data:', error);
    throw new Error('Failed to send data to the API');
  }
};

export const exportdaftaremailBySelectFn = async (ids: { id: number }[]) => {
  try {
    const response = await api2.post('/daftaremail/export-byselect', ids, {
      responseType: 'blob'
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
export const exportdaftaremailFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/daftaremail/export', {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
