import { IMeta } from './error.type';

export interface IAllShift {
  data: IShift[];
  pagination: IMeta;
}
export interface IAllShiftDetail {
  data: IShiftDetail[];
  pagination: IMeta;
}
export interface IShift {
  id: number;
  nama: string;
  statusaktif_text: string;
  modifiedby: string;
  keterangan: string;
  statusaktif: number;
  created_at: string; // Tanggal dalam format ISO string
  updated_at: string; // Tanggal dalam format ISO string
}
export interface IShiftDetail {
  id: number;
  date_nama: string;
  jammasuk: string;
  jampulang: string;
  batas_jammasuk: string;
  statusaktif: number;
  statusaktif_text: string;
  date_id: number;
  created_at: string; // Tanggal dalam format ISO string
  updated_at: string; // Tanggal dalam format ISO string
}
