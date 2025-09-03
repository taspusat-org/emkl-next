import { REQUIRED_FIELD } from '@/constants/validation';
import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

// Skema menu, menambahkan pengecekan mode
export const menuSchema = (mode: 'add' | 'edit' | 'delete') => {
  const schema = z.object({
    title: z.string().nonempty({ message: dynamicRequiredMessage('JUDUL') }),
    aco_id: z.number().nullable().optional(),
    icon: z.string().nullable(),
    isActive: z.number().default(1),
    parentId: z.number().nullable().optional(),
    order: z.number().nullable().optional(),
    statusaktif: z.number().min(1, `${REQUIRED_FIELD}`),
    statusaktif_nama: z.string().nullable().optional(),
    parent_nama: z.string().nullable().optional(),
    acos_nama: z.string().nullable().optional()
  });
  // Jika mode adalah delete, lewati validasi sama sekali
  console.log(mode, 'mode');
  if (mode === 'delete') {
    return schema.partial(); // Menggunakan deepPartial untuk membebaskan semua field
  }

  return schema;
};
export type MenuInput = z.infer<ReturnType<typeof menuSchema>>;
