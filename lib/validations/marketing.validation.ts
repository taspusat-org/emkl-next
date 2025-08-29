import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const marketingOrderanSchema = z.object({
  id: z.number().optional(),
  nama: z.string().nullable(),
  keterangan: z.string().nullable(),
  singkatan: z.string().nullable(),
  statusaktif: z.number().nullable(),
  statusaktifOrderan_nama: z.string().nullable()
});

export const marketingBiayaSchema = z.object({
  id: z.number().optional(),
  jenisbiayamarketing_id: z.number().nullable(),
  jenisbiayamarketing_nama: z.string().nullable().optional(),
  nominal: z.string().nullable(),
  statusaktif: z.number().nullable(),
  statusaktifBiaya_nama: z.string().nullable().optional()
});

export const marketingManagerSchema = z.object({
  id: z.number().optional(),
  managermarketing_id: z.number().nullable(),
  managermarketing_nama: z.string().nullable().optional(),
  statusaktif: z.number().nullable(),
  statusaktifManager_nama: z.string().nullable().optional()
});

export const marketingProsesFeeSchema = z.object({
  id: z.number().optional(),
  jenisprosesfee_id: z.number().nullable(),
  jenisprosesfee_nama: z.string().nullable().optional(),
  statuspotongbiayakantor: z.number().nullable(),
  statuspotongbiayakantor_nama: z.string().nullable().optional(),
  statusaktif: z.number().nullable(),
  statusaktif_nama: z.string().nullable().optional()
});

export const marketingSchema = z.object({
  nama: z.string().nonempty({ message: dynamicRequiredMessage('NAMA') }),
  keterangan: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('KETERANGAN') }),
  statusaktif: z
    .number()
    .int({ message: dynamicRequiredMessage('STATUS AKTIF') })
    .min(1, { message: dynamicRequiredMessage('STATUS AKTIF') }),
  statusaktif_nama: z.string().nullable().optional(),
  email: z
    .string({
      required_error: dynamicRequiredMessage('EMAIL')
    })
    .nonempty({ message: dynamicRequiredMessage('EMAIL') })
    .email({ message: 'Email must be a valid email address' }),
  karyawan_id: z
    .number()
    .min(1, { message: dynamicRequiredMessage('KARYAWAN') }),
  karyawan_nama: z.string().nullable().optional(),
  tglmasuk: z
    .string({
      required_error: dynamicRequiredMessage('TGL MASUK'),
      invalid_type_error: dynamicRequiredMessage('TGL MASUK')
    })
    .nonempty({ message: dynamicRequiredMessage('TGL MASUK') }),
  statustarget: z.number().nullable(),
  statustarget_nama: z.string().nullable().optional(),
  statusbagifee: z.number().nullable(),
  statusbagifee_nama: z.string().nullable().optional(),
  statusfeemanager: z.number().nullable(),
  statusfeemanager_nama: z.string().nullable().optional(),
  marketinggroup_id: z.number().nullable(),
  marketinggroup_nama: z.string().nullable().optional(),
  statusprafee: z.number().nullable(),
  statusprafee_nama: z.string().nullable().optional(),
  marketingorderan: z.array(marketingOrderanSchema),
  marketingbiaya: z.array(marketingBiayaSchema),
  marketingmanager: z.array(marketingManagerSchema),
  marketingprosesfee: z.array(marketingProsesFeeSchema)
});

export type MarketingInput = z.infer<typeof marketingSchema>;

export const detailsSchema = z.object({
  id: z.number().optional(),
  nominalawal: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('NOMINAL AWAL') }),
  nominalakhir: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('NOMINAL AKHIR') }),
  persentase: z
    .string()
    .nonempty({ message: dynamicRequiredMessage('PERSENTASE') }),
  statusaktif: z
    .number()
    .int({ message: dynamicRequiredMessage('STATUS AKTIF') })
    .min(1, { message: dynamicRequiredMessage('STATUS AKTIF') }),
  statusaktif_nama: z.string().nullable().optional()
});

export const marketingdetailSchema = z.object({
  marketing_id: z.number().nullable(),
  marketing_nama: z.string().nullable().optional(),
  marketingprosesfee_id: z.number().nullable(),
  jenisprosesfee_nama: z.string().nullable().optional(),
  statuspotongbiayakantor_nama: z.string().nullable().optional(),
  statusaktif_nama: z.string().nullable().optional(),
  marketingdetail: z.array(detailsSchema)
});

export type MarketingDetailInput = z.infer<typeof marketingdetailSchema>;
