import { IMeta } from './error.type';

export interface IIzin {
  id: number;
  tglpengajuan: string; // Tanggal pengajuan
  jampengajuan: string; // Tanggal pengajuan
  karyawan_id: number;
  tglizin: string; // Tanggal izin
  statusizin: string; // Status izin
  statusizinbatal: string; // Status izin batal
  alasanizin: string; // Alasan izin
  jenisizin_id: number;
  jenisizin_nama: string;
  statusapprovalatasan: string;
  tglapprovalatasan: string | null;
  userapprovalatasan: string | null;
  statusapprovalhrd: string;
  tglapprovalhrd: string | null;
  userapprovalhrd: string | null;
  info: string;
  modifiedby: number;
  created_at: string; // Waktu pembuatan
  updated_at: string; // Waktu pembaruan
  karyawan_nama: string; // Nama karyawan
  namaalias: string; // Nama karyawan
  statusizin_memo: string; // Memo status izin
  statusizinbatal_memo: string; // Memo status izin batal
  jenisizin_memo: string; // Memo jenis izin
  jenisizin_text: string; // Memo jenis izin
}

export interface IAllIzin {
  data: IIzin[];
  pagination: IMeta; // Pagination metadata
}
export interface IIzinApproval {
  id: number;
  statusapproval: number;
  jenjangapproval: number;
  namakaryawan: string;
  karyawan_id: string;
  tglapproval: string;
  modifiedby: string;
  created_at: string;
  updated_at: string;
}
