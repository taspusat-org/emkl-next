import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const statusJobDetailSchema = z.object({
  id: z.number().optional(),
  job: z
    .number({
      required_error: dynamicRequiredMessage('NO JOB')
    })
    .min(1, { message: dynamicRequiredMessage('NO JOB') }),

  job_nama: z.string().nullable().optional(),

  // tglorder: z.string().nullable(),
  // nocontainer: z.string().nullable(),
  // noseal: z.string().nullable(),

  tglorder: z
    .string({ message: dynamicRequiredMessage('TANGGAL ORDER') })
    .min(1, { message: dynamicRequiredMessage('TANGGAL ORDER') }),

  nocontainer: z
    .string({ message: dynamicRequiredMessage('NO CONTAINER') })
    .min(1, { message: dynamicRequiredMessage('NO CONTAINER') }),

  noseal: z
    .string({ message: dynamicRequiredMessage('NO SEAL') })
    .min(1, { message: dynamicRequiredMessage('NO SEAL') }),

  shipper_id: z
    .number({
      required_error: dynamicRequiredMessage('SHIPPER')
    })
    .min(1, { message: dynamicRequiredMessage('SHIPPER') }),
  shipper_nama: z.string().nullable().optional(),

  lokasistuffing: z
    .number({
      required_error: dynamicRequiredMessage('LOKASI STUFFING')
    })
    .min(1, { message: dynamicRequiredMessage('LOKASI STUFFING') }),
  lokasistuffing_nama: z.string().nullable().optional(),

  keterangan: z
    .string({ message: dynamicRequiredMessage('KETERANGAN') })
    .min(1, { message: dynamicRequiredMessage('KETERANGAN') })
});
export type statusJobDetailInput = z.infer<typeof statusJobDetailSchema>;

export const statusJobHeaderSchema = z.object({
  tglstatus: z
    .string({ message: dynamicRequiredMessage('TANGGAL') })
    .min(1, { message: dynamicRequiredMessage('TANGGAL') }),

  jenisorder_id: z
    .number({
      required_error: dynamicRequiredMessage('JENIS ORDERAN')
    })
    .min(1, { message: dynamicRequiredMessage('JENIS ORDERAN') }),
  jenisorder_nama: z.string().nullable().optional(),

  statusjob: z
    .number({
      required_error: dynamicRequiredMessage('JENIS STATUS JOB')
    })
    .min(1, { message: dynamicRequiredMessage('JENIS STATUS JOB') }),
  statusjob_nama: z.string().nullable().optional(),

  details: z.array(statusJobDetailSchema).min(1)
});
export type statusJobHeaderInput = z.infer<typeof statusJobHeaderSchema>;
