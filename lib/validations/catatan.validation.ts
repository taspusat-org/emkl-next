import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';

export const catatanSchema = z.object({
  tgl: z
    .string()
    .optional()
    .refine(
      (val) => {
        // Jika ada nilai, validasi format dd-mm-yyyy
        return val ? /^\d{2}-\d{2}-\d{4}$/.test(val) : true;
      },
      {
        message: 'FORMAT TANGGAL TIDAK VALID'
      }
    ),
  karyawan_id: z.number().min(1, `${REQUIRED_FIELD}`),
  jeniscatatan_id: z.number().min(1, `${REQUIRED_FIELD}`),
  keterangan: z.string().optional().nullable(),
  karyawan_nama: z.string().optional().nullable(),
  jeniscatatan_nama: z.string().optional().nullable(),
  text: z.string().optional().nullable(),
  statusaktif: z.number().optional().nullable()
});

export type CatatanInput = z.infer<typeof catatanSchema>;
