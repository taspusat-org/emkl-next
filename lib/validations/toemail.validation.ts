import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const toemailSchema = z.object({
  nama: z.string().nonempty({ message: dynamicRequiredMessage('NAMA') }), // Email wajib diisi
  email: z
    .string()
    .email({ message: 'Invalid email format' })
    .nonempty({ message: dynamicRequiredMessage('EMAIL') }), // Email wajib diisi
  statusaktif: z.number().min(1, `${REQUIRED_FIELD}`), // Email wajib diisi
  lookupNama: z.string().optional() // Ikon opsional
});
export type ToemailInput = z.infer<typeof toemailSchema>;
