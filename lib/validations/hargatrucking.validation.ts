import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const hargatruckingSchema = z.object({
  id: z.number().nullable().optional(),
  tujuankapal_id: z.number().min(1, { message: REQUIRED_FIELD }),
  tujuankapal_text: z.string().nullable().optional(),

  emkl_id: z.number().min(1, { message: REQUIRED_FIELD }),
  emkl_text: z.string().nullable().optional(),

  keterangan: z
    .string()
    .trim()
    .nonempty({ message: dynamicRequiredMessage('KETERANGAN') }),

  container_id: z.number().min(1, { message: REQUIRED_FIELD }),
  container_text: z.string().nullable().optional(),

  jenisorderan_id: z.number().min(1, { message: REQUIRED_FIELD }),
  jenisorderan_text: z.string().nullable().optional(),

  nominal: z.coerce
    .string({
      required_error: dynamicRequiredMessage('NOMINAL'),
      invalid_type_error: dynamicRequiredMessage('NOMINAL')
    })
    .refine((val) => val !== 'undefined' && val.trim() !== '', {
      message: dynamicRequiredMessage('NOMINAL')
    }),

  statusaktif: z.number().min(1, { message: REQUIRED_FIELD }),
  text: z.string().nullable().optional()
});

export type hargatruckingInput = z.infer<typeof hargatruckingSchema>;
