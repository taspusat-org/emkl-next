import { IMeta } from './error.type';

export interface IAcos {
  [key: string]: any;
  id: number;
  class: string;
  method: string;
  nama: string;
}
export interface IAllAcos {
  data: IAcos[];
  type: string;
  pagination: IMeta;
}
