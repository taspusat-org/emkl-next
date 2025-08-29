import { buildQueryParams } from '../utils';
import { GetParams } from '../types/all.type';
import { api2 } from '../utils/AxiosInstance';
import { IAllJenisProsesFee } from '../types/jenisprosesfee.type';
import { JenisProsesFeeInput } from '../validations/jenisprosesfee.validation';

interface UpdateJenisProsesFeeParams {
  id: string;
  fields: JenisProsesFeeInput;
}

interface validationFields {
  aksi: string;
  value: number | string;
}

export const getAllJenisProsesFeeFn = async (
  filters: GetParams = {}
): Promise<IAllJenisProsesFee> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('jenisprosesfee', { params: queryParams });

    return response.data;
  } catch (error) {
    console.error('Error fetching Jenis Proses Fee data:', error);
    throw new Error('Failed to fetch Jenis Proses Fee data');
  }
};

export const storeJenisProsesFeeFn = async (fields: JenisProsesFeeInput) => {
  const response = await api2.post(`/jenisprosesfee`, fields);

  return response.data;
};

export const updateJenisProsesFeeFn = async ({
  id,
  fields
}: UpdateJenisProsesFeeParams) => {
  const response = await api2.put(`/jenisprosesfee/${id}`, fields);

  return response.data;
};

export const deleteJenisProsesFeeFn = async (id: string) => {
  try {
    const response = await api2.delete(`jenisprosesfee/${id}`);

    return response;
  } catch (error) {
    console.error('Error deleting jenis proses fee:', error);
    throw error;
  }
};

export const checkValidationJenisProsesFeeFn = async (
  fields: validationFields
) => {
  const response = await api2.post(`/jenisprosesfee/check-validation`, fields);

  return response;
};

export const exportJenisProsesFeeFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/jenisprosesfee/export', {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data jenis proses fee:', error);
    throw new Error('Failed to export data jenis proses fee');
  }
};
