import { IMeta } from './error.type';

export interface IOffdays {
  id: number;
  tgl: string;
  keterangan: string;
  statusaktif: number;
  modifiedby: number;
  created_at: string;
  updated_at: string;
}
export interface IAllOffdays {
  data: IOffdays[];
  pagination: IMeta;
}
