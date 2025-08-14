import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const AkunpusatSchema = z.object({
  coa: z.number().min(1, { message: dynamicRequiredMessage('COA') }),

  keterangancoa: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('KETERANGANCOA') })
});

export type AkunpusatInput = z.infer<typeof AkunpusatSchema>;
