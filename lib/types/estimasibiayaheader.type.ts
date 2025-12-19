import { IMeta } from './error.type';

export interface EstimasiBiayaHeader {
  id: number;
  nobukti: string;
  tglbukti: string;
  jenisorder_id: number;
  jenisorder_nama: string;
  orderan_id: number;
  orderan_nobukti: string;
  nominal: string;
  shipper_id: number;
  shipper_nama: string;
  statusppn: number;
  statusppn_nama: string;
  asuransi_id: number;
  asuransi_nama: string;
  comodity_id: number;
  comodity_nama: string;
  consignee_id: number;
  consignee_nama: string;
  modifiedby: string | null;
  created_at: string | null;
  updated_at: string | null;
}
export interface IAllEstimasiBiayaHeader {
  data: EstimasiBiayaHeader[];
  type: string;
  pagination: IMeta;
}

export interface EstimasiBiayaDetailBiaya {
  id: number | string;
  nobukti: string;
  estimasibiaya_id: number;
  link_id: number;
  link_nama: string;
  biayaemkl_id: number;
  biayaemkl_nama: string;
  nominal: string;
  nilaiasuransi: string;
  nominaldisc: string;
  nominalsebelumdisc: string;
  nominaltradoluar: string;
  [key: string]: string | number | boolean | null | undefined;
}
export interface IAllEstimasiBiayaDetailBiaya {
  data: EstimasiBiayaDetailBiaya[];
  type: string;
  pagination: IMeta;
}

export interface EstimasiBiayaDetailInvoice {
  id: number | string;
  nobukti: string;
  estimasibiaya_id: number;
  link_id: number;
  link_nama: string;
  biayaemkl_id: number;
  biayaemkl_nama: string;
  nominal: string;
  [key: string]: string | number | boolean | null | undefined;
}
export interface IAllEstimasiBiayaDetailInvoice {
  data: EstimasiBiayaDetailInvoice[];
  type: string;
  pagination: IMeta;
}

export interface IErrorResponse {
  message: string;
  errors: Record<string, string[]>;
  statusCode: number;
}

export const filterEstimasiBiayaHeader = {
  nobukti: '',
  tglbukti: '',
  jenisorder_text: '',
  orderan_nobukti: '',
  nominal: '',
  shipper_text: '',
  statusppn_text: '',
  asuransi_text: '',
  comodity_text: '',
  consignee_text: '',
  modifiedby: '',
  created_at: '',
  updated_at: '',
  tglDari: '',
  tglSampai: ''
};

export const filterEstimasiBiayaDetailBiaya = {
  nobukti: '',
  link_text: '',
  biayaemkl_text: '',
  nominal: '',
  nilaiasuransi: '',
  nominaldisc: '',
  nominalsebelumdisc: '',
  nominaltradoluar: ''
};

export const filterEstimasiBiayaDetailInvoice = {
  nobukti: '',
  link_text: '',
  biayaemkl_text: '',
  nominal: ''
};
