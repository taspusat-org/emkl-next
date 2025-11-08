import { buildQueryParams } from '../utils';
import { GetParams } from '../types/all.type';
import { api2 } from '../utils/AxiosInstance';
import {
  IAllShippingInstruction,
  IAllShippingInstructionDetail,
  IAllShippingInstructionDetailRincian
} from '../types/shippingIntruction.type';
import { shippingInstructionHeaderInput } from '../validations/shippinginstruction.validation';

interface UpdateShippingInstructionParams {
  id: string;
  fields: shippingInstructionHeaderInput;
}

interface validationFields {
  aksi: string;
  value: number | string;
}

export const getAllShippingInstructionHeaderFn = async (
  filters: GetParams = {},
  signal?: AbortSignal
): Promise<IAllShippingInstruction> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('shippinginstruction', {
      params: queryParams,
      signal
    });

    return response.data;
  } catch (error) {
    // Jika error karena abort, jangan log sebagai error
    if (signal?.aborted) {
      throw new Error('Request was cancelled');
    }
    console.error('Error fetching Shipping Instruction data:', error);
    throw new Error('Failed to fetch Shipping Instruction data');
  }
};

export const getShippingInstructionDetailFn = async (
  id: number,
  filters: GetParams = {}
): Promise<IAllShippingInstructionDetail> => {
  const queryParams = buildQueryParams(filters);
  const response = await api2.get(`/shippinginstructiondetail/${id}`, {
    params: queryParams
  });

  return response.data;
};

export const getShippingInstructionDetailRincianFn = async (
  id: number,
  filters: GetParams = {}
): Promise<IAllShippingInstructionDetailRincian> => {
  const queryParams = buildQueryParams(filters);
  const response = await api2.get(`/shippinginstructiondetailrincian/${id}`, {
    params: queryParams
  });

  return response.data;
};

export const getShippingInstructionByIdFn = async (id: number) => {
  try {
    const response = await api2.get(`/shippinginstruction/${id}`);

    return response.data;
  } catch (error) {
    console.error('Error fetching Shipping Instruction By Id data :', error);
    throw new Error('Failed to fetch Shipping Instruction by id data');
  }
};

export const storeShippingInstructionFn = async (
  fields: shippingInstructionHeaderInput
) => {
  const response = await api2.post(`/shippinginstruction`, fields);
  return response.data;
};

export const updateShippingInstructionFn = async ({
  id,
  fields
}: UpdateShippingInstructionParams) => {
  const response = await api2.put(`/shippinginstruction/${id}`, fields);
  return response.data;
};

export const deleteShippingInstructionFn = async (id: string) => {
  try {
    const response = await api2.delete(`shippinginstruction/${id}`);

    return response;
  } catch (error) {
    console.error('Error deleting shipping instruction in api fe:', error);
    throw error;
  }
};

export const checkValidationShippingInstructionFn = async (
  fields: validationFields
) => {
  const response = await api2.post(
    `/shippinginstruction/check-validation`,
    fields
  );

  return response;
};

export const exportShippingInstructionFn = async (id: number): Promise<any> => {
  try {
    const response = await api2.get(`/shippinginstruction/export/${id}`, {
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data shipping instruction:', error);
    throw new Error('Failed to export data shipping instruction');
  }
};
