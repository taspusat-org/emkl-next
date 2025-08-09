import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const akuntansiSchema = z.object({
  nama: z.string().nonempty({ message: dynamicRequiredMessage('NAMA') }),
  keterangan: z.string().optional(),
  statusaktif: z.number().min(1, `${REQUIRED_FIELD}`),
});
export type AkuntansiInput = z.infer<typeof akuntansiSchema>;
