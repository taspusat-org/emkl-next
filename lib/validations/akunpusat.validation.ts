import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const AkunpusatSchema = z.object({
  id: z.number().nullable().optional(),
  coa: z.string().min(1, { message: dynamicRequiredMessage('COA') }),
  parent: z.string().nonempty({ message: dynamicRequiredMessage('PARENT') }),
  keterangancoa: z.string().nullable().optional(),
  level: z.coerce
    .number({
      required_error: dynamicRequiredMessage('LEVEL'),
      invalid_type_error: dynamicRequiredMessage('LEVEL')
    })
    .min(1, { message: dynamicRequiredMessage('LEVEL') }),
  statusaktif: z.coerce
    .number({
      required_error: dynamicRequiredMessage('STATUS AKTIF'),
      invalid_type_error: dynamicRequiredMessage('STATUS AKTIF')
    })
    .min(1, { message: dynamicRequiredMessage('STATUS AKTIF') }),
  cabang_id: z.coerce
    .number({
      required_error: dynamicRequiredMessage('CABANG ID'),
      invalid_type_error: dynamicRequiredMessage('CABANG ID')
    })
    .min(1, { message: dynamicRequiredMessage('CABANG ID') }),
  type_id: z.coerce
    .number({
      required_error: dynamicRequiredMessage('TYPE AKUNTANSI'),
      invalid_type_error: dynamicRequiredMessage('TYPE AKUNTANSI')
    })
    .min(1, { message: dynamicRequiredMessage('TYPE AKUNTANSI') }),
  type_nama: z.string().nullable().optional(),
  cabang_nama: z.string().nullable().optional(),
  statusaktif_nama: z.string().nullable().optional()
});

export type AkunpusatInput = z.infer<typeof AkunpusatSchema>;
