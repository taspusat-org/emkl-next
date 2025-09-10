import { GetParams } from '../types/all.type';
import { IAllSupplier } from '../types/supplier.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';
import { supplierInput } from '../validations/supplier.validation';

interface UpdateSupplierParams {
  id: string;
  fields: supplierInput;
}

interface validationFields {
  aksi: string;
  value: number | string;
}

export const getAllSupplierFn = async (
  filters: GetParams = {},
  signal?: AbortSignal
): Promise<IAllSupplier> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('supplier', {
      params: queryParams,
      signal
    });

    return response.data;
  } catch (error) {
    // Jika error karena abort, jangan log sebagai error
    if (signal?.aborted) {
      throw new Error('Request was cancelled');
    }
    console.error('Error fetching Supplier data:', error);
    throw new Error('Failed to fetch Supplier data');
  }
};

export const storeSupplierFn = async (fields: supplierInput) => {
  const response = await api2.post(`/supplier`, fields);

  return response.data;
};

export const updateSupplierFn = async ({
  id,
  fields
}: UpdateSupplierParams) => {
  const response = await api2.put(`/supplier/${id}`, fields);

  return response.data;
};

export const deleteSupplierFn = async (id: string) => {
  try {
    const response = await api2.delete(`supplier/${id}`);

    return response;
  } catch (error) {
    console.error('Error deleting supplier:', error);
    throw error;
  }
};

export const checkValidationSupplierFn = async (fields: validationFields) => {
  const response = await api2.post(`/supplier/check-validation`, fields);
  return response;
};

export const exportSupplierFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/supplier/export', {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data supplier:', error);
    throw new Error('Failed to export data supplier');
  }
};
