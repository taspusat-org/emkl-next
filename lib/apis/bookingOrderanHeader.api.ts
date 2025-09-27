import { buildQueryParams } from '../utils';
import { GetParams } from '../types/all.type';
import { api2 } from '../utils/AxiosInstance';
import { IAllBookingOrderanMuatan } from '../types/bookingOrderanHeader.type';
import {
  bookingOrderanMuatanInput,
  jobPartyHeaderInput
} from '../validations/bookingorderanheader.validation';

interface UpdateBookingOrderanHeaderParams {
  id: string;
  fields: bookingOrderanMuatanInput;
}

interface validationFields {
  aksi: string;
  value: number | string;
  jenisOrderan: number | null | string;
}

export const getAllBookingOrderanMuatanFn = async (
  filters: GetParams = {},
  signal?: AbortSignal
): Promise<IAllBookingOrderanMuatan> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('bookingorderanheader', {
      params: queryParams,
      signal
    });

    return response.data;
  } catch (error) {
    // Jika error karena abort, jangan log sebagai error
    if (signal?.aborted) {
      throw new Error('Request was cancelled');
    }
    console.error('Error fetching Booking Orderan Header data:', error);
    throw new Error('Failed to fetch Booking Orderan Header data');
  }
};

export const getBookingOrderanMuatanByIdFn = async (
  id: number
): Promise<IAllBookingOrderanMuatan> => {
  try {
    const response = await api2.get(
      `/bookingorderanheader/getbookingorderanmuatanById/${id}`
    );

    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed');
  }
};

export const storeBookingOrderanMuatanFn = async (
  fields: bookingOrderanMuatanInput
) => {
  const response = await api2.post(`/bookingorderanheader`, fields);

  return response.data;
};

export const storeBookingMuatanPartyFn = async (
  fields: jobPartyHeaderInput
) => {
  const response = await api2.post(`/bookingorderanheader`, fields);

  return response.data;
};

export const updateBookingOrderanMuatanFn = async ({
  id,
  fields
}: UpdateBookingOrderanHeaderParams) => {
  const response = await api2.put(`/bookingorderanheader/${id}`, fields);

  return response.data;
};

export const deleteBookingOrderanMuatanFn = async ({
  id,
  jenisOrderan
}: {
  id: string;
  jenisOrderan: string;
}) => {
  try {
    const response = await api2.delete(`bookingorderanheader/${id}`, {
      data: { jenisOrderan }
    });

    return response;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

export const checkValidationBookingOrderanHeaderFn = async (
  fields: validationFields
) => {
  const response = await api2.post(
    `/bookingorderanheader/check-validation`,
    fields
  );

  return response;
};

export const exportBookingOrderanHeaderFn = async (
  id: number,
  filters: any
): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get(`/bookingorderanheader/export/${id}`, {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data booking orderan header:', error);
    throw new Error('Failed to export data booking orderan header');
  }
};
