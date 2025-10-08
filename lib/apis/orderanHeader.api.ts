import { buildQueryParams } from '../utils';
import { GetParams } from '../types/all.type';
import { api2 } from '../utils/AxiosInstance';
import { IAllOrderanMuatan } from '../types/orderanHeader.type';

// interface UpdateOrderanHeaderParams {
//   id: string;
//   fields: OrderanMuatanInput;
// }

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
