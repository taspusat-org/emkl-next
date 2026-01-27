import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const biayaMuatanDetailSchema = z.object({
  id: z.number().optional(),
  biaya_id: z.number().nullable().optional(),
  nobukti: z.string().nullable().optional(),

  orderanmuatan_id: z.number().nullable().optional(),
  orderanmuatan_nobukti: z.string().nullable().optional(),

  tgljob: z.string().nullable(),
  nocontainer: z.string().nullable(),
  noseal: z.string().nullable(),
  lokasistuffing_nama: z.string().nullable(),
  shipper_nama: z.string().nullable(),
  container_nama: z.string().nullable(),

  estimasi: z.string().nullable().optional(),
  nominal: z.string().nullable().optional(),
  keterangan: z.string().nullable().optional(),

  biayaextra_id: z.number().nullable().optional(),
  biayaextra_nobukti: z.string().nullable().optional(),
  biayaextra_nobuktijson: z.string().nullable().optional()
});
// .superRefine(async (data, ctx) => {
//   console.log('SUPER REFINE', data.estimasi, data.nominal)
//   if(data.nominal && data.estimasi && data.nominal > data.estimasi) {
//     // alert({
//     //   title: `NILAI NOMINAL HARUS <= DARI ${data.estimasi}`,
//     //   variant: 'danger',
//     //   submitText: 'OK'
//     // });

//     ctx.addIssue({
//       path: ['nama'],
//       code: 'custom',
//       message: 'Type Akuntansi dengan nama ini sudah ada',
//     });
//   }
// });

export type biayaDetailBiayaInput = z.infer<typeof biayaMuatanDetailSchema>;

export const biayaHeaderSchema = z.object({
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

  keterangan: z.string().nullable().optional(),
  noinvoice: z.string().nullable().optional(),

  relasi_id: z
    .number({
      required_error: dynamicRequiredMessage('RELASI')
    })
    .min(1, { message: dynamicRequiredMessage('RELASI') }),
  relasi_nama: z.string().nullable().optional(),

  dibayarke: z.string().nullable().optional(),

  biayaextra_id: z.number().nullable().optional(),
  // biayaextra_nobukti: z
  //   .string({ message: dynamicRequiredMessage('NO BUKTI BIAYA EXTRA') })
  //   .nonempty({ message: dynamicRequiredMessage('NO BUKTI BIAYA EXTRA') }),
  biayaextra_nobukti: z.string().nullable().optional(),

  details: z.array(biayaMuatanDetailSchema).min(1)
});

export type biayaHeaderInput = z.infer<typeof biayaHeaderSchema>;
