import { z } from 'zod';
import { REQUIRED_FIELD } from '@/constants/validation';
import { dynamicRequiredMessage } from '../utils';

export const ShipperSchema = z.object({
  id: z.number().nullable().optional(),
  nama: z.string().nonempty({ message: dynamicRequiredMessage('NAMA') }),
  keterangan: z.string().nullable().optional(),
  contactperson: z.string().nullable().optional(),
  alamat: z.string().nullable().optional(),

  coa: z.string().nonempty({ message: dynamicRequiredMessage('COA') }),
  coa_text: z.string().nullable().optional(),

  coapiutang: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('COA PIUTANG') }),
  coapiutang_text: z.string().nullable().optional(),

  coahutang: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('COA HUTANG') }),
  coahutang_text: z.string().nullable().optional(),

  kota: z.string().nullable().optional(),
  kodepos: z.string().nullable().optional(),
  telp: z.string().nullable().optional(),
  email: z
    .string()
    .email('Email harus mengandung @ dan domain yang valid')
    .nullable()
    .or(z.literal('')),
  fax: z.string().nullable().optional(),
  web: z.string().nullable().optional(),

  creditlimit: z.coerce
    .string({
      required_error: dynamicRequiredMessage('CREDIT LIMIT'),
      invalid_type_error: dynamicRequiredMessage('CREDIT LIMIT')
    })
    .refine((val) => val !== 'undefined' && val.trim() !== '', {
      message: dynamicRequiredMessage('CREDIT LIMIT')
    }),

  creditterm: z.coerce
    .number({
      required_error: dynamicRequiredMessage('CREDIT TERM'),
      invalid_type_error: dynamicRequiredMessage('CREDIT TERM')
    })
    .min(1, { message: dynamicRequiredMessage('CREDIT TERM') }),

  credittermplus: z.coerce
    .number({
      required_error: dynamicRequiredMessage('CREDIT TERM PLUS'),
      invalid_type_error: dynamicRequiredMessage('CREDIT TERM PLUS')
    })
    .min(1, { message: dynamicRequiredMessage('CREDIT TERM PLUS') }),

  npwp: z.string().nonempty({ message: dynamicRequiredMessage('NPWP') }),

  coagiro: z.string().nonempty({ message: dynamicRequiredMessage('COA GIRO') }),
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
    .nonempty({ message: dynamicRequiredMessage('KODE PROSPEK') }),
  namashipperprospek: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('NAMA SHIPPER PROSPEK') }),

  emaildelay: z
    .string()
    .email('Email harus mengandung @ dan domain yang valid')
    .nullable()
    .or(z.literal('')),
  keterangan1barisinvoice: z.string().nullable().optional(),
  nik: z.string().nullable().optional(),
  namaparaf: z.string().nullable().optional(),
  saldopiutang: z.string().nullable().optional(),
  keteranganshipperjobminus: z.string().nullable().optional(),
  tglemailshipperjobminus: z.string().nullable().optional(),
  tgllahir: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('TANGGAL LAHIR') }),
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
