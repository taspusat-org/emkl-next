import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const asalkapalSchema = z.object({
  nominal: z.string().nonempty({ message: dynamicRequiredMessage('NOMINAL') }),

  keterangan: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('KETERANGAN') }),

  statusaktif: z
    .number()
    .min(1, { message: dynamicRequiredMessage('STATUSAKTIF') }),

  statusaktif_nama: z
    .string()
    .nullable()
    .optional(),

  cabang_id: z
    .number()
    .min(1, { message: dynamicRequiredMessage('CABANG') }),

  cabang: z
    .string()
    .nullable()
    .optional(),

  container_id: z
    .number()
    .min(1, { message: dynamicRequiredMessage('CONTAINER') }),

  container: z
    .string()
    .nullable()
    .optional()
});

export type AsalKapalInput = z.infer<typeof asalkapalSchema>;
