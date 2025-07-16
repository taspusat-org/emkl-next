export interface IToemail {
  id: number;
  nama: string;
  email: string;
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

export interface IAllToemail {
  data: IToemail[];
  pagination: IMeta;
}
