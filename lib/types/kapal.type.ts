import { IMeta } from './error.type';
export interface IAllKapal {
  data: IKapal[];
  type: string;
  pagination: IMeta;
}
export interface IKapal {
  text: string | undefined;
  id: number;
  nama: string;
  keterangan: string;
  pelayaran: string;
  pelayaran_id: number;
  statusaktif: number;
  modifiedby: string;
  created_at: string; // Tanggal dalam format ISO string
  updated_at: string; // Tanggal dalam format ISO string
}
