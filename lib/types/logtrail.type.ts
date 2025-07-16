import { IMeta } from './error.type';

export interface ILogtrail {
  id: string;
  namatabel: string;
  postingdari: string;
  idtrans: string;
  nobuktitrans: string;
  aksi: string;
  modifiedby: string;
  created_at: string; // Tanggal dalam format ISO string
  updated_at: string; // Tanggal dalam format ISO string
}
export interface IAllLogtrail {
  data: ILogtrail[];
  pagination: IMeta;
}
