import { IMeta } from './error.type';

export interface LabaRugiKalkulasi {
  id: number;
  periode: string;
  estkomisimarketing: string;
  komisimarketing: string;
  biayakantorpusat: string;
  biayatour: string;
  gajidireksi: string;
  estkomisikacab: string;
  biayabonustriwulan: string;
  estkomisimarketing2: string;
  estkomisikacabcabang1: string;
  estkomisikacabcabang2: string;
  statusfinalkomisimarketing: number;
  statusfinalkomisi_nama: string;
  statusfinalbonustriwulan: number;
  statusfinalbonus_nama: string;
  modifiedby: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface IAllLabaRugiKalkulasi {
  data: LabaRugiKalkulasi[];
  type: string;
  pagination: IMeta;
}

export interface IErrorResponse {
  message: string;
  errors: Record<string, string[]>;
  statusCode: number;
}

export const filterLabaRugiKalkulasi = {
  periode: '',
  estkomisimarketing: '',
  komisimarketing: '',
  biayakantorpusat: '',
  biayatour: '',
  gajidireksi: '',
  estkomisikacab: '',
  biayabonustriwulan: '',
  estkomisimarketing2: '',
  estkomisikacabcabang1: '',
  estkomisikacabcabang2: '',
  statusfinalkomisimarketing: '',
  statusfinalkomisi_text: '',
  statusfinalbonustriwulan: '',
  statusfinalbonus_text: '',
  modifiedby: '',
  created_at: '',
  updated_at: ''
};
