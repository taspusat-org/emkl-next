import { AxiosError } from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useAlert } from '../store/client/useAlert';
import { useFormError } from '../hooks/formErrorContext';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { getAllOrderanMuatanFn } from '../apis/orderanHeader.api';

export const useGetAllOrderanMuatan = (
  filters: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: string;
    filters?: {
      nobukti?: string;
      tglbukti?: string;
      modifiedby?: string;
      created_at?: string;
      updated_at?: string;
      tglDari?: string | null;
      tglSampai?: string | null;
    };
  } = {},
  signal?: AbortSignal
) => {
  return useQuery(
    ['orderanheader', filters],
    async () => await getAllOrderanMuatanFn(filters, signal),
    {
      enabled: !signal?.aborted
    }
  );
};
