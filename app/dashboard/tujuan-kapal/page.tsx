'use client';

import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import GridTujuankapal from './components/GridTujuankapal';
import { fieldLength } from '@/lib/apis/field-length.api';

import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setFieldLength } from '@/lib/store/field-length/fieldLengthSlice';
import { getParameterFn } from '@/lib/apis/parameter.api';
import {
  setData,
  setDefault,
  setType
} from '@/lib/store/lookupSlice/lookupSlice';
import { getTujuankapalFn } from '@/lib/apis/tujuankapal.api';
import { getAllCabangFn } from '@/lib/apis/cabang.api';

interface ApiResponse {
  type: string;
  data: any; // Define a more specific type for data if possible
}

const Page = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fieldLength('tujuankapal');
        dispatch(setFieldLength(result.data));

        const [getStatusAktifLookup, getCabangLookup] =
          await Promise.all<ApiResponse>([
            getParameterFn({ isLookUp: 'true' }),
            getAllCabangFn({ isLookUp: 'true' })
          ]);

        if (getStatusAktifLookup.type === 'local') {
          const grpsToFilter = ['STATUS AKTIF'];

          grpsToFilter.forEach((grp) => {
            const filteredData = getStatusAktifLookup.data.filter(
              (item: any) => item.grp === grp
            );
            //

            dispatch(setData({ key: grp, data: filteredData }));
            dispatch(setType({ key: grp, type: getStatusAktifLookup.type }));

            const defaultValue = filteredData
              .map((item: any) => item.default)
              .find((val: any) => val !== null || '');

            dispatch(setDefault({ key: grp, isdefault: String(defaultValue) }));
          });
        }

        if (getCabangLookup.type === 'local') {
          dispatch(setData({ key: 'NAMA', data: getCabangLookup.data }));
          const defaultValue =
            getCabangLookup.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';

          dispatch(setDefault({ key: 'NAMA', isdefault: defaultValue }));
        }
        dispatch(setType({ key: 'NAMA', type: getCabangLookup.type }));
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fieldLength('tujuankapal');
        dispatch(setFieldLength(result.data));
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
          <GridTujuankapal />
        </div>
      </div>
    </PageContainer>
  );
};

export default Page;
