import { IMeta } from './error.type';

export interface PindahBuku {
  id: number;
  nobukti: string;
  tglbukti: string;
  bankdari_id: number;
  bankdari_nama: string | null;
  bankke_id: number;
  bankke_nama: string | null;
  coadebet: string;
  coadebet_nama: string | null;
  coakredit: string;
  coakredit_nama: string | null;
  alatbayar_id: number;
  alatbayar_nama: string | null;
  nowarkat: string;
  tgljatuhtempo: string;
  keterangan: string;
  nominal: string;
  statusformat: number;
  statusformat_nama: string | null;
  modifiedby: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface IAllPindahBuku {
  data: PindahBuku[];
  type: string;
  pagination: IMeta;
}

export interface IErrorResponse {
  message: string;
  errors: Record<string, string[]>;
  statusCode: number;
}

export const filterPindahBuku = {
  nobukti: '',
  tglbukti: '',
  bankdari_text: '',
  bankke_text: '',
  coadebet_text: '',
  coakredit_text: '',
  alatbayar_text: '',
  nowarkat: '',
  tgljatuhtempo: '',
  keterangan: '',
  nominal: '',
  statusformat_text: '',
  modifiedby: '',
  created_at: '',
  updated_at: '',
  tglDari: '',
  tglSampai: ''
};
