import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';
import { REQUIRED_FIELD } from '@/constants/validation';

export const jenisbiayamarketingSchema = z.object({
  id: z.number().nullable().optional(),
  nama: z.string().nonempty({ message: dynamicRequiredMessage('NAMA') }),
  keterangan: z.string().optional(),
  statusaktif: z.number().min(1, `${REQUIRED_FIELD}`),
  statusaktif_text: z.string().optional()
});
export type JenisBiayaMarketingInput = z.infer<
  typeof jenisbiayamarketingSchema
>;
