import { z } from 'zod';
import { REQUIRED_FIELD } from '@/constants/validation';
import { dynamicRequiredMessage } from '../utils';

export const AlatbayarSchema = z.object({
  nama: z.string().nonempty({ message: dynamicRequiredMessage('NAMA') }),
  keterangan: z
    .string()
    .trim()
    .nonempty({ message: dynamicRequiredMessage('KETERANGAN') }),

  statuslangsungcair: z.number().min(1, { message: REQUIRED_FIELD }),
  statuslangsungcair_text: z.string().nullable().optional(),

  statusdefault: z.number().min(1, { message: REQUIRED_FIELD }),
  statusdefault_text: z.string().nullable().optional(),

  statusbank: z.number().min(1, { message: REQUIRED_FIELD }),
  statusbank_text: z.string().nullable().optional(),

  statusaktif: z.number().min(1, { message: REQUIRED_FIELD }),
  text: z.string().nullable().optional()
});

export type AlatbayarInput = z.infer<typeof AlatbayarSchema>;
