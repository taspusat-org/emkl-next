import { z } from 'zod';
import { REQUIRED_FIELD } from '@/constants/validation';
import { dynamicRequiredMessage } from '../utils';

export const BankSchema = z.object({
  id: z.number().nullable().optional(),
  nama: z.string().nonempty({ message: dynamicRequiredMessage('NAMA') }),
  keterangan: z
    .string()
    .trim()
    .nonempty({ message: dynamicRequiredMessage('KETERANGAN') }),

  coa: z.string().nullable().optional(),
  keterangancoa: z.string().nullable().optional(),

  coagantung: z.string().nullable().optional(),
  keterangancoagantung: z.string().nullable().optional(),

  statusbank: z.number().min(1, { message: REQUIRED_FIELD }),
  textbank: z.string().nullable().optional(),

  statusaktif: z.number().min(1, { message: REQUIRED_FIELD }),
  text: z.string().nullable().optional(),

  statusdefault: z.number().min(1, { message: REQUIRED_FIELD }),
  textdefault: z.string().nullable().optional(),

  formatpenerimaan: z.number().min(1, { message: REQUIRED_FIELD }),
  formatpenerimaantext: z.string().nullable().optional(),

  formatpengeluaran: z.number().min(1, { message: REQUIRED_FIELD }),
  formatpengeluarantext: z.string().nullable().optional(),

  formatpenerimaangantung: z.number().min(1, { message: REQUIRED_FIELD }),
  formatpenerimaangantungtext: z.string().nullable().optional(),

  formatpengeluarangantung: z.number().min(1, { message: REQUIRED_FIELD }),
  formatpengeluarangantungtext: z.string().nullable().optional(),

  formatpencairan: z.number().min(1, { message: REQUIRED_FIELD }),
  formatpencairantext: z.string().nullable().optional(),

  formatrekappenerimaan: z.number().min(1, { message: REQUIRED_FIELD }),
  formatrekappenerimaantext: z.string().nullable().optional(),

  formatrekappengeluaran: z.number().min(1, { message: REQUIRED_FIELD }),
  formatrekappengeluarantext: z.string().nullable().optional()
});

export type BankInput = z.infer<typeof BankSchema>;
