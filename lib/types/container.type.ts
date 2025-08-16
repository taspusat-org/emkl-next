import { IMeta } from './error.type';

export interface IContainer {
  id: number;
  nama: string;
  keterangan: string;
  text: string;
  statusaktif: number;
  order: number;
  created_at: string;
  updated_at: string;
}
export interface IAllContainer {
  data: IContainer[];
  type: string;
  pagination: IMeta;
}
