import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';
import { REQUIRED_FIELD } from '@/constants/validation';

export const marketinggroupSchema = z.object({
  marketing_id: z.coerce
    .number({
      required_error: dynamicRequiredMessage('MARKETING'),
      invalid_type_error: dynamicRequiredMessage('MARKETING')
    })
    .min(1, { message: dynamicRequiredMessage('MARKETING') }),
  marketing_nama: z.string().optional(),
  statusaktif: z.coerce
    .number({
      required_error: dynamicRequiredMessage('STATUS AKTIF'),
      invalid_type_error: dynamicRequiredMessage('STATUS AKTIF')
    })
    .min(1, { message: dynamicRequiredMessage('STATUS AKTIF') }),
  statusaktif_text: z.string().optional()
});
export type MarketingGroupInput = z.infer<typeof marketinggroupSchema>;
