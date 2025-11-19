import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const kapalSchema = z.object({
  id: z.number().nullable().optional(),
  nama: z.string().nonempty({ message: dynamicRequiredMessage('NAMA') }),

  keterangan: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('KETERANGAN') }),

  statusaktif: z
    .number()
    .min(1, { message: dynamicRequiredMessage('STATUSAKTIF') }),

  statusaktif_nama: z.string().nullable().optional(),

  pelayaran_id: z
    .number()
    .min(1, { message: dynamicRequiredMessage('PELAYARAN') }),

  pelayaran: z.string().nullable().optional()
});

export type KapalInput = z.infer<typeof kapalSchema>;
