'use client';

import PageContainer from '@/components/layout/page-container';
import GridJabatan from './components/GridJabatan';
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
import { getDivisiFn } from '@/lib/apis/divisi.api';

const Page = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fieldLength('jabatan');
        dispatch(setFieldLength(result.data));

        const [getDivisiLookup, getStatusAktifLookup] = await Promise.all([
          getDivisiFn({ isLookUp: 'true' }),
          getParameterFn({ isLookUp: 'true' })
        ]);

        // DIVISI
        if (getDivisiLookup.type === 'local') {
          dispatch(setData({ key: 'DIVISI', data: getDivisiLookup.data }));
          const defaultValue =
            getDivisiLookup.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';

          dispatch(setDefault({ key: 'DIVISI', isdefault: defaultValue }));
        }
        dispatch(setType({ key: 'DIVISI', type: getDivisiLookup.type }));

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
          <GridJabatan />
        </div>
      </div>
    </PageContainer>
  );
};

export default Page;
