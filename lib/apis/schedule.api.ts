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

export const getScheduleDetailFn = async (
  id: number
): Promise<IAllScheduleDetail> => {
  const response = await api2.get(`/schedule-detail/${id}`);

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
