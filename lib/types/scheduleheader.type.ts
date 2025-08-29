import { IMeta } from './error.type';

export interface ScheduleHeader {
  id: number;
  nobukti: string | null;
  tglbukti: string; // Nullable date field
  keterangan: string | null;
  modifiedby: string | null;
  created_at: string;
  updated_at: string;
}
export interface ScheduleDetail {
  id: number | string;
  schedule_id: string | null;
  nobukti: string;
  pelayaran_id: number | null;
  pelayaran_nama: string | null;
  kapal_id: number | null;
  kapal_nama: string | null;
  tujuankapal_id: number | null;
  tujuankapal_nama: string | null;
  tglberangkat: string | null; // Nullable datetime field
  tgltiba: string | null; // Nullable datetime field
  etb: string | null; // Nullable datetime field
  eta: string | null; // Nullable datetime field
  etd: string | null; // Nullable datetime field
  voyberangkat: string | null;
  voytiba: string | null;
  closing: string | null;
  etatujuan: string | null;
  etdtujuan: string | null;
  keterangan: string | null;
  [key: string]: string | number | boolean | null | undefined;
}
export interface IAllScheduleHeader {
  data: ScheduleHeader[];
  pagination: IMeta;
}
export interface IAllScheduleDetail {
  data: ScheduleDetail[];
  pagination: IMeta;
}
export const filterScheduleHeader = {
  nobukti: '',
  tglbukti: '',
  keterangan: '',
  modifiedby: '',
  created_at: '',
  updated_at: '',
  tglDari: '',
  tglSampai: ''
};

export const filterScheduleDetail = {
  nobukti: '',
  pelayaran: '',
  kapal: '',
  tujuankapal: '',
  tglberangkat: '',
  tgltiba: '',
  etb: '',
  eta: '',
  etd: '',
  voyberangkat: '',
  voytiba: '',
  closing: '',
  etatujuan: '',
  etdtujuan: '',
  keterangan: ''
};
