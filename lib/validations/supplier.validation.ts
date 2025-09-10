import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const supplierSchema = z.object({
  id: z.number().nullable().optional(),
  nama: z.string().min(1, { message: dynamicRequiredMessage('NAMA') }),
  keterangan: z
    .string({ message: dynamicRequiredMessage('KETERANGAN') })
    .nonempty({ message: dynamicRequiredMessage('KETERANGAN') }),
  contactperson: z
    .string({ message: dynamicRequiredMessage('CONTACT PERSON') })
    .min(1, { message: dynamicRequiredMessage('CONTACT PERSON') })
    .max(100),
  ktp: z
    .string({ message: dynamicRequiredMessage('KTP') })
    .min(16, { message: 'KTP HARUS TERDIRI DARI 16 DIGIT' })
    .max(50),
  alamat: z
    .string({ message: dynamicRequiredMessage('ALAMAT') })
    .min(1, { message: dynamicRequiredMessage('ALAMAT') })
    .max(100),

  coa: z
    .string({ message: dynamicRequiredMessage('COA') })
    .min(1, { message: dynamicRequiredMessage('COA') }),
  coa_nama: z.string().nullable().optional(),

  coapiu: z
    .string({ message: dynamicRequiredMessage('COA PIUTANG') })
    .min(1, { message: dynamicRequiredMessage('COA PIUTANG') }),
  coapiu_nama: z.string().nullable().optional(),

  coahut: z
    .string({ message: dynamicRequiredMessage('COA HUTANG') })
    .min(1, { message: dynamicRequiredMessage('COA HUTANG') }),
  coahut_nama: z.string().nullable().optional(),

  coagiro: z
    .string({ message: dynamicRequiredMessage('COA GIRO') })
    .min(1, { message: dynamicRequiredMessage('COA GIRO') }),
  coagiro_nama: z.string().nullable().optional(),

  kota: z.string().nullable().optional(),
  kodepos: z.string().nullable().optional(),
  telp: z.string().nullable().optional(),

  email: z
    .string({ message: dynamicRequiredMessage('EMAIL') })
    .min(1, { message: dynamicRequiredMessage('EMAIL') })
    .email({ message: 'Email must be a valid email address' })
    .max(50),

  fax: z.string().nullable().optional(),
  web: z.string().nullable().optional(),

  // creditterm: z
  //   .number()
  //   .int({ message: dynamicRequiredMessage('credit term') })
  //   .min(1, { message: dynamicRequiredMessage('credit term') }),

  creditterm: z.coerce
    .number({
      required_error: dynamicRequiredMessage('CREDIT TERM'),
      invalid_type_error: dynamicRequiredMessage('CREDIT TERM')
    })
    .min(1, { message: dynamicRequiredMessage('CREDIT TERM') }),

  credittermplus: z.number().nullable().optional(),

  npwp: z
    .string({ message: dynamicRequiredMessage('NPWP') })
    .min(1, { message: dynamicRequiredMessage('NPWP') })
    .regex(/^\d{2}\.\d{3}\.\d{3}\.\d-\d{3}\.\d{3}$/, {
      message: 'Format NPWP tidak valid (contoh: 12.345.678.9-012.345)'
    })
    .max(30),

  alamatfakturpajak: z
    .string({ message: dynamicRequiredMessage('alamat faktur pajak') })
    .min(1, { message: dynamicRequiredMessage('alamat faktur pajak') })
    .max(500),

  namapajak: z
    .string({ message: dynamicRequiredMessage('nama pajak') })
    .min(1, { message: dynamicRequiredMessage('nama pajak') })
    .max(50),

  nominalpph21: z.string().nullable().optional(),
  nominalpph23: z.string().nullable().optional(),
  noskb: z.string().nullable().optional(),
  tglskb: z.string().nullable().optional(),
  nosk: z.string().nullable().optional(),
  tglsk: z.string().nullable().optional(),

  statusaktif: z
    .number()
    .int({ message: dynamicRequiredMessage('STATUS AKTIF') })
    .min(1, { message: dynamicRequiredMessage('STATUS AKTIF') }),
  statusaktif_nama: z.string().nullable().optional()
});

export type supplierInput = z.infer<typeof supplierSchema>;
