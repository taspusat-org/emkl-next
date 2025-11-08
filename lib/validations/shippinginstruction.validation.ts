import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const shippingInstructionDetailRincianSchema = z.object({
  id: z.number().optional(),

  idOrderan: z.number().optional(),

  orderanmuatan_nobukti: z
    .string({ message: dynamicRequiredMessage('JOB') })
    .nonempty({ message: dynamicRequiredMessage('JOB') }),

  comodity: z
    .string({ message: dynamicRequiredMessage('COMODITY') })
    .nonempty({ message: dynamicRequiredMessage('COMODITY') }),

  keterangan: z
    .string({ message: dynamicRequiredMessage('KETERANGAN') })
    .nonempty({ message: dynamicRequiredMessage('KETERANGAN') })
});
export type shippingInstructionHeaderDetailRincianInput = z.infer<
  typeof shippingInstructionDetailRincianSchema
>;

export const shippingInstructionDetailSchema = z.object({
  id: z.number().optional(),
  orderan_id: z.number().optional(),

  daftarbl_id: z
    .number({
      required_error: dynamicRequiredMessage('DAFTAR BL')
    })
    .min(1, { message: dynamicRequiredMessage('DAFTAR BL') }),

  containerpelayaran_id: z
    .number({
      required_error: dynamicRequiredMessage('CONTAINER PELAYARAN')
    })
    .min(1, { message: dynamicRequiredMessage('CONTAINER PELAYARAN') }),

  emkllain_id: z
    .number({
      required_error: dynamicRequiredMessage('EMKL LAIN')
    })
    .min(1, { message: dynamicRequiredMessage('EMKL LAIN') }),

  tujuankapal_id: z
    .number({
      required_error: dynamicRequiredMessage('TUJUAN KAPAL')
    })
    .min(1, { message: dynamicRequiredMessage('TUJUAN KAPAL') }),

  shippinginstructiondetail_nobukti: z.string().nullable().optional(),

  asalpelabuhan: z
    .string({ message: dynamicRequiredMessage('PELABUHAN ASAL') })
    .nonempty({ message: dynamicRequiredMessage('PELABUHAN ASAL') }),

  keterangan: z
    .string({ message: dynamicRequiredMessage('KETERANGAN') })
    .nonempty({ message: dynamicRequiredMessage('KETERANGAN') }),

  consignee: z
    .string({ message: dynamicRequiredMessage('CONSIGNEE') })
    .nonempty({ message: dynamicRequiredMessage('CONSIGNEE') }),

  shipper: z
    .string({ message: dynamicRequiredMessage('SHIPPER') })
    .nonempty({ message: dynamicRequiredMessage('SHIPPER') }),

  comodity: z
    .string({ message: dynamicRequiredMessage('COMODITY') })
    .nonempty({ message: dynamicRequiredMessage('COMODITY') }),

  notifyparty: z
    .string({ message: dynamicRequiredMessage('NOTIFY PARTY') })
    .nonempty({ message: dynamicRequiredMessage('NOTIFY PARTY') }),

  totalgw: z
    .string({ message: dynamicRequiredMessage('TOTAL GW / NW') })
    .nonempty({ message: dynamicRequiredMessage('TOTAL GW / NW') }),

  // namapelayaran: z
  //   .string({ message: dynamicRequiredMessage('NAMA PELAYARAN') })
  //   .nonempty({ message: dynamicRequiredMessage('NAMA PELAYARAN') }),
  detailsrincian: z.array(shippingInstructionDetailRincianSchema).min(1)
});
export type shippingInstructionHeaderDetailInput = z.infer<
  typeof shippingInstructionDetailSchema
>;

export const shippingInstructionHeaderSchema = z.object({
  id: z.number().optional(),
  nobukti: z.string().nullable().optional(),

  tglbukti: z
    .string({ message: dynamicRequiredMessage('TGL BUKTI') })
    .nonempty({ message: dynamicRequiredMessage('TGL BUKTI') }),

  schedule_id: z
    .number({
      required_error: dynamicRequiredMessage('SCHEDULE')
    })
    .min(1, { message: dynamicRequiredMessage('SCHEDULE') }),

  voyberangkat: z
    .string({ message: dynamicRequiredMessage('VOY BERANGKAT') })
    .nonempty({ message: dynamicRequiredMessage('VOY BERANGKAT') }),

  kapal_id: z
    .number({
      required_error: dynamicRequiredMessage('KAPAL')
    })
    .min(1, { message: dynamicRequiredMessage('KAPAL') }),
  kapal_nama: z.string().nullable().optional(),

  tglberangkat: z
    .string({ message: dynamicRequiredMessage('TGL BERANGKAT') })
    .nonempty({ message: dynamicRequiredMessage('TGL BERANGKAT') }),

  tujuankapal_id: z
    .number({
      required_error: dynamicRequiredMessage('TUJUAN')
    })
    .min(1, { message: dynamicRequiredMessage('TUJUAN') }),
  tujuankapal_nama: z.string().nullable().optional(),

  details: z.array(shippingInstructionDetailSchema).min(1)
  // detailsrincian: z.array(shippingInstructionDetailRincianSchema).min(1)
});

export type shippingInstructionHeaderInput = z.infer<
  typeof shippingInstructionHeaderSchema
>;
