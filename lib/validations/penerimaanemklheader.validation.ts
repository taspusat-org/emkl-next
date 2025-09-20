import { z } from 'zod';

export const penerimaanemklheaderDetailSchema = z.object({
  id: z.number().optional(),
  nobukti: z.string().nullable(),
  keterangan: z.string().nullable(),
  nominal: z.string().nullable()
});
export type PenerimaanemklheaderDetailInput = z.infer<
  typeof penerimaanemklheaderDetailSchema
>;

export const penerimaanemklheaderHeaderSchema = z.object({
  nobukti: z.string().nullable(),
  tglbukti: z.string().nullable(),
  tgljatuhtempo: z.string().nullable(),
  keterangan: z.string().nullable(),
  karyawan_id: z.number().nullable(),
  karyawan_nama: z.string().nullable().optional(),
  jenisposting: z.number().nullable(),
  jenisposting_nama: z.string().nullable().optional(),
  penerimaan_nobukti: z.string().nullable().optional(),
  hutang_nobukti: z.string().nullable().optional(),
  bank_id: z.number().nullable(),
  bank_nama: z.string().nullable().optional(),
  statusformat_nama: z.string().nullable().optional(),
  nowarkat: z.string().nullable(),
  format: z.number().nullable().optional(),
  coakredit: z.string().nullable().optional(),
  details: z.array(penerimaanemklheaderDetailSchema).min(1)
});
export type PenerimaanemklheaderHeaderInput = z.infer<
  typeof penerimaanemklheaderHeaderSchema
>;
