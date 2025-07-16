import { IMeta } from './error.type';

export interface ICatatan {
  id: number;
  tgl: string;
  keterangan: string;
  karyawan_nama: string;
  jeniscatatan_nama: string;
  text: string;
  statusaktif: number;
  karyawan_id: number;
  jeniscatatan_id: number;
  modifiedby: string;
  created_at: string;
  updated_at: string;
}
export interface IAllCatatan {
  data: ICatatan[];
  pagination: IMeta;
}
