import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const jenisprosesfeeSchema = z.object({
  id: z.number().nullable().optional(),
  nama: z.string().min(1, { message: dynamicRequiredMessage('NAMA') }),
  keterangan: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('KETERANGAN') }),
  statusaktif: z
    .number({
      required_error: dynamicRequiredMessage('STATUS AKTIF'),
      invalid_type_error: dynamicRequiredMessage('STATUS AKTIF')
    })
    .min(1, { message: dynamicRequiredMessage('STATUS AKTIF') }),
  statusaktif_nama: z.string().nullable().optional()
});

export type JenisProsesFeeInput = z.infer<typeof jenisprosesfeeSchema>;
