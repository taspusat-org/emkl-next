import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const JabatanSchema = z.object({
  nama: z.string().nonempty({ message: dynamicRequiredMessage('NAMA') }), // Email wajib diisi
  keterangan: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('KETERANGAN') }),
  statusaktif: z.number().min(1, `${REQUIRED_FIELD}`), // Email wajib diisi
  lookupNama: z.string().optional() // Ikon opsional
});
export type JabatanInput = z.infer<typeof JabatanSchema>;
