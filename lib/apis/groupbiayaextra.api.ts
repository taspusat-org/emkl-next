import { GetParams } from '../types/all.type';
import {
  IAllGroupbiayaextra,
  IGroupbiayaextra
} from '../types/groupbiayaextra.type';
import { buildQueryParams } from '../utils';
import { api, api2 } from '../utils/AxiosInstance';
import { GroupbiayaextraInput } from '../validations/groupbiayaextra.validation';
import { MenuInput } from '../validations/menu.validation';

interface UpdateGroupbiayaextraParams {
  id: string;
  fields: GroupbiayaextraInput;
}

interface validationFields {
  aksi: string;
  value: number | string;
}

export const getGroupbiayaextraFn = async (
  filters: GetParams = {},
  signal?: AbortSignal
): Promise<IAllGroupbiayaextra> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/groupbiayaextra', {
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
export const deleteGroupbiayaextraFn = async (id: string) => {
  try {
    const response = await api2.delete(`/groupbiayaextra/${id}`);
    return response.data; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
export const updateGroupbiayaextraFn = async ({
  id,
  fields
}: UpdateGroupbiayaextraParams) => {
  const response = await api2.put(`/groupbiayaextra/update/${id}`, fields);
  return response.data;
};

export const storeGroupbiayaextraFn = async (fields: GroupbiayaextraInput) => {
  const response = await api2.post(`/groupbiayaextra`, fields);

  return response.data;
};

export const exportGroupbiayaextraFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/groupbiayaextra/export', {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};

export const checkValidationGroupbiayaextraFn = async (
  fields: validationFields
) => {
  const response = await api2.post(`/groupbiayaextra/check-validation`, fields);

  return response;
};
