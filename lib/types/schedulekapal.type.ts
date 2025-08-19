import { IMeta } from './error.type';

export interface IScheduleKapal {
  id: number;
  jenisorderan_id: number | null;
  jenisorderan_nama: string | null | undefined | '';
  keterangan: string | null;
  kapal_id: number | null;
  kapal_nama: string | null;
  pelayaran_id: number | null;
  pelayaran_nama: string | null;
  tujuankapal_id: number | null;
  tujuankapal_nama: string | null;
  asalkapal_id: number | null;
  asalkapal_nama: string | null;
  tglberangkat: string | null;
  tgltiba: string | null;
  tglclosing: string | null;
  statusberangkatkapal: string | null;
  statustibakapal: string | null;
  batasmuatankapal: string | null;
  statusaktif: number | null;
  statusaktif_nama: string | null;
  modifiedby: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface IAllScheduleKapal {
  data: IScheduleKapal[];
  pagination: IMeta;
}

// export interface InterfaceFilter {
//   jenisorderan_nama: string | null | undefined | '';
//   keterangan: string;
//   kapal_nama: string;
//   pelayaran_nama: string;
//   tujuankapal_nama: string;
//   asalkapal_nama: string;
//   tglberangkat: string;
//   tgltiba: string;
//   tglclosing: string;
//   statusberangkatkapal: string;
//   statustibakapal: string;
//   batasmuatankapal: string;
//   statusaktif_nama: string;
//   modifiedby: string;
//   created_at: string;
//   updated_at: string;
// }

export const defaultFilter = {
  jenisorderan_nama: '',
  keterangan: '',
  kapal_nama: '',
  pelayaran_nama: '',
  tujuankapal_nama: '',
  asalkapal_nama: '',
  tglberangkat: '',
  tgltiba: '',
  tglclosing: '',
  statusberangkatkapal: '',
  statustibakapal: '',
  batasmuatankapal: '',
  statusaktif_nama: '',
  modifiedby: '',
  created_at: '',
  updated_at: ''
};
