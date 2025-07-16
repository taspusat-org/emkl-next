import { z } from 'zod';

export const karyawanResignSchema = z.object({
  karyawan_id: z.number().nullable().optional(), // Foreign key, bisa kosong
  tglresign: z.string().nullable().optional(),
  alasanberhenti: z.string().nullable().optional() // Email wajib diisi
});
export type KaryawanResignInput = z.infer<typeof karyawanResignSchema>;
