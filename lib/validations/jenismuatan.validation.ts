import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';

export const jenismuatanSchema = z.object({
  nama: z.string(),
  keterangan: z.string(),
  statusaktif: z.number().min(1, `${REQUIRED_FIELD}`),
  statusaktif_text: z.string().optional()
});
export type JenisMuatanInput = z.infer<typeof jenismuatanSchema>;
