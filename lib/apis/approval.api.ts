import { api2 } from '../utils/AxiosInstance';

export const approvalFn = async (fields: any, url: any = '') => {
  const finalUrl = url ? `/${url}` : `/global/approval`;

  const response = await api2.post(finalUrl, fields);

  return response.data;
};
export const nonApprovalFn = async (fields: any, url: any = '') => {
  const finalUrl = url ? `/${url}` : `/global/nonapproval`;

  const response = await api2.post(finalUrl, fields);

  return response.data;
};
export const checkApproveFn = async (fields: any) => {
  const response = await api2.post(`/global/check-approval`, fields);

  return response.data;
};
