import { GetParams } from '../types/all.type';
import { IAllJabatan } from '../types/jabatan.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';
import { JabatanInput } from '../validations/jabatan.validation';
interface UpdateJabatanParams {
  id: number;
  fields: JabatanInput;
}
interface JabatanDelete {
  id: string;
}
export const getJabatanFn = async (
  filters: GetParams = {}
): Promise<IAllJabatan> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/jabatan', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching Jabatan data:', error);
    throw new Error('Failed to fetch Jabatan data');
  }
};
export const getJabatanReportFn = async (
  filters: GetParams = {}
): Promise<IAllJabatan> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/jabatan/report-all', {
      params: queryParams
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching jabatan data:', error);
    throw new Error('Failed to fetch jabatan data');
  }
};

export const reportJabatanBySelectFn = async (ids: { id: number }[]) => {
  try {
    // Sending the data in the correct format to the NestJS API
    const response = await api2.post(`/jabatan/report-byselect`, ids);

    return response.data; // Assuming the API returns the data properly
  } catch (error) {
    console.error('Error in sending data:', error);
    throw new Error('Failed to send data to the API');
  }
};

export const exportJabatanBySelectFn = async (ids: { id: number }[]) => {
  try {
    const response = await api2.post('/jabatan/export-byselect', ids, {
      responseType: 'blob'
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};

export const storeJabatanFn = async (fields: JabatanInput) => {
  const response = await api2.post(`/jabatan`, fields);

  return response.data;
};
export const updateJabatanFn = async ({ id, fields }: UpdateJabatanParams) => {
  const response = await api2.put(`/jabatan/${id}`, fields);

  return response.data;
};

export const checkJabatanFn = async (id: number) => {
  const response = await api2.get(`/jabatan/check/${id}`);
  return response.data;
};

export const deleteJabatanFn = async (id: string) => {
  try {
    const response = await api2.delete(`/jabatan/${id}`);
    return response.data; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting Jabatan:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
export const getJabatanByIdFn = async (id: number) => {
  try {
    const response = await api2.get(`/jabatan/${id}`);
    return response; // Optionally return response data if needed
  } catch (error) {
    console.error('Error fetching jabatan by id:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
export const exportJabatanFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/jabatan/export', {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
