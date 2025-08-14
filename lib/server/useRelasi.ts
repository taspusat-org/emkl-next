import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import { IErrorResponse } from '../types/user.type';
import { getRelasiFn } from '../apis/relasi.api';

export const useGetRelasi = (
  filters: {
    filters?: {
      nama?: string;
      statusrelasi_text?: string;
      coagiro?: string;
      coapiutang?: string;
      coahutang?: string;
      statustitip_text?: string;
      titipcabang_text?: string;
      alamat?: string;
      npwp?: string;
      namapajak?: string;
      alamatpajak?: string;
      statusaktif_text?: string;
      modifiedby?: string;
    };
    page?: number;
    sortBy?: string;
    sortDirection?: string;
    limit?: number;
    search?: string;
  } = {}
) => {
  return useQuery(['relasis', filters], async () => await getRelasiFn(filters));
};
