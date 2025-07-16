import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const daftarEmailSchema = z.object({
  nama: z.string().nonempty({ message: dynamicRequiredMessage('NAMA') }), // Foreign key, bisa kosong
  keterangan: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('KETERANGAN') }), // Ikon opsional
  text: z.string().optional(), // Ikon opsional
  statusaktif: z.number().min(1, `${REQUIRED_FIELD}`) // Email wajib diisi
});
export type DaftarEmailInput = z.infer<typeof daftarEmailSchema>;
