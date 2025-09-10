import { z } from 'zod';
import { REQUIRED_FIELD } from '@/constants/validation';
import { dynamicRequiredMessage } from '../utils';
export const hutangDetailSchema = z.object({
  id: z.coerce.number().optional(),
  coa: z.string().nullable(),
  coa_text: z.string().nullable(),
  keterangan: z
    .string()
    .trim()
    .nonempty({ message: dynamicRequiredMessage('KETERANGAN') }),
  nominal: z
    .string()
    .trim()
    .nonempty({ message: dynamicRequiredMessage('NOMINAL') }),
  dpp: z.string().nullable(),
  noinvoiceemkl: z.string().nullable(),
  tglinvoiceemkl: z.string().nullable(),
  nofakturpajakemkl: z.string().nullable()
});
export type HutangDetailInput = z.infer<typeof hutangDetailSchema>;

export const hutangHeaderSchema = z.object({
  nobukti: z.string().nullable(),
  tglbukti: z
    .string()
    .trim()
    .nonempty({ message: dynamicRequiredMessage('TANGGAL BUKTI') }),
  tgljatuhtempo: z
    .string()
    .trim()
    .nonempty({ message: dynamicRequiredMessage('TANGGAL JATUH TEMPO') }),
  keterangan: z.string().nullable(),
  relasi_id: z.coerce.number().min(1, { message: REQUIRED_FIELD }),
  relasi_text: z.string().nullable().optional(),
  coa: z.string().nullable().optional(),
  coa_text: z.string().nullable().optional(),
  details: z.array(hutangDetailSchema).min(1)
});
export type HutangHeaderInput = z.infer<typeof hutangHeaderSchema>;
