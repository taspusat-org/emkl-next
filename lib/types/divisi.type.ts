import { IMeta } from './error.type';

export interface IDivisi {
  id: number;
  nama: string;
  keterangan: string;
  text: string;
  statusaktif: number;
  created_at: string;
  updated_at: string;
}
export interface IAllDivisi {
  data: IDivisi[];
  type: string;
  pagination: IMeta;
}
