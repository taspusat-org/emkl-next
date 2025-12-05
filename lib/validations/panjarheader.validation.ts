import { nullable, z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const PanjarDetailSchema = z.object({
  id: z.number().optional(),
  nobukti: z.string().nullable().optional(),
  panjar_id: z.number().nullable().optional(),

  orderanmuatan_id: z.number().nullable().optional(),
  orderanmuatan_nobukti: z
    .string({ message: dynamicRequiredMessage('ORDERAN MUATAN') })
    .nonempty({ message: dynamicRequiredMessage('ORDERAN MUATAN') }),

  estimasi: z
    .string({ message: dynamicRequiredMessage('ESTIMASI') })
    .nonempty({ message: dynamicRequiredMessage('ESTIMASI') }),

  nominal: z
    .string({ message: dynamicRequiredMessage('NOMINAL') })
    .nonempty({ message: dynamicRequiredMessage('NOMINAL') }),

  keterangan: z.string().nullable().optional()
});
export type BiayaExtraDetailInput = z.infer<typeof PanjarDetailSchema>;

export const panjarHeaderSchema = z.object({
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

  details: z.array(PanjarDetailSchema).min(1)
});

export type panjarHeaderInput = z.infer<typeof panjarHeaderSchema>;
