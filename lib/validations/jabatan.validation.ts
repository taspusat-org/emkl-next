import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const jabatanSchema = z.object({
  id: z.number().nullable().optional(),
  nama: z.string().nonempty({ message: dynamicRequiredMessage('NAMA') }),

  keterangan: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('KETERANGAN') }),

  statusaktif: z
    .number()
    .min(1, { message: dynamicRequiredMessage('STATUSAKTIF') }),

  statusaktif_nama: z.string().nullable().optional(),

  divisi_id: z.number().min(1, { message: dynamicRequiredMessage('Divisi') }),

  divisi: z.string().nullable().optional()
});

export type JabatanInput = z.infer<typeof jabatanSchema>;
