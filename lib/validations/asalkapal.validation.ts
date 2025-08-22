import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const asalkapalSchema = z.object({
  nominal: z.string().nonempty({ message: dynamicRequiredMessage('Nomnial') }),

  keterangan: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('KETERANGAN') }),
  cabang_id: z.number().min(1, `${REQUIRED_FIELD}`),
  cabang: z.string().nullable().optional(),
  container_id: z.number().min(1, `${REQUIRED_FIELD}`),
  container: z.string().nullable().optional(),
  statusaktif: z.number().nullable().optional(),
  statusaktif_text: z.string().nullable().optional(),
});

export type AsalKapalInput = z.infer<typeof asalkapalSchema>;