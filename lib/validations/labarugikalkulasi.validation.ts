import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const labaRugiKalkulasiSchema = z.object({
  id: z.number().nullable().optional(),
  periode: z.string().nonempty({ message: dynamicRequiredMessage('PERIODE') }),

  estkomisimarketing: z.string().nullable().optional(),
  komisimarketing: z.string().nullable().optional(),
  biayakantorpusat: z.string().nullable().optional(),
  biayatour: z.string().nullable().optional(),
  gajidireksi: z.string().nullable().optional(),
  estkomisikacab: z.string().nullable().optional(),
  biayabonustriwulan: z.string().nullable().optional(),
  estkomisimarketing2: z.string().nullable().optional(),
  estkomisikacabcabang1: z.string().nullable().optional(),
  estkomisikacabcabang2: z.string().nullable().optional(),

  statusfinalkomisimarketing: z
    .number()
    .int({ message: dynamicRequiredMessage('STATUS FINAL KOMISI MARKETING') })
    .min(1, {
      message: dynamicRequiredMessage('STATUS FINAL KOMISI MARKETING')
    }),
  statusfinalkomisi_nama: z.string().nullable().optional(),

  statusfinalbonustriwulan: z
    .number()
    .int({ message: dynamicRequiredMessage('STATUS FINAL KOMISI MARKETING') })
    .min(1, {
      message: dynamicRequiredMessage('STATUS FINAL KOMISI MARKETING')
    }),
  statusfinalbonus_nama: z.string().nullable().optional()
});

export type labaRugiKalkulasiInput = z.infer<typeof labaRugiKalkulasiSchema>;
