import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';

export const approvalHeaderSchema = z.object({
  nama: z.string().nonempty({ message: `${REQUIRED_FIELD}` }),
  keterangan: z.string().nullable().optional(),
  cabang_nama: z.string().nullable().optional(),
  cabang_id: z.number().min(1, { message: `${REQUIRED_FIELD}` }),
  statusaktif: z.number().nullable().optional(),
  info: z.string().nullable()
});
export type ApprovalHeaderInput = z.infer<typeof approvalHeaderSchema>;
