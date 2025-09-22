import { IMeta } from './error.type';
export interface IJenisOrderan {
  id: number;
  nama: string;
  keterangan: string;
  statusaktif: number;
  statusaktif_text: string;
  statusformat: string;
  format_nama: string | null;
  created_at: string;
  updated_at: string;
}

export interface IAllJenisOrderan {
  data: IJenisOrderan[];
  type: string;
  pagination: IMeta;
}
