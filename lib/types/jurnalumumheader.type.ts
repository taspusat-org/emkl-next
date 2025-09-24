import { IMeta } from './error.type';

export interface JurnalUmumHeader {
  id: number;
  nobukti: string;
  tglbukti: string | null; // Nullable date field
  keterangan: string | null;
  postingdari: string | null;
  statusformat: string | null;
  info: string | null;
  modifiedby: string | null;
  created_at: string;
  updated_at: string;
}
export interface JurnalUmumDetail {
  id: number | string;
  jurnalumum_id: string;
  nobukti: string;
  tglbukti: string | null;
  coa: string;
  coa_nama: string | null;
  keterangan: string | null;
  nominaldebet: string | null;
  nominalkredit: string | null;
  info: string | null;
  modifiedby: string | null;
  created_at: string;
  updated_at: string;
  link: string;
  keteranganapproval: string;
  tglapproval: string;
  statusapproval: string;
  keterangancetak: string;
  tglcetak: string;
  statuscetak: string;

  [key: string]: string | number | boolean | null | undefined;
}
export interface IAllJurnalUmumHeader {
  data: JurnalUmumHeader[];
  pagination: IMeta;
}
export interface IAllJurnalUmumDetail {
  data: JurnalUmumDetail[];
  pagination: IMeta;
}
export const filterJurnalUmum = {
  nobukti: '',
  tglbukti: '',
  postingdari: '',
  keterangan: '',
  modifiedby: '',
  statusapproval: '',
  statuscetak: '',
  created_at: '',
  updated_at: '',
  tglDari: '',
  tglSampai: ''
};
export const filterJurnalUmumDetail = {
  nobukti: '',
  tglbukti: '',
  keterangan: '',
  coa: '',
  coa_nama: '',
  nominaldebet: '',
  nominalkredit: '',
  nominal: '',
  info: '',
  modifiedby: '',
  created_at: '',
  updated_at: ''
};
