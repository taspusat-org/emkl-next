import { IMeta } from './error.type';

export interface IRelasi {
  id: number; // Primary key
  statusrelasi?: number; // Group status relasi
  nama?: string; // Name (nvarchar(max))
  coagiro?: string; // Coagiro (from COA table akunpusat)
  coapiutang?: string; // Coapiutang (from COA table akunpusat)
  coahutang?: string; // Coahutang (from COA table akunpusat)
  statustitip?: number; // Group status nilai
  titipcabang_id?: number; // Titipcabang_id (from cabang table)
  alamat?: string; // Alamat (nvarchar(max))
  npwp?: string; // NPWP (nvarchar(30))
  namapajak?: string; // Namapajak (nvarchar(max))
  alamatpajak?: string; // Alamatpajak (nvarchar(max))
  statusaktif?: number; // Group status aktif
  info?: string; // Info (nvarchar(max))
  modifiedby?: string; // Modified by (varchar(200))
  editing_by?: string; // Editing by (varchar(200))
  editing_at?: Date; // Editing at (datetime)
  created_at: Date; // Created at (datetime)
  updated_at: Date; // Updated at (datetime)
}
export interface IAllRelasi {
  type: string;
  data: IRelasi[];
  pagination: IMeta;
}
