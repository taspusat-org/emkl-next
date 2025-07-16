import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';
export const izinSchema = z.object({
  tglizin: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('TANGGAL IZIN') })
    .refine(
      (val) => {
        // Jika ada nilai, validasi format dd-mm-yyyy
        return val ? /^\d{2}-\d{2}-\d{4}$/.test(val) : true;
      },
      {
        message: 'FORMAT TANGGAL TIDAK VALID'
      }
    ),
  jampengajuan: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('JAM IZIN') }),
  alasanizin: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('ALASAN IZIN') }), // Email wajib diisi
  karyawan_id: z.number().nullable().optional(), // Foreign key, bisa kosong
  jenisizin_id: z.number().nullable().optional(), // Foreign key, bisa kosong
  jenisizin_nama: z.string().nullable().optional() // Foreign key, bisa kosong
});
export type IzinInput = z.infer<typeof izinSchema>;
