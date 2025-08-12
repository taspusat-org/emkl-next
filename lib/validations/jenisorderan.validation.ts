import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const jenisorderanSchema = z.object({
  nama: z.string().nonempty({ message: dynamicRequiredMessage('NAMA') }), // Nama wajib diisi
  keterangan: z.string().nullable().optional(), // Keterangan opsional
  statusaktif: z.number().min(1, `${REQUIRED_FIELD}`), // Status aktif wajib diisi
  statusaktif_nama: z.string().nullable().optional() // Email wajib diisi
});
export type JenisOrderanInput = z.infer<typeof jenisorderanSchema>;
