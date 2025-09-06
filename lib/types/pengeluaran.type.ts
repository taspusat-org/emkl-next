import { IMeta } from './error.type';

export interface PengeluaranHeader {
  id: number;
  nobukti: string;
  tglbukti: string;
  relasi_id: number;
  relasi_text: string;
  keterangan: string;
  bank_id: number | null;
  bank_text: string;
  postingdari: string;
  coakredit: string;
  coakredit_text: string;
  dibayarke: string;
  alatbayar_id: number;
  alatbayar_text: string;
  nowarkat: string;
  tgljatuhtempo: string;
  daftarbank_id: number;
  daftarbank_text: string;
  statusformat: string;
  info: string | null;
  modifiedby: string | null;
  created_at: string;
  updated_at: string;
}
export interface PengeluaranDetail {
  id: number | string;
  pengeluaran_id: number;
  coadebet: string;
  nobukti: string;
  keterangan: string;
  nominal: string;
  dpp: string;
  transaksibiaya_nobukti: string;
  transaksilain_nobukti: string;
  noinvoiceemkl: string;
  tglinvoiceemkl: string;
  nofakturpajakemkl: string;
  perioderefund: string;
  pengeluaranheader_nobukti: string;
  penerimaanheader_nobukti: string;
  info: string | null;
  modifiedby: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: string | number | boolean | null | undefined;
}
export interface IAllPengeluaranHeader {
  data: PengeluaranHeader[];
  type: string;
  pagination: IMeta;
}
export interface IAllPengeluaranDetail {
  data: PengeluaranDetail[];
  type: string;
  pagination: IMeta;
}
export const filterPengeluaran = {
  nobukti: '',
  tglbukti: '',
  relasi_id: null,
  relasi_text: '',
  keterangan: '',
  bank_id: null as number | string | null,
  bank_text: '',
  postingdari: '',
  coakredit: null,
  coakredit_text: '',
  dibayarke: '',
  alatbayar_id: null,
  alatbayar_text: '',
  nowarkat: '',
  tgljatuhtempo: '',
  daftarbank_id: null,
  daftarbank_text: '',
  statusformat: '',
  tglDari: '',
  tglSampai: '',
  created_at: '',
  updated_at: ''
};
