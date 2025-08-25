import { GetParams } from '../types/all.type';
import { IAllSandarKapal } from '../types/sandarkapal.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';
import { SandarKapalInput } from '../validations/sandarkapal.validation';

interface UpdateSandarKapalParams {
  id: string;
  fields: SandarKapalInput;
}

interface validationFields {
  aksi: string;
  value: number | string;
}

export const getAllSandarKapalFn = async (
  filters: GetParams = {}
): Promise<IAllSandarKapal> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('sandarkapal', { params: queryParams });

    return response.data;
  } catch (error) {
    console.error('Error fetching Type Akuntansi data:', error);
    throw new Error('Failed to fetch Type Akuntansi data');
  }
};

export const storeSandarKapalFn = async (fields: SandarKapalInput) => {
  const response = await api2.post(`/sandarkapal`, fields);

  return response.data;
};

export const updateSandarKapalFn = async ({
  id,
  fields
}: UpdateSandarKapalParams) => {
  const response = await api2.put(`/sandarkapal/${id}`, fields);

  return response.data;
};

export const deleteSandarKapalFn = async (id: string) => {
  try {
    const response = await api2.delete(`sandarkapal/${id}`);

    return response;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

export const checkValidationSandarKapalFn = async (
  fields: validationFields
) => {
  const response = await api2.post(`/sandarkapal/check-validation`, fields);

  return response;
};
