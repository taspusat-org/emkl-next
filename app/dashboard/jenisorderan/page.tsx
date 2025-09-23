'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fieldLength } from '@/lib/apis/field-length.api';
import { getParameterFn } from '@/lib/apis/parameter.api';
import GridJenisOrderan from './components/GridJenisOrderan';
import PageContainer from '@/components/layout/page-container';
import { setFieldLength } from '@/lib/store/field-length/fieldLengthSlice';
import {
  setData,
  setType,
  setDefault
} from '@/lib/store/lookupSlice/lookupSlice';

interface ApiResponse {
  type: string;
  data: any; // Define a more specific type for data if possible
}

const Page = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fieldLength('jenisorderan');
        dispatch(setFieldLength(result.data));

        const [getStatusAktifLookup] = await Promise.all<ApiResponse>([
          getParameterFn({ isLookUp: 'true' })
        ]);

        if (getStatusAktifLookup.type === 'local') {
          const grpsToFilter = ['STATUS AKTIF'];

          grpsToFilter.forEach((grp) => {
            const filteredData = getStatusAktifLookup.data.filter(
              (item: any) => item.grp === grp
            );

            dispatch(setData({ key: grp, data: filteredData }));
            dispatch(setType({ key: grp, type: getStatusAktifLookup.type }));

            const defaultValue = filteredData
              .map((item: any) => item.default)
              .find((val: any) => val !== null || '');

            dispatch(setDefault({ key: grp, isdefault: String(defaultValue) }));
          });

          const formatData = getStatusAktifLookup.data.filter(
            (item: any) => item.kelompok != ''
          );
          dispatch(setData({ key: 'FORMAT', data: formatData }));
          dispatch(setType({ key: 'FORMAT', type: getStatusAktifLookup.type }));
          const defaultValue = formatData.data
            .map((item: any) => item.default)
            .find((val: any) => val !== null || '');
          dispatch(
            setDefault({ key: 'FORMAT', isdefault: String(defaultValue) })
          );
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
      }
    };
    fetchData();
  }, [dispatch]);
  return (
    <PageContainer scrollable>
      <div className="grid h-fit grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-10 h-[500px]">
          <GridJenisOrderan />
        </div>
      </div>
    </PageContainer>
  );
};

export default Page;
