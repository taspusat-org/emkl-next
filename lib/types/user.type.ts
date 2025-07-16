import { IMeta } from './error.type';

export interface IErrorResponse {
  message: string;
  statusCode: number;
  errors: Record<string, string[]>;
}
export interface IAuthResponseLogin {
  message: string;
  token: string;
  username: string;
}
export interface IAuthResponseRegister {
  message: string;
  userId: number;
}
export interface IAllUser {
  data: IUser[];
  pagination: IMeta;
}
export interface IUser {
  id: number;
  username: string;
  name: string;
  password: string;
  text: string;
  email: string;
  namakaryawan: string;
  karyawan_id: number;
  statusaktif: number;
  roles: IRoleUser[];
  acos: IUserAcl[];
  modifiedby: string;
  created_at: string; // Tanggal dalam format ISO string
  updated_at: string; // Tanggal dalam format ISO string
}
export interface IRoleUser {
  roleId: string;
  rolename: string;
  modifiedby: string;
  created_at: string;
  updated_at: string;
}
export interface IUserAcl {
  acoId: number;
  class: string;
  method: string;
  nama: string;
}
export interface IRole {
  id: number;
  rolename: string;
  created_at: string;
  updated_at: string;
}
export interface IAcl {
  id: number;
  class: string;
  method: string;
  nama: string;
  modifiedby: string;
  created_at: string;
  updated_at: string;
}
export interface IUserRole {
  data: IRole[];
}
export interface IUserAcl {
  data: IAcl[];
}
