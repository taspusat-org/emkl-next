import { z } from 'zod';
import { REQUIRED_FIELD } from '@/constants/validation';
import { dynamicRequiredMessage } from '../utils';
import { detailsSchema } from './marketing.validation';
export const ConsigneeDetailSchema = z.object({
  keterangan: z.string().min(1, { message: REQUIRED_FIELD })
});
export type ConsigneeDetailInput = z.infer<typeof ConsigneeDetailSchema>;
export const ConsigneeHargaJualSchema = z.object({
  container_id: z
    .number()
    .min(1, { message: dynamicRequiredMessage('CONTAINER') }),
  nominal: z.number().nullable().optional(),
  container_nama: z.string().nullable().optional()
});
export const ConsigneeSchema = z.object({
  shipper_id: z.coerce
    .number({
      required_error: dynamicRequiredMessage('SHIPPER'),
      invalid_type_error: dynamicRequiredMessage('SHIPPER')
    })
    .min(1, { message: dynamicRequiredMessage('SHIPPER') }),
  shipper_nama: z.string().nullable().optional(),
  namaconsignee: z.string().nullable().optional(),
  tujuankapal_id: z.coerce
    .number({
      required_error: dynamicRequiredMessage('TUJUAN KAPAL'),
      invalid_type_error: dynamicRequiredMessage('TUJUAN KAPAL')
    })
    .min(1, { message: dynamicRequiredMessage('TUJUAN KAPAL') }),
  tujuankapal_nama: z.string().nullable().optional(),
  details: z.array(ConsigneeDetailSchema).optional().nullable(),
  hargajual: z.array(ConsigneeHargaJualSchema).optional().nullable()
});

export type ConsigneeInput = z.infer<typeof ConsigneeSchema>;
