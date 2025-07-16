import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const menuSchema = z.object({
  title: z.string().nonempty({ message: dynamicRequiredMessage('JUDUL') }), // Judul wajib diisi
  aco_id: z.number().nullable().optional(), // Foreign key, bisa kosong
  icon: z.string().optional(), // Ikon opsional
  isActive: z.number().default(1), // Status aktif
  parentId: z.number().nullable().optional(), // Parent ID opsional, bisa null
  order: z.number().nullable().optional(), // Urutan opsional, bisa null
  statusaktif: z.number().min(1, `${REQUIRED_FIELD}`), // Email wajib diisi
  statusaktif_nama: z.string().nullable().optional(), // Email wajib diisi
  parent_nama: z.string().nullable().optional(), // Email wajib diisi
  acos_nama: z.string().nullable().optional() // Email wajib diisi
});
export type MenuInput = z.infer<typeof menuSchema>;
