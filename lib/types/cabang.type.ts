import { IMeta } from './error.type';
export interface IAllCabang {
  data: ICabang[];
  type: string;
  pagination: IMeta;
}
export interface ICabang {
  id: number;
  kodecabang: string;
  nama: string;
  keterangan: string;
  statusaktif: number;
  text: string;
  cabang_id: number;
  namacabang_hr: string;
  modifiedby: string;
  created_at: string; // Tanggal dalam format ISO string
  updated_at: string; // Tanggal dalam format ISO string
}
