import { IMeta } from './error.type';

export interface IBiaya {
  id: number;
  nama: string;
  keterangan: string;

  coa: string;
  coa_text: string | null;

  coahut: string;
  coahut_text: string | null;

  jenisorderan_id: number | null;
  jenisorderan_text: string;

  statusaktif: number;
  text: string;
}

export interface IAllBiaya {
  data: IBiaya[];
  type: string;
  pagination: IMeta;
}
