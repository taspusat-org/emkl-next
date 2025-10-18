import { IMeta } from './error.type';

export interface statusJob {
  tglstatus: string;
  id: number | string;
}

export interface IAllStatusJob {
  data: statusJob[];
  type: string;
  pagination: IMeta;
}

export interface StatusJobMasukGudang {
  tglstatus: string;
  id: number | string;
  job: number | null;
  job_nama: string | null;
  jenisorderan_id: number | null;
  jenisorder_nama: string | null;
  tglorder: string | null;
  nocontainer: string | null;
  noseal: string | null;
  shipper_id: number | null;
  shipper_nama: string | null;
  nosp: string | null;
  lokasistuffing: number | null;
  lokasistuffing_nama: string | null;
  keterangan: string | null;
  modifiedby: string | null;
  created_at: string | null;
  updated_at: string | null;
  [key: string]: string | number | boolean | null | undefined;
}

export interface IAllStatusJobMasukGudang {
  data: StatusJobMasukGudang[];
  type: string;
  pagination: IMeta;
}

export interface IErrorResponse {
  message: string;
  errors: Record<string, string[]>;
  statusCode: number;
}

export const filterStatusJob = {
  tglstatus: '',
  jenisOrderan: '',
  jenisStatusJob: '',
  tglDari: '',
  tglSampai: ''
};

export const filterStatusJobMasukGudang = {
  job_text: '',
  // jenisorder_text: '',
  tglorder: '',
  nocontainer: '',
  noseal: '',
  shipper_text: '',
  nosp: '',
  lokasistuffing_text: '',
  keterangan: '',
  // modifiedby: '',
  // created_at: '',
  // updated_at: '',
  // tglDari: '',
  // tglSampai: '',
  jenisOrderan: '',
  jenisStatusJob: ''
};
