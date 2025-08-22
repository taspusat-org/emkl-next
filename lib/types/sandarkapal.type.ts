import { IMeta } from './error.type';

export interface ISandarKapal {
  id: number;
  nama:  string;
  keterangan: string;
  statusaktif: number;
  statusaktif_text: string | null;
  modifiedby: string;
  created_at: string;
  updated_at: string;
  
}

export interface IAllSandarKapal {
  data: ISandarKapal[];
  pagination: IMeta;
}

export interface IErrorResponse {
  message: string;
  errors: Record<string, string[]>;
}
