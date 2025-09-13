import { IMeta } from './error.type';
export interface PenerimaanHeader {
  id: number;
  nobukti: string;
  tglbukti: string;
  relasi_id: number | null;
  relasi_nama: string | null;
  keterangan: string | null;
  bank_id: number | null;
  bank_nama: string | null;
  postingdari: string | null;
  coakasmasuk: string | null;
  coakasmasuk_nama: string | null;
  diterimadari: string | null;
  alatbayar_id: number | null;
  alatbayar_nama: string | null;
  nowarkat: string | null;
  tgllunas: string | null;
  noresi: string | null;
  statusformat: number | null;
  info: string | null;
  modifiedby: string | null;
  created_at: string;
  updated_at: string;
  link: string | null;
}

export interface PenerimaanDetail {
  id: number | string;
  penerimaan_id: string;
  nobukti: string;
  coa: string;
  coa_nama: string | null;
  keterangan: string | null;
  nominal: string | null;
  transaksibiaya_nobukti: string | null;
  transaksilain_nobukti: string | null;
  pengeluaranemklheader_nobukti: string | null;
  penerimaanemklheader_nobukti: string | null;
  pengembaliankasgantung_nobukti: string | null;
  info: string | null;
  modifiedby: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: string | number | boolean | null | undefined;
}
export interface IAllPenerimaanHeader {
  data: PenerimaanHeader[];
  pagination: IMeta;
}
export interface IAllPenerimaanDetail {
  data: PenerimaanDetail[];
  pagination: IMeta;
}
export const filterPenerimaan = {
  nobukti: '',
  tglbukti: '',
  relasi_id: null,
  relasi_nama: '',
  keterangan: '',
  bank_id: null,
  bank_nama: '',
  postingdari: '',
  coakasmasuk: '',
  coakasmasuk_nama: '',
  diterimadari: '',
  alatbayar_id: null,
  alatbayar_nama: '',
  nowarkat: '',
  tgllunas: '',
  noresi: '',
  statusformat: null,
  info: '',
  modifiedby: '',
  created_at: '',
  updated_at: '',
  tglDari: '',
  tglSampai: ''
};
export const filterPenerimaanDetail = {
  nobukti: '',
  keterangan: '',
  coa: '',
  coa_nama: '',
  nominal: '',
  transaksibiaya_nobukti: '',
  transaksilain_nobukti: '',
  pengeluaranemklheader_nobukti: '',
  penerimaanemklheader_nobukti: '',
  pengembaliankasgantung_nobukti: '',
  info: '',
  modifiedby: '',
  created_at: '',
  updated_at: ''
};
