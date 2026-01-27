import { IMeta } from './error.type';

export interface BiayaHeader {
  id: number;
  nobukti: string;
  tglbukti: string;
  jenisorder_id: number;
  jenisorder_nama: string;
  biayaemkl_id: number;
  biayaemkl_nama: string;
  keterangan: string;
  noinvoice: string;
  relasi_id: number;
  relasi_nama: string;
  dibayarke: string;
  biayaextra_id: number;
  biayaextra_nobukti: string;
  modifiedby: string | null;
  created_at: string | null;
  updated_at: string | null;
}
export interface IAllBiayaHeader {
  data: BiayaHeader[];
  type: string;
  pagination: IMeta;
}

export interface BiayaMuatanDetail {
  id: number | string;
  biaya_id: number;
  nobukti: string;
  orderanmuatan_nobukti: string;
  estimasi: string;
  nominal: string;
  keterangan: string;
  // biayaextra_id: number;
  biayaextra_nobukti: string;
  biayaextra_nobuktijson: string;
  [key: string]: string | number | boolean | null | undefined;
}
export interface IAllBiayaMuatanDetail {
  data: BiayaMuatanDetail[];
  type: string;
  pagination: IMeta;
}

export interface IErrorResponse {
  message: string;
  errors: Record<string, string[]>;
  statusCode: number;
}

export const filterBiayaHeader = {
  nobukti: '',
  tglbukti: '',
  jenisorder_text: '',
  biayaemkl_text: '',
  keterangan: '',
  noinvoice: '',
  relasi_text: '',
  dibayarke: '',
  biayaextra_nobukti: '',
  modifiedby: '',
  created_at: '',
  updated_at: '',
  tglDari: '',
  tglSampai: '',
  jenisOrderan: ''
};

export const filterBiayaMuatanDetail = {
  nobukti: '',
  orderanmuatan_nobukti: '',
  estimasi: '',
  nominal: '',
  keterangan: '',
  biayaextra_nobukti: ''
};
