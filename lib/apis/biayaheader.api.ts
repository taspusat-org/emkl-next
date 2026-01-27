import { buildQueryParams } from '../utils';
import { GetParams } from '../types/all.type';
import { api2 } from '../utils/AxiosInstance';
import { biayaHeaderInput } from '../validations/biayaheader.validation';
import {
  IAllBiayaMuatanDetail,
  IAllBiayaHeader
} from '../types/biayaheader.type';

interface UpdateBiayaHeaderParams {
  id: string;
  fields: biayaHeaderInput;
}

interface validationFields {
  aksi: string;
  value: number | string;
}

export const getAllBiayaHeaderFn = async (
  filters: GetParams = {},
  signal?: AbortSignal
): Promise<IAllBiayaHeader> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('biayaheader', {
      params: queryParams,
      signal
    });

    return response.data;
  } catch (error) {
    // Jika error karena abort, jangan log sebagai error
    if (signal?.aborted) {
      throw new Error('Request was cancelled');
    }
    console.error('Error fetching Biaya Header data:', error);
    throw new Error('Failed to fetch Biaya Header data');
  }
};

export const getBiayaHeaderByIdFn = async (id: any) => {
  try {
    const response = await api2.get(`/biayaheader/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error to get data biaya header by id in api fe', error);
    throw new Error('Error to get data biaya header by id in api fe');
  }
};

export const getBiayaMuatanDetailFn = async (
  id: number,
  filters: GetParams = {}
): Promise<IAllBiayaMuatanDetail> => {
  const queryParams = buildQueryParams(filters);
  const response = await api2.get(`/biayamuatandetail/${id}`, {
    params: queryParams
  });

  return response.data;
};

export const storeBiayaHeaderFn = async (fields: biayaHeaderInput) => {
  const response = await api2.post(`/biayaheader`, fields);
  return response.data;
};

export const updateBiayaHeaderFn = async ({
  id,
  fields
}: UpdateBiayaHeaderParams) => {
  const response = await api2.put(`/biayaheader/${id}`, fields);
  return response.data;
};

export const deleteBiayaHeaderFn = async (id: string) => {
  try {
    const response = await api2.delete(`biayaheader/${id}`);

    return response;
  } catch (error) {
    console.error('Error deleting  biaya header in api fe:', error);
    throw error;
  }
};

export const checkValidationBiayaFn = async (fields: validationFields) => {
  const response = await api2.post(`/biayaheader/check-validation`, fields);

  return response;
};

export const exportBiayaHeaderFn = async (id: number): Promise<any> => {
  try {
    const response = await api2.get(`/biayaheader/export/${id}`, {
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data biaya header:', error);
    throw new Error('Failed to export data biaya header');
  }
};
