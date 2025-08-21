import { IMeta } from './error.type';

export interface IDaftarbl {
  id: number;
  nama: string;
  keterangan: string;
  text: string;
  statusaktif: number;
  order: number;
  created_at: string;
  updated_at: string;
}
export interface IAllDaftarbl {
  data: IDaftarbl[];
  type: string;
  pagination: IMeta;
}
