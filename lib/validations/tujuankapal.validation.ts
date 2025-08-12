import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const tujuankapalSchema = z.object({
  nama: z.string().nonempty({ message: dynamicRequiredMessage('NAMA') }), // Nama wajib diisi
  keterangan: z.string().nullable().optional(), // Keterangan opsional
  cabang_id: z.number().min(1, `${REQUIRED_FIELD}`), // Status aktif wajib diisi
  namacabang: z.string().nullable().optional(),
  statusaktif: z.number().min(1, `${REQUIRED_FIELD}`), // Status aktif wajib diisi
  statusaktif_nama: z.string().nullable().optional() // Status aktif wajib diisi
});

export type TujuankapalInput = z.infer<typeof tujuankapalSchema>;
