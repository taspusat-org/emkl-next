import { z } from 'zod';
import { isValidAscii } from './keyboard.validation';
import { REQUIRED_FIELD } from '@/constants/validation';
import { dynamicRequiredMessage } from '../utils';

export const userSchema = z.object({
  username: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('USERNAME') })
    .refine(
      (value) => isValidAscii(value),
      'Username mengandung karakter tidak valid'
    ),

  name: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('NAMA') })
    .refine(
      (value) => isValidAscii(value),
      'Name mengandung karakter tidak valid'
    ),

  email: z.string().nullable().optional(),

  statusaktif: z.number().min(1, `${REQUIRED_FIELD}`),
  karyawan_id: z.number().nullable().optional(),
  namakaryawan: z.string().nullable().optional(),
  userId: z.string().nullable().optional(),
  statusaktif_text: z.string().nullable().optional()
});

export type UserInput = z.infer<typeof userSchema>;

export const userRoleSchema = z.object({
  userId: z.number().min(1, 'User ID must be a positive number'),
  roleIds: z.array(z.string()).optional(),

  username: z.string().nonempty('Username wajib diisi')
});
export type UserRoleInput = z.infer<typeof userRoleSchema>;

export const userAclSchema = z.object({
  userId: z.number().min(1, 'User ID must be a positive number'),
  data: z.array(z.number().nullable().optional())
});

export type UserAclInput = z.infer<typeof userAclSchema>;
