export interface GetParams {
  limit?: number;
  page?: number;
  isLookUp?: string;
  filters?: Record<string, any>; // Tipe dinamis untuk filters
  sortBy?: string;
  isreload?: boolean;
  sortDirection?: string;
  search?: string;
}
