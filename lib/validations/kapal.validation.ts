import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const kapalSchema = z.object({
  nama: z.string().nonempty({ message: dynamicRequiredMessage('NAMA') }),
  keterangan: z.string().optional(),
  statusaktif: z.number().min(1, `${REQUIRED_FIELD}`),
  pelayaran_id: z.number().min(1, `${REQUIRED_FIELD}`),
  pelayaran: z.string().optional().nullable(),
  text: z.string().optional().nullable(),
});
export type KapalInput = z.infer<typeof kapalSchema>;
