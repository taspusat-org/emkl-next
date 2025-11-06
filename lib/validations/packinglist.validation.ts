import { z } from 'zod';

export const packinglistDetailRincianSchema = z.object({
  id: z.coerce.number().optional(),
  statuspackinglist_id: z.string().nullable().optional(),
  banyak: z.string().nullable().optional(),
  berat: z.string().nullable().optional(),
  keterangan: z.string().nullable()
});

export type PackingListDetailRincianInput = z.infer<
  typeof packinglistDetailRincianSchema
>;

export const packinglistDetailSchema = z.object({
  id: z.coerce.number().optional(),
  orderanmuatan_nobukti: z.string().nullable().optional(),
  bongkarke: z.string().nullable().optional(),
  rincian: z.array(packinglistDetailRincianSchema).default([])
});

export type PackingListDetailInput = z.infer<typeof packinglistDetailSchema>;

export const packinglistHeaderSchema = z.object({
  nobukti: z.string().nullable().optional(),
  tglbukti: z.string().nullable().optional(),
  schedule_id: z.string().nullable().optional(),
  tujuan_nama: z.string().nullable().optional(),
  kapal_nama: z.string().nullable().optional(),
  voyberangkat: z.string().nullable().optional(),
  tglberangkat: z.string().nullable().optional(),
  details: z.array(packinglistDetailSchema).min(1)
});

export type PackingListHeaderInput = z.infer<typeof packinglistHeaderSchema>;
