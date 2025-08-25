import { IMeta } from './error.type';

export interface IAsalKapal {
  id: number;
  nominal:  number | null ;
  keterangan: string;
  statusaktif: number;
  statusaktif_text: string | null;
  cabang_id: number;
  cabang: string | null;
  container_id: number;
  container: string | null;
  modifiedby: string;
  created_at: string;
  updated_at: string;
}

export interface IAllAsalKapal {
  data: IAsalKapal[];
  pagination: IMeta;
}

export interface IErrorResponse {
  message: string;
  errors: Record<string, string[]>;
}
