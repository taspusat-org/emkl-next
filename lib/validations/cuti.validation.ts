import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';
const detailCutiSchema = z.array(
  z.object({
    id: z.string(),
    tglcuti: z.string().refine((value) => !isNaN(Date.parse(value)), {
      message: 'tglcuti harus memiliki format tanggal yang valid'
    })
  })
);

export const cutiSchema = z.object({
  tglcuti: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('TANGGAL CUTI') }), // Foreign key, bisa kosong
  karyawan_id: z.number().nullable().optional(), // Foreign key, bisa kosong
  alasancuti: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('ALASAN CUTI') }), // Ikon opsional
  alasanpenolakan: z.string().optional(), // Ikon opsional
  lampiran: z.array(z.any()).nullable().optional(), // Tanggal cuti wajib diisi
  detailCuti: detailCutiSchema
});

export type CutiInput = z.infer<typeof cutiSchema>;
export const approveCutiSchema = z.object({
  tglcuti: z.string().nullable().optional(), // Foreign key, bisa kosong
  karyawan_id: z.number().nullable().optional(), // Foreign key, bisa kosong
  alasancuti: z.string().optional(), // Ikon opsional
  alasanpenolakan: z.string().nullable().optional(), // Ikon opsional
  statusnonhitung_nama: z.string().nullable().optional(), // Ikon opsional
  statusnonhitung: z.any().nullable().optional(),
  lampiran: z.array(z.any()).nullable().optional(), // Tanggal cuti wajib diisi
  detailCuti: detailCutiSchema
});

export type ApproveCutiInput = z.infer<typeof approveCutiSchema>;
