import { IMeta } from './error.type';
export interface IPelayaran {
  id: number;
  nama: string;
  keterangan: string;
  statusaktif: number;
  statusaktif_text: string;
  created_at: string;
  updated_at: string;
}

export interface IAllPelayaran {
  data: IPelayaran[];
  pagination: IMeta;
}
