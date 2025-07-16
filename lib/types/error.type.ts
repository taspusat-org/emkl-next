export interface IError {
  id: number; // ID unik (primary key)
  ket: string; // Grup, bisa null
  kode: string; // Sub Grup, bisa null
  statusaktif: number; // ID unik (primary key)
  modifiedby: string; // Nama pengubah, bisa null
  created_at: Date; // Tanggal dibuat
  updated_at: Date; // Tanggal diperbarui
}
export interface IMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}
export interface IAllError {
  data: IError[]; // Array dari IParameter
  type: string;
  pagination: IMeta;
}
