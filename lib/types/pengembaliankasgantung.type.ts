import { IMeta } from './error.type';

export interface PengembalianKasGantungHeader {
  id: number;
  nobukti: string;
  tglbukti: string;
  keterangan: string | null;
  bank_nama: string | null;
  bank_id: number | null;
  penerimaan_nobukti: string | null;
  coakasmasuk: string | null;
  coakasmasuk_nama: string | null;
  relasi_nama: string | null;
  relasi_id: number | null;
  info: string | null;
  modifiedby: string | null;
  created_at: string;
  updated_at: string;
  link: string | null;
}

export interface IPengembalianKasGantungDetail {
  id: number;
  nobukti: string;
  kasgantung_id?: string;
  kasgantung_nobukti?: string;
  keterangan: string | null;
  nominal: string | null; // Adjusted to 'string' since money type in the schema could be treated as string in TypeScript
  info: string | null;
  modifiedby: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface IAllPengembalianKasGantung {
  data: PengembalianKasGantungHeader[];
  pagination: IMeta;
}
export interface IAllPengembalianKasGantungDetail {
  data: IPengembalianKasGantungDetail[];
}
export const filterPengembalianKasGantung = {
  nobukti: '',
  tglbukti: '',
  bank_nama: '',
  relasi_nama: '',
  keterangan: null,
  bank_id: null,
  penerimaan_nobukti: '',
  coakasmasuk: '',
  coakasmasuk_nama: '',
  relasi_id: null,
  modifiedby: null,
  created_at: '',
  updated_at: '',
  tglDari: '',
  tglSampai: ''
};
export const filterPengembalianKasGantungDetail = {
  nobukti: '',
  kasgantung_nobukti: '',
  nominal: '',
  keterangan: '',
  modifiedby: '',
  created_at: '',
  updated_at: ''
};
