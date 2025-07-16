import { z } from 'zod';

export const parameterSchema = z.object({
  grp: z.string().max(255, 'Maksimal 255 karakter').nullable().optional(),
  subgrp: z.string().max(255, 'Maksimal 255 karakter').nullable().optional(),
  kelompok: z.string().max(255, 'Maksimal 255 karakter').nullable().optional(),
  text: z.string().max(255, 'Maksimal 255 karakter').nullable().optional(),
  memo: z.record(z.string()).nullable().optional(),
  type: z.number().max(100, 'Maksimal 100').nullable().optional(),
  default: z.string().max(255, 'Maksimal 255 karakter').nullable().optional(),
  statusaktif_text: z.string().nullable().optional(),
  info: z.string().nullable().optional()
});
export type ParameterInput = z.infer<typeof parameterSchema>;
