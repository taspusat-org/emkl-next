import { useQuery } from 'react-query';
import { getAllScheduleKapalsiFn } from '../apis/schedulekapal.api';

export const useGetAllScheduleKapal = (
  filters: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: string;
    filters?: {
      jenisorderan_nama?: string | null | undefined | '';
      keterangan?: string;
      kapal_nama?: string;
      pelayaran_nama?: string;
      tujuankapal_nama?: string;
      asalkapal_nama?: string;
      tglberangkat?: string;
      tgltiba?: string;
      tglclosing?: string;
      statusberangkatkapal?: string;
      statustibakapal?: string;
      batasmuatankapal?: string;
      statusaktif_nama?: string;
      modifiedby?: string;
      created_at?: string;
      updated_at?: string;
    };
  } = {}
) => {
  return useQuery(
    ['schedulekapal', filters],
    async () => await getAllScheduleKapalsiFn(filters)
  );
};
