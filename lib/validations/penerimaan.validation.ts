import { z } from 'zod';

export const penerimaanDetailSchema = z.object({
  id: z.string().optional(),
  coa: z.string().nullable(),
  keterangan: z.string().nullable(),
  nominal: z.string().nullable()
});
export type PenerimaanDetailInput = z.infer<typeof penerimaanDetailSchema>;

export const penerimaanHeaderSchema = z.object({
  nobukti: z.string().nullable(),
  tglbukti: z.string().nullable(),
  keterangan: z.string().nullable(),
  nowarkat: z.string().nullable(),
  noresi: z.string().nullable(),
  tgllunas: z.string().nullable(),
  bank_id: z.number().nullable(),
  bank_nama: z.string().nullable().optional(),
  postingdari: z.string().nullable(),
  diterimadari: z.string().nullable(),
  coakasmasuk: z.string().nullable(),
  coakasmasuk_nama: z.string().nullable().optional(),
  relasi_id: z.number().nullable(),
  alatbayar_id: z.number().nullable(),
  relasi_nama: z.string().nullable().optional(),
  alatbayar_nama: z.string().nullable().optional(),
  details: z.array(penerimaanDetailSchema).min(1)
});
export type PenerimaanHeaderInput = z.infer<typeof penerimaanHeaderSchema>;
