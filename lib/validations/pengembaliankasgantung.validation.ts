import { z } from 'zod';

export const pengembalianKasGantungDetailSchema = z.object({
  id: z.number().optional(),
  nobukti: z.string().nullable(),
  kasgantung_nobukti: z.string().nullable().optional(),
  keterangan: z.string().nullable(),
  nominal: z.string().nullable()
});
export type PengembalianKasGantungDetailInput = z.infer<
  typeof pengembalianKasGantungDetailSchema
>;

export const pengembalianKasGantungHeaderSchema = z.object({
  nobukti: z.string().nullable(),
  tglbukti: z.string().nullable(),
  keterangan: z.string().nullable(),
  bank_id: z.number().nullable(),
  bank_nama: z.string().nullable(),
  penerimaan_nobukti: z.string().nullable(),
  coakasmasuk: z.string().nullable(),
  relasi_id: z.number().nullable(),
  relasi_nama: z.string().nullable(),
  details: z.array(pengembalianKasGantungDetailSchema).min(1)
});
export type PengembalianKasGantungHeaderInput = z.infer<
  typeof pengembalianKasGantungHeaderSchema
>;
