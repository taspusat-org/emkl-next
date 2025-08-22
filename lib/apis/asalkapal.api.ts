import { GetParams } from '../types/all.type';
import { IAllAsalKapal } from '../types/asalkapal.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';
import { AsalKapalInput } from '../validations/asalkapal.validation';

interface UpdateAsalKapalParams {
  id: string;
  fields: AsalKapalInput;
}

interface validationFields {
  aksi: string;
  value: number | string;
}

export const getAllAsalKapalFn = async (
  filters: GetParams = {}
): Promise<IAllAsalKapal> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('asalkapal', { params: queryParams });

    return response.data;
  } catch (error) {
    console.error('Error fetching Type Akuntansi data:', error);
    throw new Error('Failed to fetch Type Akuntansi data');
  }
};

export const storeAsalKapalFn = async (fields: AsalKapalInput) => {
  const response = await api2.post(`/asalkapal`, fields);

  return response.data;
};

export const updateAsalKapalFn = async ({
  id,
  fields
}: UpdateAsalKapalParams) => {
  const response = await api2.put(`/asalkapal/${id}`, fields);

  return response.data;
};

export const deleteAsalKapalFn = async (id: string) => {
  try {
    const response = await api2.delete(`asalkapal/${id}`);

    return response;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

export const checkValidationAsalKapalFn = async (
  fields: validationFields
) => {
  const response = await api2.post(`/asalkapal/check-validation`, fields);

  return response;
};
