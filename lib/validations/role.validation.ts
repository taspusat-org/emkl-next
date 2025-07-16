import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const roleSchema = z.object({
  rolename: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('NAMA ROLE') }),
  statusaktif: z.number().min(1, `${REQUIRED_FIELD}`), // Email wajib diisi
  statusaktif_text: z.string().nullable().optional()
});
export type RoleInput = z.infer<typeof roleSchema>;

export const roleAclSchema = z.object({
  roleId: z.number().min(1, 'Role ID must be a positive number'), // roleId is a number  should be positive
  data: z
    .array(z.number().min(1, 'ACO ID must be a positive number')) // acoIds must be an array of positive numbers
    .nonempty('ACO IDs must not be empty')
});

// Type derived from the schema for type-checking
export type RoleAclInput = z.infer<typeof roleAclSchema>;
