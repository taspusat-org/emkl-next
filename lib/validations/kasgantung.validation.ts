import { z } from 'zod';

export const kasgantungDetailSchema = z.object({
  id: z.number().optional(),
  nobukti: z.string().nullable(),
  keterangan: z.string().nullable(),
  nominal: z.string().nullable(),
  pengeluarandetail_id: z.number().nullable().optional()
});
export type KasGantungDetailInput = z.infer<typeof kasgantungDetailSchema>;

export const kasgantungHeaderSchema = z.object({
  nobukti: z.string().nullable(),
  tglbukti: z.string().nullable(),
  keterangan: z.string().nullable(),
  bank_id: z.number().nullable(),
  bank_nama: z.string().nullable().optional(),
  pengeluaran_nobukti: z.string().nullable(),
  coakaskeluar: z.string().nullable(),
  relasi_id: z.number().nullable(),
  alatbayar_id: z.number().nullable(),
  relasi_nama: z.string().nullable().optional(),
  alatbayar_nama: z.string().nullable().optional(),
  details: z.array(kasgantungDetailSchema).min(1)
});
export type KasGantungHeaderInput = z.infer<typeof kasgantungHeaderSchema>;
