import { IMeta } from './error.type';

export interface IMasterBiaya {
  id: number;
  tujuankapal_id: number;
  tujuankapal_text: string;

  sandarkapal_id: number;
  sandarkapal_text: string;

  pelayaran_id: number;
  pelayaran_text: string;

  container_id: number;
  container_text: string;

  biayaemkl_id: number;
  biayaemkl_text: string;

  jenisorder_id: number;
  jenisorderan_text: string;

  tglberlaku: string;

  nominal: string;

  statusaktif: number;
  text: string;
}

export interface IAllMasterBiaya {
  data: IMasterBiaya[];
  type: string;
  pagination: IMeta;
}
