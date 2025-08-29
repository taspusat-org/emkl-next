import { IMeta } from './error.type';
export interface IMarketingGroup {
  id: number;
  marketing_id: number;
  marketing_nama: string;
  statusaktif: number;
  statusaktif_text: string;
  created_at: string;
  updated_at: string;
}

export interface IAllMarketingGroup {
  data: IMarketingGroup[];
  type: string;
  pagination: IMeta;
}
