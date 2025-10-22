import { GetParams } from '../types/all.type';
import { IAllMarketingGroup } from '../types/marketinggroup.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';
import { MarketingGroupInput } from '../validations/marketinggroup.validation';

interface UpdateMarketingGroupParams {
  id: string;
  fields: MarketingGroupInput;
}
interface validationFields {
  aksi: string;
  value: number | string;
}

export const getMarketingGroupFn = async (
  filters: GetParams = {},
  signal?: AbortSignal
): Promise<IAllMarketingGroup> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/marketinggroup', {
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

export const storeMarketingGroupFn = async (fields: MarketingGroupInput) => {
  const response = await api2.post(`/marketinggroup`, fields);
  return response.data;
};

export const deleteMarketingGroupFn = async (id: string) => {
  try {
    const response = await api2.delete(`/marketinggroup/${id}`);
    return response.data; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
export const updateMarketingGroupFn = async ({
  id,
  fields
}: UpdateMarketingGroupParams) => {
  const response = await api2.put(`/marketinggroup/${id}`, fields);
  return response.data;
};

export const exportMarketingGroupFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/marketinggroup/export', {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};

export const checkValidationMarketingGroupFn = async (
  fields: validationFields
) => {
  const response = await api2.post(`/marketinggroup/check-validation`, fields);

  return response;
};
