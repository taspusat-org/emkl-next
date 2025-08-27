import { api2 } from '../utils/AxiosInstance';

export const approvalFn = async (fields: any) => {
  const response = await api2.post(`/global/approval`, fields);

  return response.data;
};
export const nonApprovalFn = async (fields: any) => {
  const response = await api2.post(`/global/nonapproval`, fields);

  return response.data;
};
export const checkApproveFn = async (fields: any) => {
  const response = await api2.post(`/global/check-approval`, fields);

  return response.data;
};
