import { IMeta } from './error.type';

export interface IBank {
  id: number; // Primary key
  nama_bank: string; // Nama bank (varchar(255))
  kode_bank: string; // Kode bank (varchar(50)) - unique
  alamat?: string; // Alamat (varchar(255))
  nomor_telepon?: string; // Nomor telepon (varchar(20))
  email?: string; // Email (varchar(100))
  created_at: string; // Created at (datetime)
  updated_at: string; // Updated at (datetime)
}
export interface IAllBank {
  type: string;
  data: IBank[];
  pagination: IMeta;
}
