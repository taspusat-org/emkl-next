import { IMeta } from './error.type';
export interface IAllAkuntansi {
  data: IAkuntansi[];
  pagination: IMeta;
}
export interface IAkuntansi {
  id: number;
  nama: string;
  keterangan: string;
  statusaktif: number;
  modifiedby: string;
  periode_text: string;
  minuscuti_text: string;
  created_at: string; // Tanggal dalam format ISO string
  updated_at: string; // Tanggal dalam format ISO string
}
