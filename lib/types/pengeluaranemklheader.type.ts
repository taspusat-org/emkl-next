import { IMeta } from './error.type';
export interface PengeluaranEmklHeader {
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
  nowarkat: string | null;
  pengeluaran_nobukti: string | null;
  hutang_nobukti: string | null;
  statusformat: number | null;
  info: string | null;
  modifiedby: string | null;
  created_at: string;
  updated_at: string;
  link: string | null;
}

export interface PengeluaranEmklDetail {
  id: number | string;
  pengeluaranemkl_id: string;
  nobukti: string;
  keterangan: string | null;
  nominal: string | null;
  pengeluaranemkl_nobukti: string | null;
  info: string | null;
  modifiedby: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: string | number | boolean | null | undefined;
}
export interface IAllPengeluaranEmklHeader {
  data: PengeluaranEmklHeader[];
  pagination: IMeta;
}
export interface IAllPengeluaranEmklDetail {
  data: PengeluaranEmklDetail[];
  pagination: IMeta;
}
export const filterPengeluaranEmklHeader = {
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
  pengeluaran_nobukti: '',
  hutang_nobukti: '',
  statusformat: null,
  info: '',
  modifiedby: '',
  created_at: '',
  updated_at: '',
  tglDari: '',
  tglSampai: ''
};
export const filterPengeluaranEmklDetail = {
  nobukti: '',
  keterangan: '',
  nominal: '',
  pengeluaranemkl_nobukti: '',
  info: '',
  modifiedby: '',
  created_at: '',
  updated_at: ''
};
