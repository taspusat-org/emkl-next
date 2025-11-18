import { IMeta } from './error.type';

export interface IBiayaemkl {
  id: number;
  nama: string;
  keterangan: string;

  biaya_id: number | null;
  biaya_text: string;

  coahut: string;
  coahut_text: string | null;

  jenisorderan_id: number | null;
  jenisorderan_text: string;

  statusaktif: number;
  text: string;

  statusbiayabl: number;
  statusbiayabl_text: string;

  statusseal: number;
  statusseal_text: string;
}

export interface IAllBiayaemkl {
  data: IBiayaemkl[];
  type: string;
  pagination: IMeta;
}
