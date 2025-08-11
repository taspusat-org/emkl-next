import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const typeakuntansiSchema = z.object({
  nama: z.string().nonempty({ message: dynamicRequiredMessage('NAMA') }),
  order: z.number().min(1, { message: dynamicRequiredMessage('ORDER') }),
  // order: z.number().min(1, `${REQUIRED_FIELD}`),
  // order: z.coerce.number({
  //   required_error: dynamicRequiredMessage('ORDER'),
  //   invalid_type_error: dynamicRequiredMessage('ORDER'),
  // }).min(1, { message: dynamicRequiredMessage('ORDER') }),
  keterangan: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('KETERANGAN') }),
  akuntansi_id: z.number().nullable(),
  akuntansi_nama: z.string().nullable().optional(),
  statusaktif: z.number().nullable(),
  statusaktif_text: z.string().nullable().optional()
});

export type TypeakuntansiInput = z.infer<typeof typeakuntansiSchema>;
