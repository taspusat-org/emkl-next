import { GetParams } from '../types/all.type';
import { IAllJenisBiayaMarketing } from '../types/jenisbiayamarketing.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';
import { JenisBiayaMarketingInput } from '../validations/jenisbiayamarketing.validation';

interface UpdateJenisBiayaMarketingParams {
  id: string;
  fields: JenisBiayaMarketingInput;
}

export const getJenisBiayaMarketingFn = async (
  filters: GetParams = {}
): Promise<IAllJenisBiayaMarketing> => {
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
