import { GetParams } from '../types/all.type';
import { IAllComodity, IComodity } from '../types/comodity.type';
import { buildQueryParams } from '../utils';
import { api, api2 } from '../utils/AxiosInstance';
import { ComodityInput } from '../validations/comodity.validation';
import { MenuInput } from '../validations/menu.validation';

interface UpdateComodityParams {
  id: string;
  fields: ComodityInput;
}

interface validationFields {
  aksi: string;
  value: number | string;
}

export const getComodityFn = async (
  filters: GetParams = {},
  signal?: AbortSignal
): Promise<IAllComodity> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/comodity', {
      params: queryParams,
      signal
    });

    return response.data;
  } catch (error) {
    if (signal?.aborted) {
      throw new Error('Request was cancelled');
    }
    console.error('Error fetching data', error);
    throw new Error('Failed to fetch data');
  }
};
export const deleteComodityFn = async (id: string) => {
  try {
    const response = await api2.delete(`/comodity/${id}`);
    return response.data; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
export const updateComodityFn = async ({
  id,
  fields
}: UpdateComodityParams) => {
  const response = await api2.put(`/comodity/update/${id}`, fields);
  return response.data;
};

export const storeComodityFn = async (fields: ComodityInput) => {
  const response = await api2.post(`/comodity`, fields);

  return response.data;
};

export const exportComodityFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/comodity/export', {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};

export const checkValidationComodityFn = async (fields: validationFields) => {
  const response = await api2.post(`/comodity/check-validation`, fields);

  return response;
};
