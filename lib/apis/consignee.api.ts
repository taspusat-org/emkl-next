import { GetParams } from '../types/all.type';
import {
  IAllConsignee,
  IAllConsigneeBiaya,
  IAllConsigneeDetail,
  IAllConsigneeHargaJual,
  IConsignee
} from '../types/consignee.type';
import { buildQueryParams } from '../utils';
import { api, api2 } from '../utils/AxiosInstance';
import { ConsigneeInput } from '../validations/consignee.validation';

interface UpdateConsigneeParams {
  id: string;
  fields: ConsigneeInput;
}

export const getConsigneeFn = async (
  filters: GetParams = {},
  signal?: AbortSignal
): Promise<IAllConsignee> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/consignee', {
      params: queryParams,
      signal
    });

    return response.data;
  } catch (error) {
    if (signal?.aborted) {
      throw new Error('Request was cancelled');
    }
    console.error('Error fetching Consignee:', error);
    throw new Error('Failed to fetch Consignee');
  }
};

export const deleteConsigneeFn = async (id: string) => {
  try {
    const response = await api2.delete(`/consignee/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting consignee:', error);
    throw error;
  }
};

export const updateConsigneeFn = async ({
  id,
  fields
}: UpdateConsigneeParams) => {
  const response = await api2.put(`/consignee/${id}`, fields);
  return response.data;
};

export const storeConsigneeFn = async (fields: ConsigneeInput) => {
  const response = await api2.post(`/consignee`, fields);
  return response.data;
};

export const exportConsigneeFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/consignee/export', {
      params: queryParams,
      responseType: 'blob'
    });

    return response.data;
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};

export const getColumnConsigneeFn = async () => {
  try {
    const response = await api2.get('/consignee/column');
    return response.data;
  } catch (error) {
    console.error('Error fetching consignee columns:', error);
    throw new Error('Failed to fetch consignee columns');
  }
};
export const getConsigneeDetailFn = async (
  filters: GetParams = {}
): Promise<IAllConsigneeDetail> => {
  const queryParams = buildQueryParams(filters);
  const response = await api2.get(`/consigneedetail`, {
    params: queryParams
  });
  return response.data;
};
export const getConsigneeBiayaFn = async (
  filters: GetParams = {}
): Promise<IAllConsigneeBiaya> => {
  const queryParams = buildQueryParams(filters);
  const response = await api2.get(`/consigneebiaya`, {
    params: queryParams
  });
  return response.data;
};
export const getConsigneeHargaJualFn = async (
  filters: GetParams = {}
): Promise<IAllConsigneeHargaJual> => {
  const queryParams = buildQueryParams(filters);
  const response = await api2.get(`/consigneehargajual`, {
    params: queryParams
  });
  return response.data;
};
