import { GetParams } from '../types/all.type';
import { api2 } from '../utils/AxiosInstance';
import { buildQueryParams } from '../utils';
import { IAllPenerimaanHeader } from '../types/penerimaan.type';
import { PenerimaanHeaderInput } from '../validations/penerimaan.validation';

export const getPenerimaanHeaderFn = async (
  filters: GetParams = {}
): Promise<IAllPenerimaanHeader> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/penerimaanheader', {
      params: queryParams
    });

    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed');
  }
};
export const storePenerimaanFn = async (fields: PenerimaanHeaderInput) => {
  const response = await api2.post(`/penerimaanheader`, fields);

  return response.data;
};
