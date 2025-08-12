import { IMeta } from './error.type';

export interface ITujuanKapal {
  id: number;
  nama: string;
  keterangan: string;
  namacabang: string;
  cabang_id: number;
  text: string;
  statusaktif: number;
  order: number;
  created_at: string;
  updated_at: string;
}
export interface IAllTujuanKapal {
  data: ITujuanKapal[];
  type: string;
  pagination: IMeta;
}
