import { IMeta } from './error.type';

export interface IComodity {
  id: number;

  keterangan: string;
  rate: string;

  statusaktif: number;
  text: string;

  created_at: string;
  updated_at: string;
}
export interface IAllComodity {
  data: IComodity[];
  type: string;
  pagination: IMeta;
}
