import { GetParams } from '../types/all.type';
import {
  IAllApprovalHeader,
  IApprovalDetail,
  IApprovalHeader
} from '../types/approvalheader.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';
import { ApprovalHeaderInput } from '../validations/approvalheader.validation';

interface UpdateParams {
  id: string;
  fields: ApprovalHeaderInput;
}
export const getApprovalHeaderFn = async (
  filters: GetParams = {}
): Promise<IAllApprovalHeader> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/approvalheader', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching ACOS data:', error);
    throw new Error('Failed to fetch ACOS data');
  }
};
export const storeApprovalHeaderFn = async (fields: ApprovalHeaderInput) => {
  const response = await api2.post(`/approvalheader`, fields);

  return response.data;
};
export const updateApprovalHeaderFn = async ({ id, fields }: UpdateParams) => {
  const response = await api2.put(`/approvalheader/${id}`, fields);
  return response.data;
};
export const deleteApprovalHeaderFn = async (id: number) => {
  try {
    const response = await api2.delete(`/approvalheader/${id}`);
    return response.data; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
export const exportApprovalHeaderFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/approvalheader/export', {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
export const exportApprovalHeaderBySelectFn = async (ids: { id: number }[]) => {
  try {
    const response = await api2.post('/approvalheader/export-byselect', ids, {
      responseType: 'blob'
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
export const getApprovalDetailFn = async (
  id: string
): Promise<IApprovalDetail[]> => {
  const response = await api2.get(`/approvaldetail/${id}`);

  return response.data;
};
export const updateApprovalDetailFn = async (fields: any) => {
  const response = await api2.put(
    `/approvaldetail/${fields[0].approval_id}`,
    fields
  );

  return response.data;
};
export const reportApprovalHeaderBySelectFn = async (ids: { id: number }[]) => {
  try {
    // Sending the data in the correct format to the NestJS API
    const response = await api2.post(`/approvalheader/report-byselect`, ids);

    return response.data; // Assuming the API returns the data properly
  } catch (error) {
    console.error('Error in sending data:', error);
    throw new Error('Failed to send data to the API');
  }
};
