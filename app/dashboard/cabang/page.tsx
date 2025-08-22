'use client';

import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import React, { useEffect } from 'react';
import GridCabang from './components/GridCabang';
import { fieldLength } from '@/lib/apis/field-length.api';
import { setFieldLength } from '@/lib/store/field-length/fieldLengthSlice';
import { useDispatch } from 'react-redux';
import { getAllCabangHrFn } from '@/lib/apis/cabang.api';
import {
  setData,
  setDefault,
  setType
} from '@/lib/store/lookupSlice/lookupSlice';
const Page = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fieldLength('cabang');
        dispatch(setFieldLength(result.data));

        const [GetCabangHrLookup] = await Promise.all([
          getAllCabangHrFn({ isLookUp: 'true' })
        ]);

        if (GetCabangHrLookup.type === 'local') {
          dispatch(setData({ key: 'NAMA', data: GetCabangHrLookup.data }));
          const defaultValue =
            GetCabangHrLookup.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';

          dispatch(setDefault({ key: 'NAMA', isdefault: defaultValue }));
        }
        dispatch(setType({ key: 'NAMA', type: GetCabangHrLookup.type }));
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
              <GridCabang />
            </div>

            <div className="col-span-10 h-[500px]"></div>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default Page;
