import { buildQueryParams } from '../utils';
import { GetParams } from '../types/all.type';
import { api2 } from '../utils/AxiosInstance';
import { biayaExtraHeaderInput } from '../validations/biayaextraheader.validation';
import {
  IAllBiayaExtraBongkaranDetail,
  IAllBiayaExtraHeader,
  IAllBiayaExtraMuatanDetail
} from '../types/biayaextraheader.type';

interface UpdateBiayaExtraHeaderParams {
  id: string;
  fields: biayaExtraHeaderInput;
}

interface validationFields {
  aksi: string;
  value: number | string;
}

export const getAllBiayaExtraHeaderFn = async (
  filters: GetParams = {},
  signal?: AbortSignal
): Promise<IAllBiayaExtraHeader> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('biayaextraheader', {
      params: queryParams,
      signal
    });

    return response.data;
  } catch (error) {
    // Jika error karena abort, jangan log sebagai error
    if (signal?.aborted) {
      throw new Error('Request was cancelled');
    }
    console.error('Error fetching Biaya Extra Header data:', error);
    throw new Error('Failed to fetch Biaya Extra Header data');
  }
};

export const getBiayaExtraHeaderByIdFn = async (id: any) => {
  try {
    const response = await api2.get(`/biayaextraheader/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      'Error to get data biaya extra header by id in api fe',
      error
    );
    throw new Error('Error to get data biaya extra header by id in api fe');
  }
};

export const getBiayaExtraMuatanDetailFn = async (
  id: number,
  filters: GetParams = {}
): Promise<IAllBiayaExtraMuatanDetail> => {
  const queryParams = buildQueryParams(filters);
  const response = await api2.get(`/biayaextramuatandetail/${id}`, {
    params: queryParams
  });

  return response.data;
};

export const getBiayaExtraBongkaranDetailFn = async (
  id: number,
  filters: GetParams = {}
): Promise<IAllBiayaExtraBongkaranDetail> => {
  const queryParams = buildQueryParams(filters);
  const response = await api2.get(`/biayaextrabongkarandetail/${id}`, {
    params: queryParams
  });

  return response.data;
};

export const storeBiayaExtraHeaderFn = async (
  fields: biayaExtraHeaderInput
) => {
  const response = await api2.post(`/biayaextraheader`, fields);
  return response.data;
};

export const updateBiayaExtraHeaderFn = async ({
  id,
  fields
}: UpdateBiayaExtraHeaderParams) => {
  const response = await api2.put(`/biayaextraheader/${id}`, fields);
  return response.data;
};

export const deleteBiayaExtraHeaderFn = async (id: string) => {
  try {
    const response = await api2.delete(`biayaextraheader/${id}`);

    return response;
  } catch (error) {
    console.error('Error deleting biaya extra header in api fe:', error);
    throw error;
  }
};

export const checkValidationBiayaExtraHeaderFn = async (
  fields: validationFields
) => {
  const response = await api2.post(
    `/biayaextraheader/check-validation`,
    fields
  );

  return response;
};

export const exportBiayaExtraHeaderFn = async (id: number): Promise<any> => {
  try {
    const response = await api2.get(`/biayaextraheader/export/${id}`, {
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data biaya extra header:', error);
    throw new Error('Failed to export data biaya extra header');
  }
};
