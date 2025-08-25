import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const sandarkapalSchema = z.object({
  nama: z.string().nonempty({ message: dynamicRequiredMessage('Nama') }),

  keterangan: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('KETERANGAN') }),
  statusaktif: z.number().nullable().optional(),
  statusaktif_text: z.string().nullable().optional(),
});

export type SandarKapalInput = z.infer<typeof sandarkapalSchema>;