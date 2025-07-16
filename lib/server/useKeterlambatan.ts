import { useQuery } from 'react-query';
import { getRekapKeterlambatanFn } from '../apis/keterlambatan.api';
import {
  setProcessed,
  setProcessing
} from '../store/loadingSlice/loadingSlice';
import { useDispatch } from 'react-redux';

export const UseGetRekapKeterlambatan = (params: any, activeTab?: string) => {
  const dispatch = useDispatch(); // Use dispatch here

  return useQuery(
    ['rekap-keterlambatan', params],
    async () => {
      const {
        pidcabang,
        tanggalDari,
        tanggalSampai,
        idabsenFrom,
        idabsenTo,
        search,
        sortBy,
        sortDirection
      } = params;

      // Dispatching setProcessing when starting the query
      dispatch(setProcessing());

      // Get data using the API function
      const data = await getRekapKeterlambatanFn(
        pidcabang,
        tanggalDari,
        tanggalSampai,
        idabsenFrom,
        idabsenTo,
        search,
        sortBy,
        sortDirection
      );

      // Dispatch setProcessed when data is fetched
      dispatch(setProcessed());

      return data;
    },
    {
      // Use `enabled` option correctly
      enabled: !!params.tanggalDari && !!params.tanggalSampai,
      onError: () => {
        dispatch(setProcessed()); // Ensure to set processed even if an error occurs
      },
      onSettled: () => {
        dispatch(setProcessed()); // Ensure to set processed in both success or error cases
      }
    }
  );
};
