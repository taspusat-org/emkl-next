import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const jeniscatatanSchema = z.object({
  nama: z.string().nonempty({ message: dynamicRequiredMessage('NAMA') }),
  keterangan: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('KETERANGAN') }),
  statusaktif: z.number().min(1, `${REQUIRED_FIELD}`),
  statusaktifnama: z.string().optional()
});
export type JenisCatatanInput = z.infer<typeof jeniscatatanSchema>;
