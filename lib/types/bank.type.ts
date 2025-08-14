import { IMeta } from './error.type';

export interface IBank {
  id: number;
  nama: string;
  keterangan: string;

  coa: number | null;
  keterangancoa: string | null;

  coagantung: number | null;
  keterangancoagantung: string | null;

  statusbank: number;
  textbank: string;

  statusaktif: number;
  text: string;

  statusdefault: number;
  textdefault: string;

  formatpenerimaan: number;
  formatpenerimaantext: string;

  formatpengeluaran: number;
  formatpengeluarantext: string;

  formatpenerimaangantung: number;
  formatpenerimaangantungtext: string;

  formatpengeluarangantung: number;
  formatpengeluarangantungtext: string;

  formatpencairan: number;
  formatpencairantext: string;

  formatrekappenerimaan: number;
  formatrekappenerimaantext: string;

  formatrekappengeluaran: number;
  formatrekappengeluarantext: string;

  // info: string;
  // modifiedby: string;

  // memo?: string;
}

export interface IAllBank {
  data: IBank[];
  type: string;
  pagination: IMeta;
}
