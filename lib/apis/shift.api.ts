import { GetParams } from '../types/all.type';
import { IAllShift, IAllShiftDetail } from '../types/shift.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';
import { ShiftInput } from '../validations/shift.validation';
interface updateShiftParams {
  id: number;
  fields: ShiftInput;
}

export const getAllShiftFn = async (
  filters: GetParams = {}
): Promise<IAllShift> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/shift', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching ACOS data:', error);
    throw new Error('Failed to fetch ACOS data');
  }
};
export const getShiftDetailFn = async (
  id: number
): Promise<IAllShiftDetail> => {
  const response = await api2.get(`/shift-detail/${id}`);

  return response.data;
};
export const updateShiftDetailFn = async (fields: any) => {
  const response = await api2.put(
    `/shift-detail/${fields[0].shift_id}`,
    fields
  );

  return response.data;
};
export const reportShiftBySelectFn = async (ids: { id: number }[]) => {
  try {
    // Sending the data in the correct format to the NestJS API
    const response = await api2.post(`/shift/report-byselect`, ids);

    return response.data; // Assuming the API returns the data properly
  } catch (error) {
    console.error('Error in sending data:', error);
    throw new Error('Failed to send data to the API');
  }
};

export const exportShiftFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/shift/export', {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
export const exportShiftBySelectFn = async (ids: { id: number }[]) => {
  try {
    const response = await api2.post('/shift/export-byselect', ids, {
      responseType: 'blob'
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
export const storeShiftFn = async (fields: ShiftInput) => {
  const response = await api2.post(`/shift`, fields);
  return response.data;
};
export const updateShiftFn = async ({ id, fields }: updateShiftParams) => {
  const response = await api2.put(`/shift/${id}`, fields);

  return response.data;
};
export const deleteShiftFn = async (id: string) => {
  try {
    const response = await api2.delete(`/shift/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};
