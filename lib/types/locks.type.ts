import { IMeta } from './error.type';

export interface ILocks {
  id: number;
  table: string;
  tableid: string;
  editing_by: string;
  editing_at: string;
  info: string;
  modifiedby: string;
  created_at: string;
  updated_at: string;
}
export interface IAllLocks {
  data: ILocks[];
  pagination: IMeta;
}
export const FILTER_LOCKS = {
  table: '',
  tableid: '',
  editing_by: '',
  editing_at: '',
  info: '',
  modifiedby: '',
  created_at: '',
  updated_at: ''
};
