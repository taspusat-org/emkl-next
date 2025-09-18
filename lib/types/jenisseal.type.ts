import { IMeta } from './error.type';

export interface IJenisseal {
  id: number;
  nama: string;
  keterangan: string;
  text: string;
  statusaktif: number;
  order: number;
  created_at: string;
  updated_at: string;
}
export interface IAllJenisseal {
  data: IJenisseal[];
  type: string;
  pagination: IMeta;
}
