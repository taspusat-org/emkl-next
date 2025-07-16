import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const cabangSchema = z.object({
  kodecabang: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('KODE CABANG') }),
  nama: z.string().nonempty({ message: dynamicRequiredMessage('NAMA') }),
  keterangan: z.string().optional(),
  periode_text: z.string().optional(),
  minuscuti_text: z.string().optional(),
  statusaktif: z.number().min(1, `${REQUIRED_FIELD}`),
  periode: z.number().min(1, `${REQUIRED_FIELD}`),
  minuscuti: z.number().min(1, `${REQUIRED_FIELD}`)
});
export type CabangInput = z.infer<typeof cabangSchema>;
