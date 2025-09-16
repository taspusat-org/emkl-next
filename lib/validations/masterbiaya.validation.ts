import { z } from 'zod';
import { REQUIRED_FIELD } from '@/constants/validation';
import { dynamicRequiredMessage } from '../utils';

export const MasterBiayaSchema = z.object({
  tujuankapal_id: z.number().nullable().optional(),
  tujuankapal_text: z.string().nullable().optional(),

  sandarkapal_id: z.number().nullable().optional(),
  sandarkapal_text: z.string().nullable().optional(),

  pelayaran_id: z.number().nullable().optional(),
  pelayaran_text: z.string().nullable().optional(),

  container_id: z.number().nullable().optional(),
  container_text: z.string().nullable().optional(),

  biayaemkl_id: z.number().nullable().optional(),
  biayaemkl_text: z.string().nullable().optional(),

  jenisorder_id: z.number().nullable().optional(),
  jenisorderan_text: z.string().nullable().optional(),

  tglberlaku: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('TANGGAL BERLAKU') }),
  nominal: z.string().nonempty({ message: dynamicRequiredMessage('NOMINAL') }),

  statusaktif: z.number().min(1, { message: REQUIRED_FIELD }),
  text: z.string().nullable().optional()
});

export type MasterBiayaInput = z.infer<typeof MasterBiayaSchema>;
