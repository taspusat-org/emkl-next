import { z } from 'zod';

export const karyawanMutasiSchema = z.object({
  karyawan_id: z.number().nullable().optional(), // Foreign key, bisa kosong
  tglmutasi: z.string().nullable().optional(),
  cabang_id: z.number().nullable().optional()
});
export type KaryawanMutasiInput = z.infer<typeof karyawanMutasiSchema>;
