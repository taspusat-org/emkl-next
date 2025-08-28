import { IMeta } from './error.type';

export interface IJabatan {
  id: number;
  nama: string;
  keterangan: string;
  text: string;
  statusaktif: number;
  divisi: string;
  divisi_id: number;
  created_at: string;
  updated_at: string;
}
export interface IAllJabatan {
  data: IJabatan[];
  type: string;
  pagination: IMeta;
}
