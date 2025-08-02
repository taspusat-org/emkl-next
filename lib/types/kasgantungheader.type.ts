import { IMeta } from './error.type';

export interface KasGantungHeader {
  id: number;
  nobukti: string;
  tglbukti: string | null; // Nullable date field
  keterangan: string | null;
  bank_id: number | null;
  pengeluaran_nobukti: string | null;
  coakaskeluar: string | null;
  nominal: string | null;
  dibayarke: string | null;
  sisa: string | null;
  nowarkat: string | null;
  tgljatuhtempo: string | null; // Nullable date field
  gantungorderan_nobukti: string | null;
  info: string | null;
  modifiedby: string | null;
  editing_by: string | null;
  editing_at: string | null; // Nullable datetime field
  created_at: string;
  updated_at: string;
}
export interface IAllKasGantungHeader {
  data: KasGantungHeader[];
  pagination: IMeta;
}
