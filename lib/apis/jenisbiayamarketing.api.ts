import { GetParams } from '../types/all.type';
import { IAllJenisBiayaMarketing } from '../types/jenisbiayamarketing.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';
import { JenisBiayaMarketingInput } from '../validations/jenisbiayamarketing.validation';

interface UpdateJenisBiayaMarketingParams {
  id: string;
  fields: JenisBiayaMarketingInput;
}
interface validationFields {
  aksi: string;
  value: number | string;
}

export const getJenisBiayaMarketingFn = async (
  filters: GetParams = {},
  signal?: AbortSignal
): Promise<IAllJenisBiayaMarketing> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/jenisbiayamarketing', {
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
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/jenisbiayamarketing', {
      params: queryParams
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching jenis biaya marketing:', error);
    throw new Error('failed to fetch jenis biaya marketing');
  }
};

export const storeJenisBiayaMarketingFn = async (
  fields: JenisBiayaMarketingInput
) => {
  const response = await api2.post(`/jenisbiayamarketing`, fields);
  return response.data;
};

export const deleteJenisBiayaMarketingFn = async (id: string) => {
  try {
    const response = await api2.delete(`/jenisbiayamarketing/${id}`);
    return response.data; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
export const updateJenisBiayaMarketingFn = async ({
  id,
  fields
}: UpdateJenisBiayaMarketingParams) => {
  const response = await api2.put(`/jenisbiayamarketing/${id}`, fields);
  return response.data;
};
export const exportJenisBiayaMarketingFn = async (
  filters: any
): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/jenisbiayamarketing/export', {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};

export const checkValidationJenisBiayaMarketingFn = async (
  fields: validationFields
) => {
  const response = await api2.post(
    `/jenisbiayamarketing/check-validation`,
    fields
  );

  return response;
};
