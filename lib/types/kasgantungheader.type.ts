import { IMeta } from './error.type';

export interface KasGantungHeader {
  id: number;
  nobukti: string;
  tglbukti: string | null; // Nullable date field
  keterangan: string | null;
  bank_id: number | null;
  relasi_id: number | null;
  alatbayar_id: number | null;
  pengeluaran_nobukti: string | null;
  relasi_nama: string | null;
  alatbayar_nama: string | null;
  bank_nama: string | null;
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
export interface KasGantungDetail {
  id: number | string;
  kasgantung_id: string;
  nobukti: string;
  keterangan: string | null;
  nominal: string | null;
  info: string | null;
  modifiedby: string | null;
  editing_by: string | null;
  editing_at: string | null; // Nullable datetime field
  created_at: string;
  updated_at: string;
  pengeluarandetail_id: number;
  [key: string]: string | number | boolean | null | undefined;
}
export interface IAllKasGantungHeader {
  data: KasGantungHeader[];
  pagination: IMeta;
}
export interface IAllKasGantungDetail {
  data: KasGantungDetail[];
  pagination: IMeta;
}
export const filterKasGantung = {
  nobukti: '',
  tglbukti: '',
  bank_nama: '',
  relasi_nama: '',
  alatbayar_nama: '',
  keterangan: null,
  bank_id: null,
  pengeluaran_nobukti: '',
  coakaskeluar: '',
  relasi_id: null,
  nominal: '',
  dibayarke: '',
  nowarkat: '',
  tgljatuhtempo: '',
  gantungorderan_nobukti: '',
  modifiedby: null,
  created_at: '',
  updated_at: '',
  tglDari: '',
  tglSampai: ''
};

export const filterkasgantungDetail = {
  nobukti: '',
  keterangan: '',
  nominal: '',
  modifiedby: '',
  created_at: '',
  updated_at: ''
};
