import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const blDetailRincianSchema = z.object({
  id: z.number().optional(),

  nobukti: z.string().nullable().optional(),
  bldetail_id: z.number().nullable().optional(),
  bldetail_nobukti: z.string().nullable().optional(),

  orderanmuatan_nobukti: z
    .string({ message: dynamicRequiredMessage('JOB') })
    .nonempty({ message: dynamicRequiredMessage('JOB') }),

  keterangan: z.string().nullable().optional()
});
export type blHeaderDetailRincianInput = z.infer<typeof blDetailRincianSchema>;

export const blDetailSchema = z.object({
  id: z.number().optional(),
  nobukti: z.string().nullable().optional(),

  bl_id: z.number().nullable().optional(),

  bl_nobukti: z
    .string({ message: dynamicRequiredMessage('NO BL CONECTING') })
    .nonempty({ message: dynamicRequiredMessage('NO BL CONECTING') }),

  shippinginstructiondetail_nobukti: z
    .string({
      message: dynamicRequiredMessage('SHIPPING INSTRUCTION DETAIL NO BUKTI')
    })
    .nonempty({
      message: dynamicRequiredMessage('SHIPPING INSTRUCTION DETAIL NO BUKTI')
    }),

  keterangan: z.string().nullable().optional(),

  asalpelabuhan: z.string().nullable().optional(),
  consignee: z.string().nullable().optional(),
  shipper: z.string().nullable().optional(),
  comodity: z.string().nullable().optional(),
  notifyparty: z.string().nullable().optional(),
  pelayaran_nama: z.string().nullable().optional(),
  emkllain_nama: z.string().nullable().optional(),

  detailsrincian: z.array(blDetailRincianSchema).min(1)
});
export type blDetailInput = z.infer<typeof blDetailSchema>;

export const blHeaderSchema = z.object({
  id: z.number().optional(),
  nobukti: z.string().nullable().optional(),

  shippinginstruction_nobukti: z
    .string({ message: dynamicRequiredMessage('shippinginstruction nobukti') })
    .nonempty({
      message: dynamicRequiredMessage('shippinginstruction nobukti')
    }),

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

  details: z.array(blDetailSchema).min(1)
});

export type blHeaderInput = z.infer<typeof blHeaderSchema>;
