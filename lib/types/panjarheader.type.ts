import { IMeta } from './error.type';

export interface PanjarHeader {
  id: number;
  nobukti: string;
  tglbukti: string;
  jenisorder_id: number;
  jenisorder_nama: string;
  biayaemkl_id: number;
  biayaemkl_nama: string;
  keterangan: string;
  modifiedby: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PanjarMuatanDetail {
  id: number | string;
  nobukti: string;
  biayaextra_id: number;
  orderanmuatan_id: number;
  orderanmuatan_nobukti: string;
  estimasi: string;
  nominal: string;
  keterangan: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface PanjarBongkaranDetail {
  id: number | string;
  nobukti: string;
  keterangan: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface IAllPanjarHeader {
  data: PanjarHeader[];
  type: string;
  pagination: IMeta;
}

export interface IAllPanjarMuatanDetail {
  data: PanjarMuatanDetail[];
  type: string;
  pagination: IMeta;
}

export interface IAllPanjarBongkaranDetail {
  data: PanjarBongkaranDetail[];
  type: string;
  pagination: IMeta;
}

export const filterPanjarHeader = {
  nobukti: '',
  tglbukti: '',
  jenisorder_text: '',
  biayaemkl_text: '',
  keterangan: '',
  modifiedby: '',
  created_at: '',
  updated_at: '',
  tglDari: '',
  tglSampai: '',
  jenisOrderan: ''
};

export const filterPanjarMuatanDetail = {
  nobukti: '',
  orderanmuatan_nobukti: '',
  estimasi: '',
  nominal: '',
  keterangan: ''
};

export const filterPanjarBongkaranDetail = {
  nobukti: '',
  keterangan: ''
};
