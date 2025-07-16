import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const ccemailSchema = z.object({
  nama: z.string().nonempty({ message: dynamicRequiredMessage('NAMA') }),
  email: z
    .string()
    .max(255)
    .email({ message: 'Invalid email format' })
    .nonempty({ message: dynamicRequiredMessage('EMAIL') }),
  statusaktif: z.number().min(1, 'Harap Pilih Status Aktif'),
  statusaktif_text: z.string().nullable().optional()
});
export type CcEmailInput = z.infer<typeof ccemailSchema>;
