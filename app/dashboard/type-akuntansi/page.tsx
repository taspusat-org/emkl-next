'use client';

import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { fieldLength } from '@/lib/apis/field-length.api';
import GridTypeAkuntansi from './component/GridTypeAkuntansi';
import PageContainer from '@/components/layout/page-container';
import { setFieldLength } from '@/lib/store/field-length/fieldLengthSlice';
import { getParameterFn } from '@/lib/apis/parameter.api';
import {
  setData,
  setType,
  setDefault
} from '@/lib/store/lookupSlice/lookupSlice';
import { getAkuntansiFn } from '@/lib/apis/akuntansi.api';

interface ApiResponse {
  type: string;
  data: any; // Define a more specific type for data if possible
}

const Page = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fieldLength('typeakuntansi');
        dispatch(setFieldLength(result.data));

        const [getStatusAktifLookup, getAkuntansiLookup] =
          await Promise.all<ApiResponse>([
            getParameterFn({ isLookUp: 'true' }),
            getAkuntansiFn({ isLookUp: 'true' })
          ]);
        if (getStatusAktifLookup.type === 'local') {
          const grpsToFilter = ['STATUS AKTIF'];

          grpsToFilter.forEach((grp) => {
            const filteredData = getStatusAktifLookup.data.filter(
              (item: any) => item.grp === grp
            );
            // console.log('ini hasil filterdData',filteredData, grp);

            dispatch(setData({ key: grp, data: filteredData }));
            dispatch(setType({ key: grp, type: getStatusAktifLookup.type }));

            const defaultValue = filteredData
              .map((item: any) => item.default)
              .find((val: any) => val !== null || '');

            dispatch(setDefault({ key: grp, isdefault: String(defaultValue) }));
          });
        }

        if (getAkuntansiLookup.type === 'local') {
          dispatch(
            setData({ key: 'AKUNTANSI', data: getAkuntansiLookup.data })
          );
          const defaultValue =
            getAkuntansiLookup.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';
          dispatch(setDefault({ key: 'AKUNTANSI', isdefault: defaultValue }));
        }
        dispatch(setType({ key: 'AKUNTANSI', type: getAkuntansiLookup.type }));
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [dispatch]);

  return (
    <PageContainer scrollable>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsContent value="overview" className="space-y-4">
          <div className="grid h-fit grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-10 h-[500px]">
              <GridTypeAkuntansi />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default Page;
