import { z } from 'zod';
import { REQUIRED_FIELD } from '@/constants/validation';
import { dynamicRequiredMessage } from '../utils';

export const ShipperSchema = z.object({
  nama: z.string().nonempty({ message: dynamicRequiredMessage('NAMA') }),
  keterangan: z.string().nullable().optional(),
  contactperson: z.string().nullable().optional(),
  alamat: z.string().nullable().optional(),

  coa: z.number().min(1, { message: REQUIRED_FIELD }),
  coa_text: z.string().nullable().optional(),

  coapiutang: z.number().min(1, { message: REQUIRED_FIELD }),
  coapiutang_text: z.string().nullable().optional(),

  coahutang: z.number().min(1, { message: REQUIRED_FIELD }),
  coahutang_text: z.string().nullable().optional(),

  kota: z.string().nullable().optional(),
  kodepos: z.string().nullable().optional(),
  telp: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  fax: z.string().nullable().optional(),
  web: z.string().nullable().optional(),

  creditlimit: z
    .string()
    .min(1, { message: dynamicRequiredMessage('CREDIT LIMIT') }),
  creditterm: z
    .number()
    .int({ message: dynamicRequiredMessage('Credit Term Wajib Angka') })
    .nonnegative({
      message: dynamicRequiredMessage('Credit Term Tidak Boleh Angka Negatif')
    })
    .min(1, { message: dynamicRequiredMessage('CREDIT TERM') }),

  credittermplus: z
    .number()
    .int({ message: dynamicRequiredMessage('Credit Term Plus Wajib Angka') })
    .nonnegative({
      message: dynamicRequiredMessage(
        'Credit Term Plus Tidak Boleh Angka Negatif'
      )
    })
    .min(1, { message: dynamicRequiredMessage('CREDIT TERM PLUS') }),

  npwp: z.string().nonempty({ message: dynamicRequiredMessage('NPWP') }),

  coagiro: z.number().min(1, { message: REQUIRED_FIELD }),
  coagiro_text: z.string().nullable().optional(),

  ppn: z.string().nullable().optional(),
  titipke: z.string().nullable().optional(),
  ppnbatalmuat: z.string().nullable().optional(),
  grup: z.string().nullable().optional(),
  formatdeliveryreport: z.number().nullable().optional(),
  comodity: z.string().nullable().optional(),
  namashippercetak: z.string().nullable().optional(),
  formatcetak: z.number().nullable().optional(),

  marketing_id: z.number().min(1, { message: REQUIRED_FIELD }),
  marketing_text: z.string().nullable().optional(),

  blok: z.string().nullable().optional(),
  nomor: z.string().nullable().optional(),
  rt: z.string().nullable().optional(),
  rw: z.string().nullable().optional(),
  kelurahan: z.string().nullable().optional(),
  kabupaten: z.string().nullable().optional(),
  kecamatan: z.string().nullable().optional(),
  propinsi: z.string().nullable().optional(),
  isdpp10psn: z.string().nullable().optional(),
  usertracing: z.string().nullable().optional(),
  passwordtracing: z.string().nullable().optional(),

  kodeprospek: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('KODEPROSPEK') }),
  namashipperprospek: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('NAMASHIPPERPROSPEK') }),

  emaildelay: z.string().nullable().optional(),
  keterangan1barisinvoice: z.string().nullable().optional(),
  nik: z.string().nullable().optional(),
  namaparaf: z.string().nullable().optional(),
  saldopiutang: z.string().nullable().optional(),
  keteranganshipperjobminus: z.string().nullable().optional(),
  tglemailshipperjobminus: z.string().nullable().optional(),
  tgllahir: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('TGLLAHIR') }),
  idshipperasal: z.number().nullable().optional(),
  shipperasal_text: z.string().nullable().optional(),

  initial: z.string().nullable().optional(),
  tipe: z.string().nullable().optional(),
  idtipe: z.number().nullable().optional(),
  idinitial: z.number().nullable().optional(),
  nshipperprospek: z.string().nullable().optional(),
  parentshipper_id: z.number().nullable().optional(),
  parentshipper_text: z.string().nullable().optional(),

  npwpnik: z.string().nullable().optional(),
  nitku: z.string().nullable().optional(),
  kodepajak: z.string().nullable().optional(),

  statusaktif: z.number().min(1, { message: REQUIRED_FIELD }),
  text: z.string().nullable().optional()
});

export type ShipperInput = z.infer<typeof ShipperSchema>;
