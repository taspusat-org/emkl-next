import { IMeta } from './error.type';
export interface IJenisMuatan {
  id: number;
  nama: string;
  keterangan: string;
  statusaktif: number;
  statusaktif_text: string;
  created_at: string;
  updated_at: string;
}

export interface IAllJenisMuatan {
  data: IJenisMuatan[];
  pagination: IMeta;
}
