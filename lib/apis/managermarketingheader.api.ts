import { GetParams } from '../types/all.type';
import {
  IAllManagerMarketingDetail,
  IAllManagerMarketingHeader
} from '../types/managermarketingheader.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';
import { ManagerMarketingHeaderInput } from '../validations/managermarketing.validation';
interface UpdateParams {
  id: string;
  fields: ManagerMarketingHeaderInput;
}
interface validationFields {
  aksi: string;
  value: number | string;
}
export const getManagerMarketingHeaderFn = async (
  filters: GetParams = {}
): Promise<IAllManagerMarketingHeader> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/managermarketing', {
      params: queryParams
    });

    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed');
  }
};
export const getManagerMarketingDetailFn = async (
  id: number
): Promise<IAllManagerMarketingDetail> => {
  const response = await api2.get(`/managermarketingdetail/${id}`);

  return response.data;
};
export const storeManagerMarketingFn = async (
  fields: ManagerMarketingHeaderInput
) => {
  const response = await api2.post(`/managermarketing`, fields);

  return response.data;
};
export const updateManagerMarketingFn = async ({
  id,
  fields
}: UpdateParams) => {
  const response = await api2.put(`/managermarketing/${id}`, fields);
  return response.data;
};

export const deleteManagerMarketingFn = async (id: string) => {
  try {
    const response = await api2.delete(`/managermarketing/${id}`);
    return response.data; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
