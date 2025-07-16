import { z } from 'zod';

export const mutasiSchema = z.object({
  tglmutasi: z.string().optional(),
  karyawan_id: z.number().optional().nullable(),
  cabanglama_id: z.number().optional().nullable(),
  cabangbaru_id: z.number().optional().nullable(),
  jabatanlama_id: z.number().optional().nullable(),
  jabatanbaru_id: z.number().optional().nullable(),
  keterangan: z.string().optional().nullable(),
  karyawan_nama: z.string().optional().nullable(),
  namacabang_lama: z.string().optional().nullable(),
  namacabang_baru: z.string().optional().nullable(),
  namajabatan_baru: z.string().optional().nullable(),
  namajabatan_lama: z.string().optional().nullable(),
  text: z.string().optional().nullable(),
  statusaktif: z.number().optional().nullable()
});

export type MutasiInput = z.infer<typeof mutasiSchema>;
