import { IMeta } from './error.type';

export interface BiayaExtraHeader {
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

export interface BiayaExtraMuatanDetail {
  id: number | string;
  nobukti: string;
  biayaextra_id: number;
  orderanmuatan_id: number;
  orderanmuatan_nobukti: string;
  estimasi: string;
  nominal: string;
  statustagih: number;
  statustagih_nama: string;
  nominaltagih: string;
  keterangan: string;
  groupbiayaextra_id: number;
  groupbiayaextra_nama: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface BiayaExtraBongkaranDetail {
  id: number | string;
  nobukti: string;
  keterangan: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface IAllBiayaExtraHeader {
  data: BiayaExtraHeader[];
  type: string;
  pagination: IMeta;
}

export interface IAllBiayaExtraMuatanDetail {
  data: BiayaExtraMuatanDetail[];
  type: string;
  pagination: IMeta;
}

export interface IAllBiayaExtraBongkaranDetail {
  data: BiayaExtraBongkaranDetail[];
  type: string;
  pagination: IMeta;
}

export const filterBiayaExtraHeader = {
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

export const filterBiayaExtraMuatanDetail = {
  nobukti: '',
  orderanmuatan_nobukti: '',
  estimasi: '',
  nominal: '',
  statustagih_text: '',
  nominaltagih: '',
  keterangan: '',
  groupbiayaextra_text: ''
};

export const filterBiayaExtraBongkaranDetail = {
  nobukti: '',
  keterangan: ''
};
