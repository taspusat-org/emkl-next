import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const cabangSchema = z.object({
  kodecabang: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('KODE CABANG') }),
  nama: z.string().nonempty({ message: dynamicRequiredMessage('NAMA') }),
  keterangan: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('KETERANGAN') }),
  statusaktif: z
    .number()
    .min(1, { message: dynamicRequiredMessage('STATUSAKTIF') }),
  text: z.string().optional(),
  cabang_id: z
    .number()
    .min(1, { message: dynamicRequiredMessage('CABANG ID') }),
  namacabang_hr: z.string().optional(),
  modifiedby: z.string().optional()
});
export type CabangInput = z.infer<typeof cabangSchema>;
