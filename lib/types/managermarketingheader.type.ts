import { IMeta } from './error.type';

export interface ManagerMarketingHeader {
  id: number;
  nama: string;
  keterangan: string;
  minimalprofit: string;
  statusmentor: number | null;
  statusmentor_text: string;
  statusleader: number | null;
  statusleader_text: string;
  statusaktif: number | null;
  text: string;
  info: string | null;
  modifiedby: string | null;
  created_at: string;
  updated_at: string;
}
export interface ManagerMarketingDetail {
  id: number | string;
  managermarketing_id: number | null;
  nominalawal: string;
  nominalakhir: string;
  persentase: string;
  statusaktif: string | null;
  text: string;
  info: string | null;
  modifiedby: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: string | number | boolean | null | undefined;
}
export interface IAllManagerMarketingHeader {
  data: ManagerMarketingHeader[];
  type: string;
  pagination: IMeta;
}
export interface IAllManagerMarketingDetail {
  data: ManagerMarketingDetail[];
  type: string;
  pagination: IMeta;
}
export const filterManagerMarketing = {
  nama: '',
  keterangan: '',
  minimalprofit: '',
  statusmentor: null,
  statusmentor_text: '',
  statusleader: null,
  statusleader_text: '',
  statusaktif: null,
  text: '',
  created_at: '',
  updated_at: ''
};
