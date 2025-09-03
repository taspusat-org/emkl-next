import { IMeta } from './error.type';

export interface IAkunpusat {
  id: number;
  type_id: number;
  level: number;
  coa: string;
  keterangancoa: string;
  parent: string;
  cabang_id: number;
  statusaktif: number;
  cabang_nama: string;
  statusaktif_nama: string;
  type_nama: string;
  modifiedby: string;
  created_at: string;
  updated_at: string;
}

export interface IAllAkunpusat {
  data: IAkunpusat[];
  type: string;
  pagination: IMeta;
}

export const filterAkunpusat = {
  type_id: null,
  level: null,
  coa: '',
  keterangancoa: '',
  parent: '',
  cabang_id: null,
  statusaktif: null,
  cabang_nama: '',
  statusaktif_nama: '',
  type_nama: '',
  modifiedby: '',
  created_at: '',
  updated_at: ''
};
