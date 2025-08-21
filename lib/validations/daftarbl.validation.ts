import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const daftarblSchema = z.object({
  nama: z.string().nonempty({ message: dynamicRequiredMessage('NAMA') }),

  keterangan: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('KETERANGAN') }),

  statusaktif: z
    .number()
    .min(1, { message: dynamicRequiredMessage('STATUSAKTIF') }),

  statusaktif_nama: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('STATUSAKTIF_NAMA') })
});

export type DaftarblInput = z.infer<typeof daftarblSchema>;
