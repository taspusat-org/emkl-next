import { IMeta } from './error.type';

export interface IAkuntansi {
  id: number;
  nama: string;
  keterangan: string;
  text: string;
  statusaktif: number;
  order: number;
  created_at: string;
  updated_at: string;
}
export interface IAllAkuntansi {
  data: IAkuntansi[];
  type: string;
  pagination: IMeta;
}
