import { IMeta } from './error.type';

export interface HutangHeader {
  id: number;
  nobukti: string;
  tglbukti: string;
  tgljatuhtempo: string;
  keterangan: string;
  relasi_id: number;
  relasi_text: string;
  info: string | null;
  modifiedby: string | null;
  created_at: string;
  updated_at: string;
}
export interface HutangDetail {
  id: number | string;
  hutang_id: number;
  nobukti: string;
  coa: string;
  coa_text: string;
  keterangan: string;
  nominal: string;
  dpp: string;
  noinvoiceemkl: string;
  tglinvoiceemkl: string;
  nofakturpajakemkl: string;
  info: string | null;
  modifiedby: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: string | number | boolean | null | undefined;
}
export interface IAllHutangHeader {
  data: HutangHeader[];
  type: string;
  pagination: IMeta;
}
export interface IAllHutangDetail {
  data: HutangDetail[];
  type: string;
  pagination: IMeta;
}
export const filterHutang = {
  nobukti: '',
  tglbukti: '',
  tgljatuhtempo: '',
  keterangan: '',
  relasi_id: null,
  relasi_text: '',
  coa: '',
  coa_text: '',
  tglDari: '',
  tglSampai: '',
  created_at: '',
  updated_at: ''
};
