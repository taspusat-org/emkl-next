import { buildQueryParams } from '../utils';
import { GetParams } from '../types/all.type';
import { api2 } from '../utils/AxiosInstance';
import {
  IAllStatusJob,
  IAllStatusJobMasukGudang
} from '../types/statusJob.type';
import { statusJobHeaderInput } from '../validations/statusjob.validation';

interface UpdateStatusJobParams {
  id: string;
  fields: statusJobHeaderInput;
}

interface validationFields {
  aksi: string;
  value: number | string;
  jenisOrderan: number | null | string;
  jenisStatusJob: number | string | null;
}

export const getAllStatusJobFn = async (
  filters: GetParams = {},
  signal?: AbortSignal
): Promise<IAllStatusJob> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('statusjob', {
      params: queryParams,
      signal
    });

    return response.data;
  } catch (error) {
    // Jika error karena abort, jangan log sebagai error
    if (signal?.aborted) {
      throw new Error('Request was cancelled');
    }
    console.error('Error fetching Status Job data:', error);
    throw new Error('Failed to fetch Status Job data');
  }
};

export const getStatusJobMasukGudangByTglStatusFn = async (
  tglstatus: string,
  filters: GetParams = {},
  signal?: AbortSignal
): Promise<IAllStatusJobMasukGudang> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get(`/statusjob/detail/${tglstatus}`, {
      params: queryParams
    });

    return response.data;
  } catch (error) {
    // Jika error karena abort, jangan log sebagai error
    if (signal?.aborted) {
      throw new Error('Request was cancelled');
    }
    console.error('Error fetching Status Job data:', error);
    throw new Error('Failed to fetch Status Job data');
  }
};

export const storeStatusJobFn = async (fields: statusJobHeaderInput) => {
  const response = await api2.post(`/statusjob`, fields);

  return response.data;
};

export const updateStatusJobFn = async ({
  id,
  fields
}: UpdateStatusJobParams) => {
  const response = await api2.put(`/statusjob/${id}`, fields);

  return response.data;
};

export const deleteStatusJobFn = async ({
  tglstatus,
  jenisorder_id,
  text
}: {
  tglstatus: string;
  jenisorder_id: string;
  text: string;
}) => {
  try {
    const response = await api2.delete(`statusjob/${tglstatus}`, {
      data: {
        tglstatus,
        jenisorder_id,
        text
      }
    });

    return response;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

export const checkValidationStatusJobFn = async (fields: validationFields) => {
  const response = await api2.post(`/statusjob/check-validation`, fields);

  return response;
};

export const exportStatusJobMasukGudangFn = async (
  id: string,
  filters: any
): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get(`/statusjob/export/${id}`, {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data status job:', error);
    throw new Error('Failed to export data status job');
  }
};
