import { useQuery } from 'react-query';
import { getAllGandenganFn } from '../apis/gandengan.api';

export const useGetAllGandengan = (
  filters: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: string;
    filters?: {
      nama?: string;
      keterangan?: string;
      statusaktif_text?: string;
      modifiedby?: string;
      created_at?: string;
      updated_at?: string;
    };
  } = {}
) => {
  return useQuery(
    ['gandengan', filters],
    async () => await getAllGandenganFn(filters)
  );
};
