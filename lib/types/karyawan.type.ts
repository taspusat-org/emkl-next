import { IMeta } from './error.type';

export interface IKaryawan {
  id: number;
  agama_id?: number; // ID Agama (nullable)
  statuskerja_id?: number; // ID Status Kerja (nullable)
  npwp?: string; // NPWP Karyawan
  statuskaryawan_id?: number; // ID Status Karyawan (nullable)
  jumlahtanggungan?: number; // Jumlah Tanggungan
  noktp?: string; // Nomor KTP
  namakaryawan?: string; // Nama Karyawan
  namaalias?: string; // Nama Alias Karyawan
  jeniskelamin_id?: number; // ID Jenis Kelamin
  alamat?: string; // Alamat Karyawan
  tempatlahir?: string; // Tempat Lahir
  tgllahir?: string; // Tanggal Lahir (ISO string)
  golongandarah_id?: number; // ID Golongan Darah
  nohp?: string; // Nomor HP
  foto?: string; // Foto Karyawan (file name)
  tglmasukkerja?: string; // Tanggal Masuk Kerja (ISO string)
  email?: string; // Email Karyawan
  tglresign?: string; // Tanggal Resign (ISO string)
  tglmutasi?: string; // Tanggal Mutasi (ISO string)
  kodekaryawan?: string; // Kode Karyawan
  keterangan?: string; // Keterangan
  namaibu?: string; // Nama Ibu
  namaayah?: string; // Nama Ayah
  pengalamankerja?: string; // Pengalaman Kerja
  kodemarketing?: string; // Pengalaman Kerja
  alasanberhenti?: string; // Pengalaman Kerja

  modifiedby?: string; // Modified By
  created_at?: string; // Tanggal dibuat (ISO string)
  updated_at?: string; // Tanggal diperbarui (ISO string)

  // Foreign key relations
  cabang_id?: number; // ID Cabang (nullable)
  jabatan_id?: number; // ID Jabatan (nullable)
  atasan_id?: number; // ID Atasan Karyawan (nullable)
  thr_id?: number; // ID THR (nullable)
  daftaremail_id?: number; // ID Daftar Email (nullable)
  absen_id?: number; // ID Absen (nullable)
  approval_id?: number; // ID Approval (nullable)
  statusaktif?: number; // ID Status Aktif (nullable)

  // Custom fields not in database but in response
  statusaktif_memo?: string; // Memo Status Aktif (JSON string)
  statusaktif_text?: string; // Text Status Aktif
  statuskerja_text?: string; // Text Status Kerja
  statuskaryawan_text?: string; // Text Status Karyawan
  jeniskelamin_text?: string; // Jenis Kelamin Text
  agama_text?: string; // Jenis Kelamin Text
  golongandarah_text?: string; // Golongan Darah Text
  cabang_nama?: string; // Nama Cabang
  jabatan_nama?: string; // Nama Jabatan
  shift_nama?: string; // Nama Jabatan
  atasan_nama?: string; // Nama Atasan (format "namakaryawan (id)")
  thr_text?: string; // Text THR
  daftaremail_email?: string; // Email dari Daftar Email
  approval_nama?: string; // Nama Cabang

  // Additional fields in the database schema
  spesifikasikomputer?: string; // Spesifikasi Komputer
  info?: string; // Informasi Tambahan
}

export interface IAllKaryawan {
  data: IKaryawan[];
  pagination: IMeta;
}

export interface IKaryawanNomorDarurat {
  id: number;
  nohp: string;
  hubungan: string;
  statusaktif: number;
  info: string;
  created_at: string;
  updated_at: string;
}
export interface IKaryawanPengalamanKerja {
  id: number;
  karyawan_id: number; // nullable foreign key to karyawan
  namaperusahaan: string;
  jabatan: string;
  tglmulai: string; // date type
  tglakhir: string; // date type
  keterangan: string;
  statusaktif_text: string;
  statusaktif: number; // nullable foreign key to parameter table
  info: string;
  modifiedby: string;
  created_at: string; // timestamp
  updated_at: string; // timestamp
}
export interface IKaryawanPendidikan {
  id: number;
  karyawan_id: number; // nullable foreign key to karyawan
  pendidikan_id: number; // nullable foreign key to parameter (pendidikan)
  pendidikan_text: string; // nullable foreign key to parameter (pendidikan)
  statusaktif_text: string; // nullable foreign key to parameter (pendidikan)
  namasekolah: string;
  jurusan: string;
  tahunlulus: number; // year type
  keterangan: string;
  statusaktif: number; // nullable foreign key to parameter (statusaktif)
  info: string;
  modifiedby: string;
  created_at: string; // timestamp
  updated_at: string; // timestamp
}
export interface IKaryawanBerkas {
  id: number;
  karyawan_id: number; // nullable foreign key to karyawan
  jenisberkas_id: number; // nullable foreign key to parameter (jenisberkas)
  fileberkas: string;
  jenisberkas_text: string;
  statusaktif_text: string;
  keterangan: string;
  statusaktif: number; // nullable foreign key to parameter (statusaktif)
  info: string;
  modifiedby: string;
  created_at: string; // timestamp
  updated_at: string; // timestamp
}

export interface IKaryawanVaksin {
  id: number;
  karyawan_id: number; // nullable foreign key to karyawan
  tglvaksin: string; // date type
  filefoto: string;
  text: string;
  keterangan: string;
  statusaktif: number; // nullable foreign key to parameter table
  info: string;
  modifiedby: string;
  created_at: string; // timestamp
  updated_at: string; // timestamp
}

export interface IAllKaryawanNomorDarurat {
  data: IKaryawanNomorDarurat[];
}
export interface IAllKaryawanPengalamanKerja {
  data: IKaryawanPengalamanKerja[];
}
export interface IAllKaryawanVaksin {
  data: IKaryawanVaksin[];
}
export interface IAllKaryawanPendidikan {
  data: IKaryawanPendidikan[];
}
export interface IAllKaryawanBerkas {
  data: IKaryawanBerkas[];
}
