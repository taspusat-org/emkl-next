import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';
export const managermarketingDetailSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  nominalawal: z
    .string()
    .trim()
    .nonempty({ message: dynamicRequiredMessage('NOMINAL AWAL') }),
  nominalakhir: z
    .string()
    .trim()
    .nonempty({ message: dynamicRequiredMessage('NOMINAL AKHIR') }),
  persentase: z
    .string()
    .trim()
    .nonempty({ message: dynamicRequiredMessage('PERSENTASE') }),
  statusaktif: z.string().nullable()
});
export type ManagerMarketingDetailInput = z.infer<
  typeof managermarketingDetailSchema
>;

export const managermarketingHeaderSchema = z.object({
  id: z.number().nullable().optional(),
  nama: z.string().nonempty({ message: dynamicRequiredMessage('NAMA') }),
  keterangan: z
    .string()
    .trim()
    .nonempty({ message: dynamicRequiredMessage('KETERANGAN') }),
  minimalprofit: z.coerce
    .string({
      required_error: dynamicRequiredMessage('MINIMAL PROFIT'),
      invalid_type_error: dynamicRequiredMessage('MINIMAL PROFIT')
    })
    .refine((val) => val !== 'undefined' && val.trim() !== '', {
      message: dynamicRequiredMessage('MINIMAL PROFIT')
    }),
  statusmentor: z.number().nullable(),
  statusmentor_text: z.string().nullable().optional(),
  statusleader: z.number().nullable(),
  statusleader_text: z.string().nullable().optional(),
  statusaktif: z.number().nullable(),
  text: z.string().nullable().optional(),
  details: z
    .array(managermarketingDetailSchema)
    .min(1, { message: 'Minimal 1 detail harus diisi' })
    .superRefine((details, ctx) => {
      details.forEach((item, index) => {
        if (!item.nominalawal) {
          ctx.addIssue({
            path: [index, 'nominalawal'],
            code: z.ZodIssueCode.custom,
            message: dynamicRequiredMessage(`NOMINAL AWAL (baris ${index + 1})`)
          });
        }
        if (!item.nominalakhir) {
          ctx.addIssue({
            path: [index, 'nominalakhir'],
            code: z.ZodIssueCode.custom,
            message: dynamicRequiredMessage(
              `NOMINAL AKHIR (baris ${index + 1})`
            )
          });
        }
        if (!item.persentase) {
          ctx.addIssue({
            path: [index, 'persentase'],
            code: z.ZodIssueCode.custom,
            message: dynamicRequiredMessage(`PERSENTASE (baris ${index + 1})`)
          });
        }
      });
    })
});

export type ManagerMarketingHeaderInput = z.infer<
  typeof managermarketingHeaderSchema
>;
