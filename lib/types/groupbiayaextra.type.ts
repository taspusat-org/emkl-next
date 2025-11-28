import { IMeta } from './error.type';

export interface IGroupbiayaextra {
  id: number;

  keterangan: string;
  rate: string;

  statusaktif: number;
  text: string;

  created_at: string;
  updated_at: string;
}
export interface IAllGroupbiayaextra {
  data: IGroupbiayaextra[];
  type: string;
  pagination: IMeta;
}
