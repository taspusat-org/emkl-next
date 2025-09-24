import { IMeta } from './error.type';

export interface Trado {
  id: number;
  nama: string | null;
  keterangan: string | null;
  statusaktif: number | null;
  statusaktif_nama: string | null;
  modifiedby: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface IAllTrado {
  data: Trado[];
  type: string;
  pagination: IMeta;
}

export const tradoFilter = {
  nama: '',
  keterangan: '',
  statusaktif_text: '',
  modifiedby: '',
  created_at: '',
  updated_at: ''
};
