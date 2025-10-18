import { buildQueryParams } from '../utils';
import { GetParams } from '../types/all.type';
import { api2 } from '../utils/AxiosInstance';
import { IAllOrderanMuatan } from '../types/orderanHeader.type';
import { orderanMuatanInput } from '../validations/orderanheader.validation';

interface UpdateOrderanHeaderParams {
  id: string;
  fields: orderanMuatanInput;
}

interface validationFields {
  aksi: string;
  value: number | string;
  jenisOrderan: number | null | string;
}

export const getAllOrderanMuatanFn = async (
  filters: GetParams = {},
  signal?: AbortSignal
): Promise<IAllOrderanMuatan> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('orderanheader', {
      params: queryParams,
      signal
    });

    return response.data;
  } catch (error) {
    // Jika error karena abort, jangan log sebagai error
    if (signal?.aborted) {
      throw new Error('Request was cancelled');
    }
    console.error('Error fetching Orderan Header data:', error);
    throw new Error('Failed to fetch Orderan Header data');
  }
};

export const updateOrderanMuatanFn = async ({
  id,
  fields
}: UpdateOrderanHeaderParams) => {
  const response = await api2.put(`/orderanheader/${id}`, fields);

  return response.data;
};

export const deleteOrderanMuatanFn = async ({
  id,
  jenisOrderan
}: {
  id: string;
  jenisOrderan: string;
}) => {
  try {
    const response = await api2.delete(`orderanheader/${id}`, {
      data: { jenisOrderan }
    });

    return response;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

export const checkValidationOrderanHeaderFn = async (
  fields: validationFields
) => {
  const response = await api2.post(`/orderanheader/check-validation`, fields);

  return response;
};
