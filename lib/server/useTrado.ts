import { useQuery } from 'react-query';
import { getAllTradoFn } from '../apis/trado.api';

export const useGetAllTrado = (
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
  return useQuery(['trado', filters], async () => await getAllTradoFn(filters));
};
