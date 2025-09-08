import { z } from 'zod';
import { REQUIRED_FIELD } from '@/constants/validation';
import { dynamicRequiredMessage } from '../utils';

export const BiayaSchema = z.object({
  nama: z.string().nonempty({ message: dynamicRequiredMessage('NAMA') }),
  keterangan: z
    .string()
    .trim()
    .nonempty({ message: dynamicRequiredMessage('KETERANGAN') }),

  coa: z.string().nonempty({ message: dynamicRequiredMessage('COA') }),
  coa_text: z.string().nullable().optional(),

  coahut: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('COA HUTANG') }),
  coahut_text: z.string().nullable().optional(),

  jenisorderan_id: z.number().nullable().optional(),
  jenisorderan_text: z.string().nullable().optional(),

  statusaktif: z.number().min(1, { message: REQUIRED_FIELD }),
  text: z.string().nullable().optional()
});

export type BiayaInput = z.infer<typeof BiayaSchema>;
