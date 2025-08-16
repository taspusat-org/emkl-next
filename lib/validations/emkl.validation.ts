import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const emklSchema = z.object({
  id: z.number().min(1, { message: REQUIRED_FIELD }),

  statusrelasi: z.number().nullable().optional(),
  relasi_id: z.number().nullable().optional(),

  nama: z
    .string()
    .trim()
    .nonempty({ message: dynamicRequiredMessage('NAMA') }),

  contactperson: z.string().nullable().optional(),
  alamat: z.string().nullable().optional(),
  coagiro: z.string().nullable().optional(),
  coapiutang: z.string().nullable().optional(),
  coahutang: z.string().nullable().optional(),
  kota: z.string().nullable().optional(),
  kodepos: z.string().nullable().optional(),
  notelp: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  fax: z.string().nullable().optional(),
  alamatweb: z.string().nullable().optional(),

  top: z.number().nullable().optional(),

  npwp: z.string().nullable().optional(),
  namapajak: z.string().nullable().optional(),
  alamatpajak: z.string().nullable().optional(),

  statustrado: z.number().nullable().optional(),
  statusaktif: z.number().min(1, { message: REQUIRED_FIELD }),

  info: z.string().nullable().optional(),
  modifiedby: z.string().nullable().optional(),

  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional()
});

export type emklInput = z.infer<typeof emklSchema>;
