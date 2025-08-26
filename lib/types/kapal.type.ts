import { IMeta } from './error.type';

export interface IKapal {
  id: number;
  nama: string;
  keterangan: string;
  text: string;
  statusaktif: number;
  pelayaran: string;
  pelayaran_id: number;
  created_at: string;
  updated_at: string;
}
export interface IAllKapal {
  data: IKapal[];
  type: string;
  pagination: IMeta;
}
