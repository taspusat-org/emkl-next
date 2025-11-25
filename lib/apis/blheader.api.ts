import { buildQueryParams } from '../utils';
import { GetParams } from '../types/all.type';
import { api2 } from '../utils/AxiosInstance';
import {
  IAllBlDetail,
  IAllBlDetailRincian,
  IAllBlHeader,
  IAllBlRincianBiaya
} from '../types/blheader.type';
import { blHeaderInput } from '../validations/blheader.validation';

interface UpdateBlHeaderParams {
  id: string;
  fields: blHeaderInput;
}

interface validationFields {
  aksi: string;
  value: number | string;
}

export const getAllBlHeaderHeaderFn = async (
  filters: GetParams = {},
  signal?: AbortSignal
): Promise<IAllBlHeader> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('blheader', {
      params: queryParams,
      signal
    });

    return response.data;
  } catch (error) {
    // Jika error karena abort, jangan log sebagai error
    if (signal?.aborted) {
      throw new Error('Request was cancelled');
    }
    console.error('Error fetching Bl Header data:', error);
    throw new Error('Failed to fetch Bl Header data');
  }
};

export const getBlDetailFn = async (
  id: number,
  filters: GetParams = {}
): Promise<IAllBlDetail> => {
  const queryParams = buildQueryParams(filters);
  const response = await api2.get(`/bldetail/${id}`, {
    params: queryParams
  });

  return response.data;
};

export const getBlDetailRincianFn = async (
  id: number,
  filters: GetParams = {}
): Promise<IAllBlDetailRincian> => {
  const queryParams = buildQueryParams(filters);
  const response = await api2.get(`/bldetailrincian/${id}`, {
    params: queryParams
  });

  return response.data;
};

export const getBlRincianBiayaFn = async (
  id: number,
  filters: GetParams = {}
): Promise<IAllBlRincianBiaya> => {
  const queryParams = buildQueryParams(filters);
  const response = await api2.get(`/bldetailrincianbiaya/${id}`, {
    params: queryParams
  });

  return response.data;
};

export const getBlHeaderByIdFn = async (id: number) => {
  try {
    const response = await api2.get(`/blheader/${id}`);

    return response.data;
  } catch (error) {
    console.error('Error fetching Bl Header By Id data :', error);
    throw new Error('Failed to fetch Bl Header by id data');
  }
};

export const storeBlHeaderFn = async (fields: blHeaderInput) => {
  const response = await api2.post(`/blheader`, fields);
  return response.data;
};

export const updateBlHeaderFn = async ({
  id,
  fields
}: UpdateBlHeaderParams) => {
  const response = await api2.put(`/blheader/${id}`, fields);
  return response.data;
};

export const deleteBlHeaderFn = async (id: string) => {
  try {
    const response = await api2.delete(`blheader/${id}`);

    return response;
  } catch (error) {
    console.error('Error deleting bl header in api fe:', error);
    throw error;
  }
};

export const prosesBlFn = async (schedule_id: number) => {
  try {
    const response = await api2.get(`blheader/processbl/${schedule_id}`);

    return response.data;
  } catch (error) {
    console.error('Error fetching process bl data:', error);
    throw new Error('Failed to fetch process bl data');
  }
};

export const prosesBlRincianBiayaFn = async () => {
  try {
    const response = await api2.get(`blheader/processblrincianbiaya`);

    return response.data;
  } catch (error) {
    console.error('Error fetching process bl rincian biaya data:', error);
    throw new Error('Failed to fetch process bl rincian biaya data');
  }
};

export const checkValidationBlFn = async (fields: validationFields) => {
  const response = await api2.post(`/blheader/check-validation`, fields);

  return response;
};

export const exportBlHeaderFn = async (id: number): Promise<any> => {
  try {
    const response = await api2.get(`/blheader/export/${id}`, {
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data bl header:', error);
    throw new Error('Failed to export data bl header');
  }
};
