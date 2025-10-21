'use client';

import PageContainer from '@/components/layout/page-container';
import GridAsalKapal from './component/GridAsalKapal';
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
import { getContainerFn } from '@/lib/apis/container.api';
import { getAllCabangFn } from '@/lib/apis/cabang.api';

const Page = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fieldLength('asalkapal');
        dispatch(setFieldLength(result.data));

        const [getCabangLookup, getContainerLookup, getStatusAktifLookup] =
          await Promise.all([
            getAllCabangFn({ isLookUp: 'true' }),
            getContainerFn({ isLookUp: 'true' }),
            getParameterFn({ isLookUp: 'true' })
          ]);

        // CABANG
        if (getCabangLookup.type === 'local') {
          dispatch(setData({ key: 'CABANG', data: getCabangLookup.data }));
          const defaultValue =
            getCabangLookup.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';

          dispatch(setDefault({ key: 'CABANG', isdefault: defaultValue }));
        }
        dispatch(setType({ key: 'CABANG', type: getCabangLookup.type }));

        // CONTAINER
        if (getContainerLookup.type === 'local') {
          dispatch(
            setData({ key: 'CONTAINER', data: getContainerLookup.data })
          );
          const defaultValue =
            getContainerLookup.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';

          dispatch(setDefault({ key: 'CONTAINER', isdefault: defaultValue }));
        }
        dispatch(setType({ key: 'CONTAINER', type: getContainerLookup.type }));

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
          <GridAsalKapal />
        </div>
      </div>
    </PageContainer>
  );
};

export default Page;
