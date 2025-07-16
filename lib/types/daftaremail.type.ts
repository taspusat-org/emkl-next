import { IMeta } from './error.type';

export interface IDaftarEmail {
  id: number;
  nama: string;
  keterangan: string;
  text: string;
  statusaktif: number;
  karyawan_id: number;
  modifiedby: string;
  lookupKaryawan: string;
  created_at: string;
  updated_at: string;
}
export interface IToEmailDetail {
  id: number;
  daftaremail_id: number;
  toemail_id: number;
  toemail: string;
  nama: string;
  text: string;
  statusaktif: number;
  info: string;
  created_at: string;
  updated_at: string;
}
export interface IAllDaftarEmail {
  data: IDaftarEmail[];
  pagination: IMeta;
}
export interface IAllDaftarEmailToDetail {
  data: IToEmailDetail[];
  pagination: IMeta;
}
