import { IMeta } from './error.type';

export interface IAlatBayar {
  id: number; // Primary key
  nama: string; // Nama (nvarchar(max))
  keterangan: string; // Keterangan (nvarchar(max))

  statuslangsungcair?: number; // Status Langsung Cair (int)
  statuslangsungcair_text?: string;

  statusdefault?: number; // Status Default (int)
  statusdefault_text?: string; // Status Default (int)

  statusbank?: number; // Status Bank (int)
  statusbank_text?: string; // Status Bank (int)

  statusaktif?: number; // Status Aktif (int)
  text?: string; // Status Aktif (int)

  info?: string; // Info (nvarchar(max))
  modifiedby?: string; // Modified by (varchar(200))
  editing_by?: string; // Editing by (varchar(200))
  editing_at?: string; // Editing at (datetime)
  created_at: string; // Created at (datetime)
  updated_at: string; // Updated at (datetime)
}
export interface IAllAlatBayar {
  data: IAlatBayar[];
  type: string;
  pagination: IMeta;
}
