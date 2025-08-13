'use client';

import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { fieldLength } from '@/lib/apis/field-length.api';

import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setFieldLength } from '@/lib/store/field-length/fieldLengthSlice';
import GridOpenLocks from './components/GridOpenLocks';
import { ApiResponse } from '@/lib/apis/logtrail.api';
import { getAllUserFn } from '@/lib/apis/user.api';
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
        // Fetching field length data
        const fieldLengthResult = await fieldLength('menus');

        // Fetching data for USERS, ALAT BAYAR, and RELASI
        const [dataUser] = await Promise.all<any>([
          getAllUserFn({ isLookUp: 'true', filters: { cabang_id: '1' } })
        ]);

        // Handle USERS data
        if (dataUser.type === 'local') {
          dispatch(setData({ key: 'USERS', data: dataUser.data }));
          const defaultValue =
            dataUser.data
              .map((item) => item.default)
              .find((val) => val !== null) || '';

          // Dispatch the default data
          dispatch(setDefault({ key: 'USERS', isdefault: defaultValue }));
        }
        dispatch(setType({ key: 'USERS', type: dataUser.type }));

        // Dispatch the field length data separately
        dispatch(setFieldLength(fieldLengthResult.data));
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [dispatch]);
  return (
    <PageContainer scrollable>
      <div className="grid h-fit grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-10 h-[500px]">
          <GridOpenLocks />
        </div>
      </div>
    </PageContainer>
  );
};

export default Page;
