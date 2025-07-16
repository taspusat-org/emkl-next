import { GetParams } from '../types/all.type';
import { IAllRoleAcl, IAllRoles } from '../types/role.type';
import { buildQueryParams } from '../utils';
import { api, api2 } from '../utils/AxiosInstance';
import { RoleAclInput, RoleInput } from '../validations/role.validation';
interface UpdateRoleParams {
  id: string;
  fields: RoleInput;
}

export const getRoleFn = async (
  filters: GetParams = {}
): Promise<IAllRoles> => {
  const queryParams = buildQueryParams(filters);
  const response = await api2.get('/role', { params: queryParams });

  return response.data;
};
export const getRoleAclFn = async (id: number): Promise<IAllRoleAcl> => {
  const response = await api2.get(`/roleacl?id=${id}`);

  return response.data;
};
export const reportRoleBySelectFn = async (ids: { id: number }[]) => {
  try {
    // Sending the data in the correct format to the NestJS API
    const response = await api2.post(`/role/report-byselect`, ids);

    return response.data; // Assuming the API returns the data properly
  } catch (error) {
    console.error('Error in sending data:', error);
    throw new Error('Failed to send data to the API');
  }
};

export const exportRoleBySelectFn = async (ids: { id: number }[]) => {
  try {
    const response = await api2.post('/role/export-byselect', ids, {
      responseType: 'blob'
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};

export const storeRoleFn = async (fields: RoleInput) => {
  const response = await api2.post(`/role`, fields);

  return response.data;
};
export const updateRoleAclFn = async (fields: RoleAclInput) => {
  // Send the POST request to the API endpoint
  const response = await api2.put(`/roleacl/${fields.roleId}`, fields);

  return response.data;
};

export const updateRoleFn = async ({ id, fields }: UpdateRoleParams) => {
  const response = await api2.put(`/role/${id}`, fields);
  return response.data;
};

export const checkRoleFn = async (id: number) => {
  const response = await api2.get(`/role/check/${id}`);
  return response.data;
};

export const deleteRoleFn = async (id: string) => {
  try {
    const response = await api2.delete(`/role/${id}`);
    return response.data; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
export const exportRoleFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/role/export', {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
