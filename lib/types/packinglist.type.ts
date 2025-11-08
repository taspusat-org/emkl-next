import { IMeta } from './error.type';

export interface PackingListHeader {
  id: number;
  nobukti: string;
  tglbukti: string;
  schedule_id: string;
  tujuankapal_nama: string;
  kapal_nama: string;
  voyberangkat: string;
  tglberangkat: string;
  tgltiba: string;
  tglclosing: string;
  statusberangkatkapal: string;
  statustibakapal: string;
  modifiedby: string;
  created_at: string;
  updated_at: string;
}
export interface PackingListDetail {
  id: number | string;
  packinglist_id: string;
  nobukti: string;
  orderanmuatan_nobukti: string;
  bongkarke: string;
  info: string;
  modifiedby: string;
  created_at: string;
  updated_at: string;
}
export interface PackingListDetailRincian {
  id: number | string;
  packinglistdetail_id: string;
  statuspackinglist_id: string;
  keterangan: string;
  info: string;
  modifiedby: string;
  created_at: string;
  updated_at: string;
}
export interface IAllPackingListHeader {
  data: PackingListHeader[];
  pagination: IMeta;
}
export interface IAllPackingListDetail {
  data: PackingListDetail[];
  pagination: IMeta;
}
export interface IAllPackingListDetailRincian {
  data: PackingListDetailRincian[];
  pagination: IMeta;
}
export const filterPackingList = {
  nobukti: '',
  tglbukti: '',
  schedule_id: '',
  tujuankapal_nama: '',
  kapal_nama: '',
  voyberangkat: '',
  tglberangkat: '',
  tgltiba: '',
  tglclosing: '',
  statusberangkatkapal: '',
  statustibakapal: '',
  tglDari: '',
  tglSampai: '',
  modifiedby: '',
  created_at: '',
  updated_at: ''
};
export const filterPackingListDetail = {
  nobukti: '',
  orderanmuatan_nobukti: '',
  bongkarke: '',
  info: '',
  modifiedby: '',
  created_at: '',
  updated_at: ''
};
export const filterPackingListDetailRincian = {
  nobukti: '',
  statuspackinglist_id: '',
  packinglistdetail_id: '',
  keterangan: '',
  banyak: '',
  berat: '',
  info: '',
  modifiedby: '',
  created_at: '',
  updated_at: ''
};
