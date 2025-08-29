import { REQUIRED_FIELD } from '@/constants/validation';
import z from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const pelayaranSchema = z.object({
  id: z.number().nullable().optional(),
  nama: z.string().nonempty({ message: dynamicRequiredMessage('NAMA') }),
  keterangan: z.string().optional(),
  statusaktif: z.number().min(1, `${REQUIRED_FIELD}`),
  statusaktif_text: z.string().optional()
});
export type PelayaranInput = z.infer<typeof pelayaranSchema>;
