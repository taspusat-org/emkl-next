import { nullable, z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const biayaExtraDetailSchema = z.object({
  id: z.number().optional(),
  nobukti: z.string().nullable().optional(),
  biayaextra_id: z.number().nullable().optional(),

  orderanmuatan_id: z.number().nullable().optional(),
  orderanmuatan_nobukti: z
    .string({ message: dynamicRequiredMessage('ORDERAN MUATAN') })
    .nonempty({ message: dynamicRequiredMessage('ORDERAN MUATAN') }),

  estimasi: z
    .string({ message: dynamicRequiredMessage('ESTIMASI') })
    .nonempty({ message: dynamicRequiredMessage('ESTIMASI') }),

  // nominal: z
  //   .string({ message: dynamicRequiredMessage('NOMINAL') })
  //   .nonempty({ message: dynamicRequiredMessage('NOMINAL') }),

  statustagih: z
    .number({
      required_error: dynamicRequiredMessage('BIAYA EMKL')
    })
    .min(1, { message: dynamicRequiredMessage('BIAYA EMKL') }),
  statustagih_nama: z.string().nullable().optional(),

  nominaltagih: z
    .string({ message: dynamicRequiredMessage('NOMINAL TAGIH') })
    .nonempty({ message: dynamicRequiredMessage('NOMINAL TAGIH') }),

  keterangan: z.string().nullable().optional(),

  groupbiayaextra_id: z
    .number({
      required_error: dynamicRequiredMessage('BIAYA EMKL')
    })
    .min(1, { message: dynamicRequiredMessage('BIAYA EMKL') }),
  groupbiayaextra_nama: z.string().nullable().optional()
});
export type BiayaExtraDetailInput = z.infer<typeof biayaExtraDetailSchema>;

export const biayaExtraHeaderSchema = z.object({
  id: z.number().optional(),
  nobukti: z.string().nullable().optional(),

  tglbukti: z
    .string({ message: dynamicRequiredMessage('TGL BUKTI') })
    .nonempty({ message: dynamicRequiredMessage('TGL BUKTI') }),

  jenisorder_id: z
    .number({
      required_error: dynamicRequiredMessage('JENIS ORDER')
    })
    .min(1, { message: dynamicRequiredMessage('JENIS ORDER') }),
  jenisorder_nama: z.string().nullable().optional(),

  biayaemkl_id: z
    .number({
      required_error: dynamicRequiredMessage('BIAYA EMKL')
    })
    .min(1, { message: dynamicRequiredMessage('BIAYA EMKL') }),
  biayaemkl_nama: z.string().nullable().optional(),

  keterangan: z
    .string({ message: dynamicRequiredMessage('KETERANGAN') })
    .nonempty({ message: dynamicRequiredMessage('KETERANGAN') }),

  details: z.array(biayaExtraDetailSchema).min(1)
});

export type biayaExtraHeaderInput = z.infer<typeof biayaExtraHeaderSchema>;
