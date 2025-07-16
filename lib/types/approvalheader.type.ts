import { IMeta } from './error.type';

export interface IApprovalHeader {
  id: number;
  nama: string; // Renamed to match the JSON property 'nama'
  keterangan: string; // Renamed to match the JSON property 'keterangan'
  cabang_id: number; // Renamed to match the JSON property 'cabang_id'
  statusaktif: number;
  modifiedby: string;
  cabang_nama: string;
  created_at: string;
  info: string;
  updated_at: string;
  memo: string; // Kept as string since it's JSON encoded
  text: string;
  namacabang: string; // Renamed to match the JSON property 'namacabang'
}
export interface IApprovalDetail {
  id: number;
  jenjangapproval: number; // Renamed to match the JSON property 'nama'
  karyawan_id: number; // Renamed to match the JSON property 'nama'
  namakaryawan: string;
  modifiedby: string;
  created_at: string;
  info: string;
  updated_at: string;
}
export interface IAllApprovalHeader {
  data: IApprovalHeader[]; // Array of IMenu objects
  pagination: IMeta; // Pagination metadata
}
