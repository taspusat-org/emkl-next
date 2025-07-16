import { IMeta } from './error.type';

export interface IErrorResponse {
  message: string;
  errors: Record<string, string[]>;
}

export interface IAllCcEmail {
  data: ICcemail[];
  pagination: IMeta;
}
export interface ICcemail {
  id: number;
  nama: string;
  email: string;
  statusaktif: number;
  // info: string;
  modifiedby: string;
  created_at: string;
  updated_at: string;
}
