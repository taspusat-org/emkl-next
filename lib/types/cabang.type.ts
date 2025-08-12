import { IMeta } from './error.type';
export interface IAllCabang {
  data: ICabang[];
  type: string;
  pagination: IMeta;
}
export interface ICabang {
  id: number;
  kodecabang: string;
  namacabang: string;
  keterangan: string;
  statusaktif: number;
  periode: number;
  minuscuti: number;
  modifiedby: string;
  periode_text: string;
  minuscuti_text: string;
  created_at: string; // Tanggal dalam format ISO string
  updated_at: string; // Tanggal dalam format ISO string
}
