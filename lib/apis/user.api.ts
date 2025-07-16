import { GetParams } from '../types/all.type';
import { IAllUser, IUserAcl, IUserRole } from '../types/user.type';
import { buildQueryParams } from '../utils';
import { api, api2 } from '../utils/AxiosInstance';
import {
  UserAclInput,
  UserInput,
  UserRoleInput
} from '../validations/user.validation';

interface updateUserParams {
  id: number;
  fields: UserInput;
}

export const getAllUserFn = async (
  filters: GetParams = {}
): Promise<IAllUser> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/user', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching ACOS data:', error);
    throw new Error('Failed to fetch ACOS data');
  }
};

export const reportUserBySelectFn = async (ids: { id: number }[]) => {
  try {
    // Sending the data in the correct format to the NestJS API
    const response = await api2.post(`/user/report-byselect`, ids);

    return response.data; // Assuming the API returns the data properly
  } catch (error) {
    console.error('Error in sending data:', error);
    throw new Error('Failed to send data to the API');
  }
};

export const exportUserFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/user/export', {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
export const exportUserBySelectFn = async (ids: { id: number }[]) => {
  try {
    const response = await api2.post('/user/export-byselect', ids, {
      responseType: 'blob'
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
export const storeUserFn = async (fields: UserInput) => {
  const response = await api2.post(`/user`, fields);
  return response.data;
};
export const updateUserFn = async ({ id, fields }: updateUserParams) => {
  const response = await api2.put(`/user/${id}`, fields);

  return response.data;
};
export const getUserRoleFn = async (id: number): Promise<IUserRole> => {
  const response = await api2.get(`/userrole/${id}`);
  return response.data;
};
export const getUserAclFn = async (id: number): Promise<IUserAcl> => {
  const response = await api2.get(`/useracl?id=${id}`);

  return response.data;
};
export const deleteUserFn = async (id: string) => {
  try {
    const response = await api2.delete(`/user/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};
export const updateUserRoleFn = async (fields: UserRoleInput) => {
  const response = await api2.put(`/userrole/${fields.userId}`, fields);

  return response.data;
};
export const updateUserAclFn = async (fields: UserAclInput) => {
  const response = await api2.put(`/useracl/${fields.userId}`, fields);

  return response.data;
};
