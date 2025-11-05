import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const ComoditySchema = z.object({
  keterangan: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('KETERANGAN') }),
  rate: z.coerce
    .string({
      required_error: dynamicRequiredMessage('RATE'),
      invalid_type_error: dynamicRequiredMessage('RATE')
    })
    .refine((val) => val !== 'undefined' && val.trim() !== '', {
      message: dynamicRequiredMessage('RATE')
    }),
  statusaktif: z
    .number()
    .min(1, { message: dynamicRequiredMessage('STATUSAKTIF') }),

  text: z.string().nullable().optional()
});

export type ComodityInput = z.infer<typeof ComoditySchema>;
