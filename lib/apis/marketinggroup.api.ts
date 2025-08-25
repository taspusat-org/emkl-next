import { GetParams } from '../types/all.type';
import { IAllMarketingGroup } from '../types/marketinggroup.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';
import { MarketingGroupInput } from '../validations/marketinggroup.validation';

interface UpdateMarketingGroupParams {
  id: string;
  fields: MarketingGroupInput;
}

export const getMarketingGroupFn = async (
  filters: GetParams = {}
): Promise<IAllMarketingGroup> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/marketinggroup', {
      params: queryParams
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching marketing group:', error);
    throw new Error('failed to fetch marketing group');
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
