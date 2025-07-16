import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const errorSchema = z.object({
  kode: z.string().nonempty({ message: dynamicRequiredMessage('KODE') }),
  ket: z.string().nonempty({ message: dynamicRequiredMessage('KETERANGAN') }),
  statusaktif: z.number().min(1, 'Harap Pilih Status Aktif') // Email wajib diisi
});
export type ErrorInput = z.infer<typeof errorSchema>;
