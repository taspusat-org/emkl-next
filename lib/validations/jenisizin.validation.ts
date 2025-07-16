import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const jenisizinSchema = z.object({
  nama: z.string().nonempty({ message: dynamicRequiredMessage('PASSWORD') }),
  keterangan: z.string().optional(),
  statusaktif: z.number().min(1, `${REQUIRED_FIELD}`),
  statusaktifnama: z.string().optional()
});
export type JenisIzinInput = z.infer<typeof jenisizinSchema>;
