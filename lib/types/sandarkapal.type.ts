import { IMeta } from './error.type';

export interface ISandarKapal {
  id: number;
  nama: string;
  keterangan: string;
  text: string;
  statusaktif: number;
  order: number;
  created_at: string;
  updated_at: string;
}
export interface IAllSandarKapal {
  data: ISandarKapal[];
  type: string;
  pagination: IMeta;
}
