import { IMeta } from './error.type';

export interface IAkunpusat {
  id: number;
  coa: number;
  keterangancoa: string;
  default?: number | string | null;
}

export interface IAllAkunpusat {
  data: IAkunpusat[];
  type: string;
  pagination: IMeta;
}
