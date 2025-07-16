import { IMeta } from './error.type';

export interface IDetailCuti {
  id: number;
  tglcuti: string;
  modifiedby: string;
  created_at: string;
  updated_at: string;
}
export interface ICutiApproval {
  id: number;
  statusapproval: number;
  karyawan_id: number;
  jenjangapproval: number;
  namakaryawan: string;
  tglapproval: string;
  modifiedby: string;
  created_at: string;
  updated_at: string;
}

export interface ICuti {
  id: number;
  tglpengajuan: string | null;
  karyawan_id: number;
  namaalias: string;
  namakaryawan: string;
  fotokaryawan?: string;
  tglcuti: string;
  statuscuti: string | null;
  statuscuti_text: string | null;
  statuscuti_memo: string | null;
  statuscutibatal: string | null;
  statuscutibatal_memo: string | null;
  nohp: string | null;
  alasanpenolakan: string | null;
  alasancuti: string;
  jumlahcuti: number | null;
  kategoricuti_id: number | null;
  kategoricuti_memo: string | null;
  statusnonhitung: string | null;
  statusnonhitung_nama: string | null;
  lampiran: string[];
  statusapprovalatasan: string | null;
  tglapprovalatasan: string | null;
  userapprovalatasan: string | null;
  statusapprovalhrd: string | null;
  tglapprovalhrd: string | null;
  userapprovalhrd: string | null;
  info: string | null;
  modifiedby: string | null;
  created_at: string;
  updated_at: string;
  detail: IDetailCuti[];
}

export interface IAllCuti {
  data: ICuti[];
  pagination: IMeta;
}
