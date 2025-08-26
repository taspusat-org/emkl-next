import { IMeta } from './error.type';

export interface IAsalKapal {
  id: number;
  nominal:  number | null ;
  keterangan: string;
  text: string;
  statusaktif: number;
  cabang: string;
  cabang_id: number;
  container: string;
  container_id: number;
  created_at: string;
  updated_at: string;
}
export interface IAllAsalKapal {
  data: IAsalKapal[];
  type: string;
  pagination: IMeta;
}
