import { IMeta } from './error.type';

export interface IEmkl {
  id: number; // bigint, not null
  statusrelasi?: number; // bigint, null
  relasi_id?: number; // bigint, null
  nama?: string; // nvarchar(max), null
  contactperson?: string; // nvarchar(200), null
  alamat?: string; // nvarchar(max), null
  coagiro?: string; // nvarchar(100), null
  coapiutang?: string; // nvarchar(100), null
  coahutang?: string; // nvarchar(100), null
  kota?: string; // nvarchar(200), null
  kodepos?: string; // nvarchar(100), null
  notelp?: string; // nvarchar(100), null
  email?: string; // nvarchar(200), null
  fax?: string; // nvarchar(100), null
  alamatweb?: string; // nvarchar(200), null
  top?: number; // money, null
  npwp?: string; // nvarchar(100), null
  namapajak?: string; // nvarchar(max), null
  alamatpajak?: string; // nvarchar(max), null
  statustrado?: number; // bigint, null
  statusaktif?: number; // bigint, null
  info?: string; // nvarchar(max), null
  modifiedby?: string; // nvarchar(200), null
  created_at?: string; // datetime, null (gunakan string untuk ISO date)
  updated_at?: string; // datetime, null
}

export interface IAllEmkl {
  data: IEmkl[];
  type: string;
  pagination: IMeta;
}
