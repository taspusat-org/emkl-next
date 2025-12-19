import { buildQueryParams } from '../utils';
import { GetParams } from '../types/all.type';
import { api2 } from '../utils/AxiosInstance';
import {
  IAllEstimasiBiayaDetailBiaya,
  IAllEstimasiBiayaDetailInvoice,
  IAllEstimasiBiayaHeader
} from '../types/estimasibiayaheader.type';
import { estimasiBiayaHeaderInput } from '../validations/estimasibiayaheader.validation';

interface UpdateEstimasiBiayaHeaderParams {
  id: string;
  fields: estimasiBiayaHeaderInput;
}

interface validationFields {
  aksi: string;
  value: number | string;
}

export const getAllEstimasiBiayaHeaderFn = async (
  filters: GetParams = {},
  signal?: AbortSignal
): Promise<IAllEstimasiBiayaHeader> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('estimasibiayaheader', {
      params: queryParams,
      signal
    });

    return response.data;
  } catch (error) {
    // Jika error karena abort, jangan log sebagai error
    if (signal?.aborted) {
      throw new Error('Request was cancelled');
    }
    console.error('Error fetching Estimasi Biaya Header data:', error);
    throw new Error('Failed to fetch Estimasi Biaya Header data');
  }
};

export const getEstimasiBiayaHeaderByIdFn = async (id: any) => {
  try {
    const response = await api2.get(`/estimasibiayaheader/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      'Error to get data estimasi biaya header by id in api fe',
      error
    );
    throw new Error('Error to get data estimasi biaya header by id in api fe');
  }
};

export const getEstimasiBiayaDetailBiayaFn = async (
  id: number,
  filters: GetParams = {}
): Promise<IAllEstimasiBiayaDetailBiaya> => {
  const queryParams = buildQueryParams(filters);
  const response = await api2.get(`/estimasibiayadetailbiaya/${id}`, {
    params: queryParams
  });

  return response.data;
};

export const getEstimasiBiayaDetailBiayaByIdFn = async (id: any) => {
  try {
    const response = await api2.get(`/estimasibiayadetailbiaya/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      'Error to get data estimasi biaya detail biaya by id in api fe',
      error
    );
    throw new Error(
      'Error to get data estimasi biaya detail biaya by id in api fe'
    );
  }
};

export const getEstimasiBiayaDetailInvoiceFn = async (
  id: number,
  filters: GetParams = {}
): Promise<IAllEstimasiBiayaDetailInvoice> => {
  const queryParams = buildQueryParams(filters);
  const response = await api2.get(`/estimasibiayadetailinvoice/${id}`, {
    params: queryParams
  });

  return response.data;
};

export const storeEstimasiBiayaHeaderFn = async (
  fields: estimasiBiayaHeaderInput
) => {
  const response = await api2.post(`/estimasibiayaheader`, fields);
  return response.data;
};

export const updateEstimasiBiayaHeaderFn = async ({
  id,
  fields
}: UpdateEstimasiBiayaHeaderParams) => {
  const response = await api2.put(`/estimasibiayaheader/${id}`, fields);
  return response.data;
};

export const deleteEstimasiBiayaHeaderFn = async (id: string) => {
  try {
    const response = await api2.delete(`estimasibiayaheader/${id}`);

    return response;
  } catch (error) {
    console.error('Error deleting estimasi biaya header in api fe:', error);
    throw error;
  }
};

export const checkValidationEstimasiBiayaFn = async (
  fields: validationFields
) => {
  const response = await api2.post(
    `/estimasibiayaheader/check-validation`,
    fields
  );

  return response;
};

export const exportEstimasiBiayaHeaderFn = async (id: number): Promise<any> => {
  try {
    const response = await api2.get(`/estimasibiayaheader/export/${id}`, {
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data estimasi biaya header:', error);
    throw new Error('Failed to export data estimasi biaya header');
  }
};
