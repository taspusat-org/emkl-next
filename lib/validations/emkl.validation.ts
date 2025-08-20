import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';
import { REQUIRED_FIELD } from '@/constants/validation';

export const emklSchema = z.object({
  nama: z.string().nonempty({ message: dynamicRequiredMessage('NAMA') }),
  contactperson: z
    .string()
    .trim()
    .nonempty({ message: dynamicRequiredMessage('CONTACT PERSON') }),
  alamat: z
    .string()
    .trim()
    .nonempty({ message: dynamicRequiredMessage('ALAMAT') }),
  coagiro: z.string().trim().nullable().optional(),
  coagiro_ket: z.string().trim().nullable().optional(),
  coapiutang: z.string().trim().nullable().optional(),
  coapiutang_ket: z.string().trim().nullable().optional(),
  coahutang: z.string().trim().nullable().optional(),
  coahutang_ket: z.string().trim().nullable().optional(),
  kota: z
    .string()
    .trim()
    .nonempty({ message: dynamicRequiredMessage('KOTA') }),
  kodepos: z
    .string()
    .trim()
    .nonempty({ message: dynamicRequiredMessage('KODE POS') }),
  notelp: z
    .string()
    .trim()
    .nonempty({ message: dynamicRequiredMessage('NO TELP') }),
  email: z.string().trim().nullable().optional(),
  fax: z.string().trim().nullable().optional(),
  alamatweb: z.string().trim().nullable().optional(),
  top: z
    .number()
    .int({ message: dynamicRequiredMessage('TOP Wajib Angka') })
    .nonnegative({
      message: dynamicRequiredMessage('TOP Tidak Boleh Angka Negatif')
    }),
  npwp: z
    .string()
    .trim()
    .nonempty({ message: dynamicRequiredMessage('NPWP Wajib Diisi') })
    .max(16),
  namapajak: z
    .string()
    .trim()
    .nonempty({ message: dynamicRequiredMessage('Nama Pajak Wajib Diisi') })
    .max(255),
  alamatpajak: z
    .string()
    .trim()
    .nonempty({ message: dynamicRequiredMessage('Alamat Pajak Wajib Diisi') })
    .max(255),
  statustrado: z.number().min(1, `${REQUIRED_FIELD}`),
  statusaktif: z.number().min(1, `${REQUIRED_FIELD}`),
  statustrado_text: z.string().optional(),
  statusaktif_text: z.string().optional(),
  modifiedby: z.string().nullable().optional()
});
export type EmklInput = z.infer<typeof emklSchema>;
