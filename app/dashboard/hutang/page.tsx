'use client';

import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { fieldLength } from '@/lib/apis/field-length.api';

import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setFieldLength } from '@/lib/store/field-length/fieldLengthSlice';
import { getRelasiFn } from '@/lib/apis/relasi.api';
import { getBankFn } from '@/lib/apis/bank.api';
import { getAkunpusatFn } from '@/lib/apis/akunpusat.api';
import { getAlatbayarFn } from '@/lib/apis/alatbayar.api';
import {
  setData,
  setDefault,
  setType
} from '@/lib/store/lookupSlice/lookupSlice';
import GridKasGantungHeader from './components/GridHutangHeader';
import GridKasGantungDetail from './components/GridHutangDetail';
import { IParameter } from '@/lib/types/parameter.type';
import FilterGrid from './components/FilterGrid';
import { getDaftarBankFn } from '@/lib/apis/daftarbank.api';
interface ApiResponse {
  type: string;
  data: any; // Define a more specific type for data if possible
}

const Page = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fieldLengthResult = await fieldLength('pengeluaran');
        dispatch(setFieldLength(fieldLengthResult.data));

        const [getRelasiLookup, getAkunpusatLookup] = await Promise.all([
          getRelasiFn({ isLookUp: 'true' }),
          getAkunpusatFn({ isLookUp: 'true' })
        ]);

        if (getRelasiLookup.type === 'local') {
          dispatch(setData({ key: 'RELASI', data: getRelasiLookup.data }));
          const defaultValue =
            getRelasiLookup.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';

          dispatch(setDefault({ key: 'RELASI', isdefault: defaultValue }));
        }
        dispatch(setType({ key: 'RELASI', type: getRelasiLookup.type }));

        if (getAkunpusatLookup.type === 'local') {
          dispatch(setData({ key: 'COA', data: getAkunpusatLookup.data }));
          const defaultValue =
            getAkunpusatLookup.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';

          dispatch(setDefault({ key: 'COA', isdefault: defaultValue }));
        }
        dispatch(setType({ key: 'COA', type: getAkunpusatLookup.type }));
      } catch (err) {
        console.error('Error fetching lookup data:', err);
      }
    };

    fetchData();
  }, [dispatch]);
  return (
    <PageContainer scrollable>
      <div className="grid h-fit grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-10 border">
          <FilterGrid />
        </div>
        <div className="col-span-10 h-[500px]">
          <GridKasGantungHeader />
        </div>
        <div className="col-span-10 h-[500px]">
          <GridKasGantungDetail />
        </div>
      </div>
    </PageContainer>
  );
};

export default Page;
