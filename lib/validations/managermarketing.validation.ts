import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';
export const managermarketingDetailSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  nominalawal: z.string().nullable(),
  nominalakhir: z.string().nullable(),
  persentase: z.string().nullable(),
  statusaktif: z.string().nullable()
});
export type ManagerMarketingDetailInput = z.infer<
  typeof managermarketingDetailSchema
>;

export const managermarketingHeaderSchema = z.object({
  nama: z.string().nonempty({ message: dynamicRequiredMessage('NAMA') }),
  keterangan: z
    .string()
    .trim()
    .nonempty({ message: dynamicRequiredMessage('KETERANGAN') }),
  minimalprofit: z
    .string()
    .trim()
    .nonempty({ message: dynamicRequiredMessage('MINIMAL PROFIT') }),
  statusmentor: z.number().nullable(),
  statusmentor_text: z.string().nullable().optional(),
  statusleader: z.number().nullable(),
  statusleader_text: z.string().nullable().optional(),
  statusaktif: z.number().nullable(),
  text: z.string().nullable().optional(),
  details: z.array(managermarketingDetailSchema).min(1)
});
export type ManagerMarketingHeaderInput = z.infer<
  typeof managermarketingHeaderSchema
>;
