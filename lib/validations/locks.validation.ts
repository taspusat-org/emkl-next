import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const locksSchema = z.object({
  editing_by: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('editing_by') }), // Judul wajib diisi
  table: z.string().nullable().optional(), // Status aktif
  tableid: z.number().nullable().optional() // Parent ID opsional, bisa null
});
export type LocksInput = z.infer<typeof locksSchema>;
