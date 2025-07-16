export interface GetParams {
  limit?: number;
  page?: number;
  isLookUp?: string;
  filters?: Record<string, any>; // Tipe dinamis untuk filters
  sortBy?: string;
  sortDirection?: string;
  search?: string;
}
