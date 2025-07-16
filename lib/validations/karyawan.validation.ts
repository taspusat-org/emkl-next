import { z } from 'zod';
import { isValidAscii } from './keyboard.validation';
import { REQUIRED_FIELD } from '@/constants/validation';
import { dynamicRequiredMessage } from '../utils';

export const karyawanSchema = (isResignFilled: boolean) => {
  console.log(isResignFilled, 'isResignFilled');
  if (isResignFilled) {
    return z.object({
      agama_id: z.number().nullable().optional(),
      statuskerja_id: z.number().nullable().optional(),
      npwp: z.string().nullable().optional(),
      statuskaryawan_id: z.number().nullable().optional(),
      jumlahtanggungan: z.string().nullable().optional(),
      noktp: z.string().nullable().optional(),
      namakaryawan: z.string().nullable().optional(),
      namaalias: z.string().nullable().optional(),
      jeniskelamin_id: z.number().nullable().optional(),
      alamat: z.string().nullable().optional(),
      tempatlahir: z.string().nullable().optional(),
      tgllahir: z.string().nullable().optional(),
      golongandarah_id: z.number().nullable().optional(),
      nohp: z.string().nullable().optional(),
      foto: z.any().nullable().optional(),
      tglmasukkerja: z.string().nullable().optional(),
      cabang_id: z.number().nullable().optional(),
      shift_id: z.number().nullable().optional(),
      jabatan_id: z.number().nullable().optional(),
      keterangan: z.string().nullable().optional(),
      namaibu: z.string().nullable().optional(),
      namaayah: z.string().nullable().optional(),
      kodekaryawan: z.string().nullable().optional(),
      email: z.string().nullable().optional(),
      tglresign: z.string().nullable().optional(),
      tglmutasi: z.string().nullable().optional(),
      atasan_id: z.number().nullable().optional(),
      thr_id: z.number().nullable().optional(),
      daftaremail_id: z.number().nullable().optional(),
      approval_id: z.number().nullable().optional(),
      kodemarketing: z.string().nullable().optional(),
      alasanberhenti: z.string().nullable().optional(),
      statusaktif: z.number().nullable().optional(),
      info: z.string().nullable().optional(),
      statusaktif_text: z.string().nullable().optional(),
      statuskerja_text: z.string().nullable().optional(),
      statuskaryawan_text: z.string().nullable().optional(),
      jeniskelamin_text: z.string().nullable().optional(),
      golongandarah_text: z.string().nullable().optional(),
      agama_text: z.string().nullable().optional(),
      cabang_nama: z.string().nullable().optional(),
      jabatan_nama: z.string().nullable().optional(),
      atasan_nama: z.string().nullable().optional(),
      shift_nama: z.string().nullable().optional(),
      approval_nama: z.string().nullable().optional(),
      thr_text: z.string().nullable().optional(),
      daftaremail_email: z.string().nullable().optional()
    });
  } else {
    return z.object({
      agama_id: z.number().nullable().optional(),
      statuskerja_id: z.number().min(1, `${REQUIRED_FIELD}`),
      npwp: z.string().max(30).nullable().optional(),
      statuskaryawan_id: z.number().nullable().optional(),
      jumlahtanggungan: z.string().nullable().optional(),
      noktp: z.string().max(16).nullable().optional(),
      namakaryawan: z
        .string()
        .nonempty({ message: dynamicRequiredMessage('NAMA KARYAWAN') })
        .nullable(),
      namaalias: z
        .string()
        .nonempty({ message: dynamicRequiredMessage('NAMA ALIAS') })
        .nullable(),
      jeniskelamin_id: z.number().min(1, `${REQUIRED_FIELD}`),
      alamat: z
        .string()
        .nonempty({ message: dynamicRequiredMessage('ALAMAT') })
        .nullable(),
      tempatlahir: z.string().nullable().optional(),
      tgllahir: z
        .string()
        .nonempty({ message: dynamicRequiredMessage('TANGGAL LAHIR') }),
      golongandarah_id: z.number().nullable().optional(),
      nohp: z.string().nullable().optional(),
      foto: z.any().nullable().optional(),
      tglmasukkerja: z
        .string()
        .nonempty({ message: dynamicRequiredMessage('PASSWORD') }),
      cabang_id: z.number().nullable().optional(),
      shift_id: z.number().nullable().optional(),
      jabatan_id: z.number().min(1, `${REQUIRED_FIELD}`),
      keterangan: z.string().nullable().optional(),
      namaibu: z.string().nullable().optional(),
      namaayah: z.string().nullable().optional(),
      kodekaryawan: z.string().max(200).nullable().optional(),
      email: z
        .string()
        .nonempty({ message: dynamicRequiredMessage('EMAIL') })
        .email('Email tidak valid'),
      tglresign: z.string().nullable().optional(),
      tglmutasi: z.string().nullable().optional(),
      atasan_id: z.number().min(1, `${REQUIRED_FIELD}`),
      thr_id: z.number().min(1, `${REQUIRED_FIELD}`),
      daftaremail_id: z.number().nullable().optional(),
      approval_id: z.number().nullable().optional(),
      kodemarketing: z.string().max(100).nullable().optional(),
      alasanberhenti: z.string().nullable().optional(),
      statusaktif: z.number().nullable().optional(),
      info: z.string().nullable().optional(),
      statusaktif_text: z.string().nullable().optional(),
      statuskerja_text: z.string().nullable().optional(),
      statuskaryawan_text: z.string().nullable().optional(),
      jeniskelamin_text: z.string().nullable().optional(),
      golongandarah_text: z.string().nullable().optional(),
      agama_text: z.string().nullable().optional(),
      cabang_nama: z.string().nullable().optional(),
      jabatan_nama: z.string().nullable().optional(),
      atasan_nama: z.string().nullable().optional(),
      shift_nama: z.string().nullable().optional(),
      approval_nama: z.string().nullable().optional(),
      thr_text: z.string().nullable().optional(),
      daftaremail_email: z.string().nullable().optional()
    });
  }
};
export type KaryawanInput = z.infer<ReturnType<typeof karyawanSchema>>;
