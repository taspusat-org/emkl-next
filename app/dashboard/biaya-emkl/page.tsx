'use client';

import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import GridBank from './components/GridBiayaemkl';
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
import { getAkunpusatFn } from '@/lib/apis/akunpusat.api';
import { IParameter } from '@/lib/types/parameter.type';
import { getJenisOrderanFn } from '@/lib/apis/jenisorderan.api';
import { getBiayaFn } from '@/lib/apis/biaya.api';

const Page = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fieldLengthResult = await fieldLength('biayaemkl');
        dispatch(setFieldLength(fieldLengthResult.data));

        const [
          getBiayaLookup,
          getAkunpusatLookup,
          getJenisorderanLookup,
          getStatusAktifLookup
        ] = await Promise.all([
          getBiayaFn({ isLookUp: 'true' }),
          getAkunpusatFn({ isLookUp: 'true' }),
          getJenisOrderanFn({ isLookUp: 'true' }),
          getParameterFn({ isLookUp: 'true' })
        ]);

        if (getBiayaLookup.type === 'local') {
          dispatch(setData({ key: 'BIAYA', data: getBiayaLookup.data }));
          const defaultValue =
            getBiayaLookup.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';

          dispatch(setDefault({ key: 'BIAYA', isdefault: defaultValue }));
        }
        dispatch(setType({ key: 'BIAYA', type: getBiayaLookup.type }));

        if (getAkunpusatLookup.type === 'local') {
          // COA HUTANG
          dispatch(setData({ key: 'coahut', data: getAkunpusatLookup.data }));
          const defaultHutang =
            getAkunpusatLookup.data
              .map((item: any) => item.defaultHutang)
              .find((val: any) => val !== null) || '';
          dispatch(setDefault({ key: 'coahut', isdefault: defaultHutang }));
        }

        dispatch(setType({ key: 'coahut', type: getAkunpusatLookup.type }));

        if (getJenisorderanLookup.type === 'local') {
          dispatch(
            setData({ key: 'JENISORDERAN', data: getJenisorderanLookup.data })
          );
          const defaultValue =
            getJenisorderanLookup.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';

          dispatch(
            setDefault({ key: 'JENISORDERAN', isdefault: defaultValue })
          );
        }
        dispatch(
          setType({ key: 'JENISORDERAN', type: getJenisorderanLookup.type })
        );

        // Process Parameter lookup data dengan type safety
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
        }
      } catch (err) {
        console.error('Error fetching lookup data:', err);
      }
    };

    fetchData();
  }, [dispatch]);

  return (
    <PageContainer scrollable>
      <div className="grid h-fit grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-7 h-[500px]">
          <GridBank />
        </div>
      </div>
    </PageContainer>
  );
};

export default Page;
