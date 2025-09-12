import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const penerimaanEmklSchema = z.object({
  id: z.number().nullable().optional(),
  nama: z.string().min(1, { message: dynamicRequiredMessage('NAMA') }),
  keterangan: z
    .string({ message: dynamicRequiredMessage('KETERANGAN') })
    .nonempty({ message: dynamicRequiredMessage('KETERANGAN') }),

  coadebet: z.string().nullable().optional(),
  coadebet_nama: z.string().nullable().optional(),

  coakredit: z.string().nullable().optional(),
  coakredit_nama: z.string().nullable().optional(),

  coapostingkasbankdebet: z.string().nullable().optional(),
  coabankdebet_nama: z.string().nullable().optional(),

  coapostingkasbankkredit: z.string().nullable().optional(),
  coabankkredit_nama: z.string().nullable().optional(),

  coapostinghutangdebet: z.string().nullable().optional(),
  coahutangdebet_nama: z.string().nullable().optional(),

  coapostinghutangkredit: z.string().nullable().optional(),
  coahutangkredit_nama: z.string().nullable().optional(),

  format: z
    .number()
    .int({ message: dynamicRequiredMessage('FORMAT') })
    .min(1, { message: dynamicRequiredMessage('FORMAT') }),
  format_nama: z.string().nullable().optional(),

  statusaktif: z
    .number()
    .int({ message: dynamicRequiredMessage('STATUS AKTIF') })
    .min(1, { message: dynamicRequiredMessage('STATUS AKTIF') }),
  statusaktif_nama: z.string().nullable().optional()
});

export type penerimaanEmklInput = z.infer<typeof penerimaanEmklSchema>;
