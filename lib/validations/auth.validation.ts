import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const loginValidation = z.object({
  username: z.string().nullable().optional(),
  password: z.string().nullable().optional()
});

export type LoginInput = z.infer<typeof loginValidation>;

export const otpValidation = z.object({
  otp: z.string().min(6, 'OTP must be 6 digits').max(6, 'OTP must be 6 digits')
});

export type OTPInput = z.infer<typeof otpValidation>;

export const emailValidation = z.object({
  username: z.string().min(1, `${REQUIRED_FIELD}`)
});

export type EmailInput = z.infer<typeof emailValidation>;

export const passwordValidation = z.object({
  newPassword: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('PASSWORD') }),
  token: z.string().min(1, `${REQUIRED_FIELD}`)
});

export type PasswordInput = z.infer<typeof passwordValidation>;

export const changePasswordValidation = z.object({
  newPassword: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('PASSWORD') }),
  id: z.number().optional() // Menjadikan id optional
});

export type ChangePasswordInput = z.infer<typeof changePasswordValidation>;
