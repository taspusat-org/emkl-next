import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const daftarbankSchema = z.object({
  nama: z.string().nonempty({ message: dynamicRequiredMessage('NAMA') }), // Nama wajib diisi
  keterangan: z
    .string()
    .trim()
    .nonempty({ message: dynamicRequiredMessage('KETERANGAN') }),
  statusaktif: z.number().min(1, `${REQUIRED_FIELD}`), // Status aktif wajib diisi
  statusaktif_text: z.string().nullable().optional() // Email wajib diisi
});
export type DaftarBankInput = z.infer<typeof daftarbankSchema>;
