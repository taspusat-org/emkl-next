import { IMeta } from './error.type';

export interface IMenu {
  id: number;
  title: string;
  url: string;
  aco_id: number;
  icon: string;
  items: string;
  text: string;
  acos_nama: string;
  parent_nama: string;
  parentId: number;
  statusaktif: number;
  order: number;
  created_at: string;
  updated_at: string;
}
export interface IAllMenus {
  data: IMenu[];
  pagination: IMeta;
}
