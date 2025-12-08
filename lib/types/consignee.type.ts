import { IMeta } from './error.type';

export interface IConsignee {
  id: number;
  shipper_id: number;
  shipper_nama: string;
  namaconsignee: string;
  tujuankapal_id: number;
  tujuankapal_nama: string;
  modifiedby: string;
  created_at: string;
  updated_at: string;
}
export interface IConsigneeDetail {
  id: number;
  consignee_id: number;
  keterangan: string;
  modifiedby: string;
  created_at: string;
  updated_at: string;
}
export interface IConsigneeBiaya {
  id: number;
  consignee_id: number;
  biayaemkl_id: number;
  link_id: number;
  emkl_id: number;
  nominalasuransi: string;
  nominal: string;
  biayaemkl_nama: string;
  container_nama: string;
  emkl_nama: string;
  modifiedby: string;
  created_at: string;
  updated_at: string;
}
export interface IConsigneeHargaJual {
  id: number;
  consignee_id: number;
  container_id: number;
  nominal: string;
  container_nama: string;
  modifiedby: string;
  created_at: string;
  updated_at: string;
}
export interface IAllConsignee {
  data: IConsignee[];
  type: string;
  pagination: IMeta;
}
export interface IAllConsigneeDetail {
  data: IConsigneeDetail[];
  type: string;
  pagination: IMeta;
}
export interface IAllConsigneeBiaya {
  data: IConsigneeBiaya[];
  type: string;
  pagination: IMeta;
}
export interface IAllConsigneeHargaJual {
  data: IConsigneeHargaJual[];
  type: string;
  pagination: IMeta;
}

export const filterConsignee = {
  shipper_id: '',
  shipper_nama: '',
  namaconsignee: '',
  tujuankapal_id: '',
  tujuankapal_nama: '',

  modifiedby: '',
  created_at: '',
  updated_at: ''
};
export const filterConsigneeDetail = {
  consignee_id: '',
  keterangan: '',
  modifiedby: '',
  created_at: '',
  updated_at: ''
};
export const filterConsigneeBiaya = {
  consignee_id: '',
  biayaemkl_id: '',
  link_id: '',
  emkl_id: '',
  nominalasuransi: '',
  nominal: '',
  biayaemkl_nama: '',
  container_nama: '',
  emkl_nama: '',
  modifiedby: '',
  created_at: '',
  updated_at: ''
};
export const filterConsigneeHargaJual = {
  consignee_id: '',
  container_id: '',
  nominal: '',
  container_nama: '',
  modifiedby: '',
  created_at: '',
  updated_at: ''
};
