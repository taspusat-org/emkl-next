import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const GroupbiayaextraSchema = z.object({
  id: z.number().nullable().optional(),
  keterangan: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('KETERANGAN') }),
  statusaktif: z
    .number()
    .min(1, { message: dynamicRequiredMessage('STATUSAKTIF') }),

  text: z.string().nullable().optional()
});

export type GroupbiayaextraInput = z.infer<typeof GroupbiayaextraSchema>;
