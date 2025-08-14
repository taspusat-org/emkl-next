import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const tujuankapalSchema = z.object({
  nama: z.string().nonempty({ message: dynamicRequiredMessage('NAMA') }), // Nama wajib diisi
  keterangan: z
    .string()
    .trim()
    .nonempty({ message: dynamicRequiredMessage('KETERANGAN') }), // Keterangan wajib diisi
  cabang_id: z.number().nullable().optional(),
  namacabang: z.string().nullable().optional(),
  statusaktif: z.number().min(1, `${REQUIRED_FIELD}`),
  statusaktif_nama: z.string().nullable().optional()
});

export type TujuankapalInput = z.infer<typeof tujuankapalSchema>;
