import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';
import { GetParams } from '../types/all.type';
import {
  MarketingDetailInput,
  MarketingInput
} from '../validations/marketing.validation';
import {
  IAllMarketingBiaya,
  IAllMarketingDetail,
  IAllMarketingHeader,
  IAllMarketingManager,
  IAllMarketingOrderan,
  IAllMarketingProsesfee
} from '../types/marketingheader.type';

interface UpdateParams {
  id: string;
  fields: MarketingInput;
}

interface validationFields {
  aksi: string;
  value: number | string;
}

export const getMarketingHeaderFn = async (
  filters: GetParams = {}
): Promise<IAllMarketingHeader> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/marketing', { params: queryParams });

    return response.data;
  } catch (error) {
    console.error('Error to get data all marketing in api fe:', error);
    throw new Error('Failed to get data all marketing in api fe');
  }
};

export const getMarketingOrderanFn = async (
  id: number,
  filters: GetParams = {}
): Promise<IAllMarketingOrderan> => {
  const queryParams = buildQueryParams(filters);
  const response = await api2.get(`/marketingorderan/${id}`, {
    params: queryParams
  });

  return response.data;
};

export const getMarketingBiayaFn = async (
  id: number,
  filters: GetParams = {}
): Promise<IAllMarketingBiaya> => {
  const queryParams = buildQueryParams(filters);
  const response = await api2.get(`/marketingbiaya/${id}`, {
    params: queryParams
  });

  return response.data;
};

export const getMarketingManagerFn = async (
  id: number,
  filters: GetParams = {}
): Promise<IAllMarketingManager> => {
  const queryParams = buildQueryParams(filters);
  const response = await api2.get(`/marketingmanager/${id}`, {
    params: queryParams
  });
  return response.data;
};

export const getMarketingProsesFeeFn = async (
  id: number,
  filters: GetParams = {}
): Promise<IAllMarketingProsesfee> => {
  const queryParams = buildQueryParams(filters);
  const response = await api2.get(`/marketingprosesfee/${id}`, {
    params: queryParams
  });

  return response.data;
};

export const getMarketingDetailFn = async (
  id: number,
  filters: GetParams = {}
): Promise<IAllMarketingDetail> => {
  const queryParams = buildQueryParams(filters);
  const response = await api2.get(`/marketingdetail/${id}`, {
    params: queryParams
  });

  return response.data;
};

export const storeMarketingFn = async (fields: MarketingInput) => {
  const response = await api2.post(`/marketing`, fields);
  return response.data;
};

export const updateMarketingFn = async ({ id, fields }: UpdateParams) => {
  const response = await api2.put(`/marketing/${id}`, fields);
  return response.data;
};

export const deleteMarketingFn = async (id: string) => {
  try {
    const response = await api2.delete(`marketing/${id}`);
    return response;
  } catch (error) {
    console.error('Error deleting marketing in api fe:', error);
    throw error;
  }
};

export const storeMarketingDetailFn = async (fields: MarketingDetailInput) => {
  const response = await api2.post('/marketingdetail', fields);
  return response.data;
};

export const checkValidationMarketingFn = async (fields: validationFields) => {
  const response = await api2.post(`/marketing/check-validation`, fields);

  return response;
};

export const checkValidationEditmarketingDetailFn = async (
  fields: validationFields
) => {
  const response = await api2.post(`/marketingdetail/check-validation`, fields);

  return response;
};
