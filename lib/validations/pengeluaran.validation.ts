import { z } from 'zod';

export const pengeluaranDetailSchema = z.object({
  id: z.coerce.number().optional(),
  coadebet: z.string().nullable(),
  coadebet_text: z.string().nullable(),
  keterangan: z.string().nullable(),
  nominal: z.string().nullable(),
  dpp: z.string().nullable(),

  transaksibiaya_nobukti: z.string().nullable(),
  transaksilain_nobukti: z.string().nullable(),
  noinvoiceemkl: z.string().nullable(),
  tglinvoiceemkl: z.string().nullable(),
  nofakturpajakemkl: z.string().nullable(),
  perioderefund: z.string().nullable()
});
export type PengeluaranDetailInput = z.infer<typeof pengeluaranDetailSchema>;

export const pengeluaranHeaderSchema = z.object({
  nobukti: z.string().nullable(),
  tglbukti: z.string().nullable(),
  relasi_id: z.coerce.number().nullable(),
  relasi_text: z.string().nullable().optional(),
  keterangan: z.string().nullable(),
  bank_id: z.coerce.number().nullable(),
  bank_text: z.string().nullable().optional(),
  postingdari: z.string().nullable().optional(),
  coakredit: z.string().nullable(),
  coakredit_text: z.string().nullable().optional(),
  dibayarke: z.string().nullable(),
  alatbayar_id: z.coerce.number().nullable(),
  alatbayar_text: z.string().nullable().optional(),
  nowarkat: z.string().nullable(),
  tgljatuhtempo: z.string().nullable(),
  daftarbank_id: z.coerce.number().nullable(),
  daftarbank_text: z.string().nullable().optional(),
  statusformat: z.string().nullable(),
  details: z.array(pengeluaranDetailSchema).min(1)
});
export type PengeluaranHeaderInput = z.infer<typeof pengeluaranHeaderSchema>;
