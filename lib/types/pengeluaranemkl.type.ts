import { IMeta } from './error.type';

export interface PengeluaranEmkl {
  id: number;
  nama: string;
  keterangan: string;
  coadebet: string;
  coadebet_nama: string | null;
  coakredit: string;
  coakredit_nama: string | null;
  coapostingkasbankdebet: string;
  coabankdebet_nama: string | null;
  coapostingkasbankkredit: string;
  coabankkredit_nama: string | null;
  coapostinghutangdebet: string;
  coahutangdebet_nama: string | null;
  coapostinghutangkredit: string;
  coahutangkredit_nama: string | null;
  coaproses: string;
  coaproses_nama: string | null;
  nilaiproses: number;
  nilaiproses_nama: string | null;
  statuspenarikan: number;
  statuspenarikan_nama: string | null;
  format: string;
  format_nama: string | null;
  statusaktif: number;
  statusaktif_nama: string | null;
  modifiedby: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface IAllPengeluaranEmkl {
  data: PengeluaranEmkl[];
  type: string;
  pagination: IMeta;
}

export interface IErrorResponse {
  message: string;
  errors: Record<string, string[]>;
  statusCode: number;
}

export const filterPengeluaranEmkl = {
  nama: '',
  keterangan: '',
  coadebet_text: '',
  coakredit_text: '',
  coabankdebet_text: '',
  coabankkredit_text: '',
  coahutangdebet_text: '',
  coahutangkredit_text: '',
  coaproses_text: '',
  nilaiproses_text: '',
  statuspenarikan_text: '',
  format_text: '',
  statusaktif_text: '',
  modifiedby: '',
  created_at: '',
  updated_at: ''
};
