import { IMeta } from './error.type';

export interface MarketingHeader {
  id: number;
  nama: string;
  keterangan: string | null;
  statusaktif: number | null;
  statusaktif_nama: string | null;
  email: string | null;
  karyawan_id: number | null;
  karyawan_nama: string | null;
  tglmasuk: string | null;
  cabang_id: number | null;
  cabang_nama: string | null;
  statustarget: number | null;
  statustarget_nama: string | null;
  statusbagifee: number | null;
  statusbagifee_nama: string | null;
  statusfeemanager: number | null;
  statusfeemanager_nama: string | null;
  marketingmanager_id: number | null;
  marketingmanager_nama: string | null;
  marketinggroup_id: number | null;
  marketinggroup_nama: string | null;
  statusprafee: number | null;
  statusprafee_nama: string | null;
  info: string | null;
  modifiedby: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarketingOrderan {
  id: number | string;
  marketing_id: number | null;
  marketing_nama: string;
  nama: string;
  keterangan: string;
  singkatan: string;
  statusaktif: number | null;
  statusaktifOrderan_nama: string | null;
  [key: string]: string | number | boolean | null | undefined;
}

export interface MarketingBiaya {
  id: number | string;
  marketing_id: number;
  marketing_nama: string;
  jenisbiayamarketing_id: number;
  jenisbiayamarketing_nama: string | null;
  nominal: string | null;
  statusaktif: number | null;
  statusaktifBiaya_nama: string | null;
  [key: string]: string | number | boolean | null | undefined;
}

export interface MarketingManager {
  id: number | string;
  marketing_id: number;
  marketing_nama: string;
  managermarketing_id: number;
  managermarketing_nama: string;
  tglapproval: string;
  statusapproval: number;
  statusapproval_nama: string;
  userapproval: string;
  statusaktif: number | null;
  statusaktifManager_nama: string | null;
  [key: string]: string | number | boolean | null | undefined;
}

export interface MarketingProsesFee {
  id: number | string | null;
  marketing_id: number;
  marketing_nama: string;
  jenisprosesfee_id: number | null;
  jenisprosesfee_nama: string | null;
  statuspotongbiayakantor: number | null;
  statuspotongbiayakantor_nama: string | null;
  statusaktif: number | null;
  statusaktif_nama: string | null;
  [key: string]: string | number | boolean | null | undefined;
}

export interface MarketingDetail {
  id: number | string;
  marketing_id: number;
  marketing_nama: string | null;
  marketingprosesfee_id: number | null;
  nominalawal: string;
  nominalakhir: string | null;
  persentase: string | null;
  statusaktif: number | null;
  statusaktif_nama: string | null;
  [key: string]: string | number | boolean | null | undefined;
}

export interface IAllMarketingHeader {
  data: MarketingHeader[];
  pagination: IMeta;
}

export interface IAllMarketingOrderan {
  data: MarketingOrderan[];
  pagination: IMeta;
}

export interface IAllMarketingBiaya {
  data: MarketingBiaya[];
  pagination: IMeta;
}

export interface IAllMarketingManager {
  data: MarketingManager[];
  pagination: IMeta;
}

export interface IAllMarketingProsesfee {
  data: MarketingProsesFee[];
  pagination: IMeta;
}

export interface IAllMarketingDetail {
  data: MarketingDetail[];
  pagination: IMeta;
}

export const filterMarketing = {
  nama: '',
  keterangan: '',
  // statusaktif: number | null;
  statusaktif_nama: '',
  email: '',
  karyawan_nama: '',
  tglmasuk: '',
  cabang_nama: '',
  statustarget_nama: '',
  statusbagifee_nama: '',
  statusfeemanager_nama: '',
  marketingmanager_nama: '',
  marketinggroup_nama: '',
  statusprafee_nama: '',
  modifiedby: '',
  created_at: '',
  updated_at: ''
};

export const filterMarketingOrderan = {
  marketing_nama: '',
  nama: '',
  keterangan: '',
  singkatan: '',
  statusaktif_nama: ''
};

export const filterMarketingBiaya = {
  marketing_nama: '',
  jenisbiayamarketing_nama: '',
  nominal: '',
  statusaktif_nama: ''
};

export const filterMarketingManager = {
  marketing_nama: '',
  managermarketing_nama: '',
  tglapproval: '',
  statusapproval_nama: '',
  userapproval: '',
  statusaktif_nama: ''
};

export const filterMarketingProsesFee = {
  marketing_nama: '',
  jenisprosesfee_nama: '',
  statuspotongbiayakantor_nama: '',
  statusaktif_nama: ''
};

export const filterMarketingDetail = {
  marketing_nama: '',
  // marketingprosesfee_nama: '',
  nominalawal: '',
  nominalakhir: '',
  persentase: '',
  statusaktif_nama: ''
};
