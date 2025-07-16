export interface IJabatan {
  id: number;
  nama: string;
  keterangan: string;
  text: string;
  statusaktif: number;
  modifiedby: string;
  created_at: string;
  updated_at: string;
}

export interface IMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface IAllJabatan {
  data: IJabatan[];
  pagination: IMeta;
}
