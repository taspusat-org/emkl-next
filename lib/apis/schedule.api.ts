import { GetParams } from '../types/all.type';
import {
  IAllScheduleDetail,
  IAllScheduleHeader
} from '../types/scheduleheader.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';
import { ScheduleHeaderInput } from '../validations/schedule.validation';

interface UpdateParams {
  id: string;
  fields: ScheduleHeaderInput;
}

interface validationFields {
  aksi: string;
  value: number | string;
}

export const getScheduleHeaderFn = async (
  filters: GetParams = {}
): Promise<IAllScheduleHeader> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/schedule-header', {
      params: queryParams
    });
    // console.log('response di api fe', response.data);

    return response.data;
  } catch (error) {
    console.error('Error to get data all schedule header in api:', error);
    throw new Error('Failed to get data all schedule header in api');
  }
};

export const getScheduleById = async (id: any) => {
  try {
    const response = await api2.get(`/schedule-header/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error to get data schedule by id in api fe', error);
    throw new Error('Error to get data schedule by id in api fe');
  }
};

export const getScheduleDetailFn = async (
  id: number,
  filters: GetParams = {}
): Promise<IAllScheduleDetail> => {
  const queryParams = buildQueryParams(filters);
  const response = await api2.get(`/schedule-detail/${id}`, {
    params: queryParams
  });

  return response.data;
};

export const storeScheduleFn = async (fields: ScheduleHeaderInput) => {
  const response = await api2.post(`/schedule-header`, fields);
  return response.data;
};

export const updateScheduleFn = async ({ id, fields }: UpdateParams) => {
  const response = await api2.put(`/schedule-header/${id}`, fields);
  return response.data;
};

export const deleteScheduleFn = async (id: string) => {
  try {
    const response = await api2.delete(`/schedule-header/${id}`);
    return response.data; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};

export const checkValidationScheduleFn = async (fields: validationFields) => {
  const response = await api2.post(`/schedule-header/check-validation`, fields);

  return response;
};

export const exportScheduleFn = async (
  id: string,
  filters: any
): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get(`/schedule-header/export/${id}`, {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data schedule:', error);
    throw new Error('Failed to export data schedule');
  }
};
