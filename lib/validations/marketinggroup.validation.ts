import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';
import { REQUIRED_FIELD } from '@/constants/validation';

export const marketinggroupSchema = z.object({
  marketing_id: z.number().min(1, `${REQUIRED_FIELD}`),
  marketing_nama: z.string().optional(),
  statusaktif: z.number().min(1, `${REQUIRED_FIELD}`),
  statusaktif_text: z.string().optional()
});
export type MarketingGroupInput = z.infer<typeof marketinggroupSchema>;
