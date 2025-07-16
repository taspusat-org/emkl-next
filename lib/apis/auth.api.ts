import { api, api2 } from '../utils/AxiosInstance';
import {
  ChangePasswordInput,
  EmailInput,
  PasswordInput
} from '../validations/auth.validation';
export const storeEmailVerificationFn = async (fields: EmailInput) => {
  const response = await api2.post(`/auth/send-reset-password`, fields);

  return response;
};
export const newPasswordFn = async (fields: PasswordInput) => {
  const response = await api2.post(`/auth/reset-password`, fields);

  return response;
};
export const checkTokenFn = async (token: string) => {
  const response = await api2.post(`/auth/check-token`, token);

  return response;
};
export const changePasswordFn = async (fields: ChangePasswordInput) => {
  const response = await api2.put(`/auth/change-password`, fields);

  return response;
};
