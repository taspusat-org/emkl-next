import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const offdaysSchema = z.object({
  tgl: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('TANGGAL') })
    .refine(
      (val) => {
        // Jika ada nilai, validasi format dd-mm-yyyy
        return val ? /^\d{2}-\d{2}-\d{4}$/.test(val) : true;
      },
      {
        message: 'FORMAT TANGGAL TIDAK VALID'
      }
    ), // Tanggal wajib diisi
  keterangan: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('KETERANGAN') }),
  statusaktif: z.number().nullable().optional(), // Email wajib diisi
  cabang_id: z.number().nullable().optional() // Email wajib diisi
});
export type OffdayInput = z.infer<typeof offdaysSchema>;
