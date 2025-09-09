import { IMeta } from './error.type';

export interface Supplier {
  id: number;
  nama: string;
  keterangan: string;
  contactperson: string;
  ktp: string;
  alamat: string;
  coa: string;
  coa_nama: string;
  coapiu: string;
  coapiu_nama: string;
  coahut: string;
  coahut_nama: string;
  coagiro: string;
  coagiro_nama: string;
  kota: string | null;
  kodepos: string | null;
  telp: string | null;
  email: string;
  fax: string | null;
  web: string | null;
  creditterm: number;
  credittermplus: number | null;
  npwp: string;
  alamatfakturpajak: string;
  namapajak: string;
  nominalpph21: string | null;
  nominalpph23: string | null;
  noskb: string | null;
  tglskb: string | null;
  nosk: string | null;
  tglsk: string | null;
  statusaktif: number;
  statusaktif_nama: string | null;
  modifiedby: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface IAllSupplier {
  data: Supplier[];
  type: string;
  pagination: IMeta;
}

export interface IErrorResponse {
  message: string;
  errors: Record<string, string[]>;
  statusCode: number;
}

export const filterSupplier = {
  nama: '',
  keterangan: '',
  contactperson: '',
  ktp: '',
  alamat: '',
  coa_text: '',
  coapiu_text: '',
  coahut_text: '',
  coagiro_text: '',
  kota: '',
  kodepos: '',
  telp: '',
  email: '',
  fax: '',
  web: '',
  creditterm: '',
  credittermplus: '',
  npwp: '',
  alamatfakturpajak: '',
  namapajak: '',
  nominalpph21: '',
  nominalpph23: '',
  noskb: '',
  tglskb: '',
  nosk: '',
  tglsk: '',
  statusaktif_text: '',
  modifiedby: '',
  created_at: '',
  updated_at: ''
};
