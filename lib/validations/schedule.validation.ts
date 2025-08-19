import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const scheduleDetailSchema = z.object({
  id: z.number().optional(),
  nobukti: z.string().nullable().optional(),
  pelayaran_id: z.number().nullable(),
  pelayaran_nama: z.string().nullable().optional(),
  kapal_id: z.number().nullable(),
  kapal_nama: z.string().nullable().optional(),
  tujuankapal_id: z.number().nullable(),
  tujuankapal_nama: z.string().nullable().optional(),
  tglberangkat: z.string().nullable(),
  tgltiba: z.string().nullable(),
  etb: z.string().nullable(),
  eta: z.string().nullable(),
  etd: z.string().nullable(),
  voyberangkat: z.string().nullable(),
  voytiba: z.string().nullable(),
  closing: z.string().nullable(),
  etatujuan: z.string().nullable(),
  etdtujuan: z.string().nullable(),
  // keterangan: z.string().nullable(),
  keterangan: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('KETERANGAN') })
});
export type ScheduleDetailInput = z.infer<typeof scheduleDetailSchema>;

export const scheduleHeaderSchema = z.object({
  nobukti: z.string().nullable(),
  tglbukti: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('TGL BUKTI') }),
  // keterangan: z.string().min(1,)
  keterangan: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('KETERANGAN') }),
  details: z.array(scheduleDetailSchema).min(1)
});
export type ScheduleHeaderInput = z.infer<typeof scheduleHeaderSchema>;
