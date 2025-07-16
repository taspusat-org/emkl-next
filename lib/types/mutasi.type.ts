import { IMeta } from './error.type';

export interface IMutasi {
  id: number;
  tglmutasi: string;
  keterangan: string;
  karyawan_nama: string;
  namacabang_lama: string;
  namacabang_baru: string;
  namajabatan_baru: string;
  namajabatan_lama: string;
  text: string;
  statusaktif: number;
  karyawan_id: number;
  cabanglama_id: number;
  cabangbaru_id: number;
  jabatanlama_id: number;
  jabatanbaru_id: number;
  modifiedby: string;
  created_at: string;
  updated_at: string;
}
export interface IAllMutasi {
  data: IMutasi[];
  pagination: IMeta;
}
