import { IMeta } from './error.type';
export interface PenerimaanEmklHeader {
  id: number;
  nobukti: string;
  tglbukti: string;
  tgljatuhtempo: string;
  keterangan: string | null;
  bank_id: number | null;
  bank_nama: string | null;
  karyawan_id: number | null;
  karyawan_nama: string | null;
  jenisposting: string | null;
  jenisposting_nama: string | null;
  nowarkat: string | null;
  penerimaan_nobukti: string | null;
  pengeluaran_nobukti: string | null;
  hutang_nobukti: string | null;
  statusformat: number | null;
  statusformat_nama: string | null;
  info: string | null;
  modifiedby: string | null;
  created_at: string;
  updated_at: string;
  link: string | null;
}

export interface PenerimaanEmklDetail {
  id: number | string;
  pengeluaranemkl_id: string;
  nobukti: string;
  keterangan: string | null;
  nominal: string | null;
  pengeluaranemkl_nobukti: string | null;
  penerimaanemkl_nobukti: string | null;
  info: string | null;
  modifiedby: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: string | number | boolean | null | undefined;
}
export interface IAllPenerimaanEmklHeader {
  data: PenerimaanEmklHeader[];
  pagination: IMeta;
}
export interface IAllPenerimaanEmklDetail {
  data: PenerimaanEmklDetail[];
  pagination: IMeta;
}
export const filterPenerimaanEmklHeader = {
  nobukti: '',
  tglbukti: '',
  tgljatuhtempo: '',
  keterangan: '',
  bank_id: null,
  bank_nama: '',
  karyawan_id: null,
  karyawan_nama: '',
  jenisposting: '',
  nowarkat: '',
  penerimaan_nobukti: '',
  pengeluaran_nobukti: '',
  jenisposting_nama: '',
  hutang_nobukti: '',
  statusformat: null,
  statusformat_nama: '',
  info: '',
  modifiedby: '',
  created_at: '',
  updated_at: '',
  tglDari: '',
  tglSampai: ''
};
export const filterPenerimaanEmklDetail = {
  nobukti: '',
  keterangan: '',
  nominal: '',
  pengeluaranemkl_nobukti: '',
  penerimaanemkl_nobukti: '',
  info: '',
  modifiedby: '',
  created_at: '',
  updated_at: ''
};
