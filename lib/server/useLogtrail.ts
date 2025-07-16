import { useQuery } from 'react-query';
import {
  Filter,
  getLogtrailDetailFn,
  getLogtrailFn,
  getLogtrailHeaderFn
} from '../apis/logtrail.api';

export const useGetLogtrail = (
  filters: {
    filters?: {
      id?: string; // Filter berdasarkan class
      namatabel?: string; // Filter berdasarkan method
      postingdari?: string; // Filter berdasarkan nama
      idtrans?: string; // Filter berdasarkan nama
      nobuktitrans?: string; // Filter berdasarkan nama
      aksi?: string; // Filter berdasarkan nama
      modifiedby?: string; // Filter berdasarkan nama
      updated_at?: string; // Filter berdasarkan nama
    };
    page?: number;
    sortBy?: string;
    sortDirection?: string;
    limit?: number;
    search?: string; // Kata kunci pencarian
  } = {}
) => {
  return useQuery(
    ['logtrail', filters],
    async () => await getLogtrailFn(filters)
  );
};
export const useGetLogtrailHeader = (params: Filter) => {
  return useQuery(['logtrail', params], async () => {
    const { id, page, limit, sortKey, sortOrder } = params;
    return await getLogtrailHeaderFn(id, page, limit, sortKey, sortOrder);
  });
};

export const useGetLogtrailDetail = (params: Filter) => {
  return useQuery(['logtrail', params], async () => {
    const { id, page, limit, sortKey, sortOrder } = params;
    return await getLogtrailDetailFn(id, page, limit, sortKey, sortOrder);
  });
};
