import { IMeta } from './error.type';

export interface IRole {
  id: number;
  rolename: string;
  modifiedby: string;
  statusaktif: number;
  text: string;
  created_at: string;
  updated_at: string;
  acos: IRoleAcl[];
}
export interface IRoleAcl {
  acoId: number;
  class: string;
  method: string;
  nama: string;
}
export interface IAllRoleAcl {
  data: IRoleAcl[];
}
export interface IAllRoles {
  data: IRole[];
  pagination: IMeta;
  total: string;
}
