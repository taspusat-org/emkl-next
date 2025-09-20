import { z } from 'zod';

export const pengeluaranemklheaderDetailSchema = z.object({
  id: z.number().optional(),
  noseal: z.string().optional(),
  keterangan: z.string().nullable(),
  nominal: z.string().nullable()
});
export type PengeluaranemklheaderDetailInput = z.infer<
  typeof pengeluaranemklheaderDetailSchema
>;

export const pengeluaranemklheaderHeaderSchema = z.object({
  nobukti: z.string().nullable(),
  tglbukti: z.string().nullable(),
  tgljatuhtempo: z.string().nullable(),
  keterangan: z.string().nullable(),
  karyawan_id: z.number().nullable(),
  karyawan_nama: z.string().nullable().optional(),
  jenisposting: z.number().nullable(),
  jenisposting_nama: z.string().nullable().optional(),
  jenisseal_id: z.number().nullable().optional(),
  jenisseal_nama: z.string().nullable().optional(),
  pengeluaran_nobukti: z.string().nullable().optional(),
  hutang_nobukti: z.string().nullable().optional(),
  bank_id: z.number().nullable(),
  bank_nama: z.string().nullable().optional(),
  statusformat_nama: z.string().nullable().optional(),
  nowarkat: z.string().nullable(),
  format: z.number().nullable().optional(),
  coadebet: z.string().nullable().optional(),
  details: z.array(pengeluaranemklheaderDetailSchema).min(1)
});
export type PengeluaranemklheaderHeaderInput = z.infer<
  typeof pengeluaranemklheaderHeaderSchema
>;
