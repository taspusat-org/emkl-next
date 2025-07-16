import { IMeta } from './error.type';
export interface IAllJenisCatatan {
  data: IJenisCatatan[];
  pagination: IMeta;
}
export interface IJenisCatatan {
  id: number;
  nama: string;
  keterangan: string;
  statusaktif: number;
  text: string;
  modifiedby: string;
  created_at: string; // Tanggal dalam format ISO string
  updated_at: string; // Tanggal dalam format ISO string
}
