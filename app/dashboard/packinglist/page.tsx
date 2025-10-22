'use client';

import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { fieldLength } from '@/lib/apis/field-length.api';

import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setFieldLength } from '@/lib/store/field-length/fieldLengthSlice';
import { getRelasiFn } from '@/lib/apis/relasi.api';
import { getBankFn } from '@/lib/apis/bank.api';
import {
  setData,
  setDefault,
  setType
} from '@/lib/store/lookupSlice/lookupSlice';
import FilterGrid from './components/FilterGrid';
import { getAlatbayarFn } from '@/lib/apis/alatbayar.api';
import GridPackingList from './components/GridPackingList';
import GridPackingListDetail from './components/GridPackingListDetail';
interface ApiResponse {
  type: string;
  data: any; // Define a more specific type for data if possible
}

const Page = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetching field length data
        const fieldLengthResult = await fieldLength('menus');

        // Fetching data for BANK, ALAT BAYAR, and RELASI
        const [dataBank, dataAlatBayar, dataRelasi] =
          await Promise.all<ApiResponse>([
            getBankFn({ isLookUp: 'true' }),
            getAlatbayarFn({ isLookUp: 'true' }),
            getRelasiFn({ isLookUp: 'true' })
          ]);

        // Handle BANK data
        if (dataBank.type === 'local') {
          dispatch(setData({ key: 'BANK', data: dataBank.data }));
          const defaultValue =
            dataBank.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';

          // Dispatch the default data
          dispatch(setDefault({ key: 'BANK', isdefault: defaultValue }));
        }
        dispatch(setType({ key: 'BANK', type: dataBank.type }));

        // Handle ALAT BAYAR data
        if (dataAlatBayar.type === 'local') {
          dispatch(setData({ key: 'ALAT BAYAR', data: dataAlatBayar.data }));
          const defaultValue =
            dataAlatBayar.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';

          // Dispatch the default data
          dispatch(setDefault({ key: 'ALAT BAYAR', isdefault: defaultValue }));
        }
        dispatch(setType({ key: 'ALAT BAYAR', type: dataAlatBayar.type }));

        // Handle RELASI data
        if (dataRelasi.type === 'local') {
          dispatch(setData({ key: 'RELASI', data: dataRelasi.data }));
          const defaultValue =
            dataRelasi.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';

          // Dispatch the default data
          dispatch(setDefault({ key: 'RELASI', isdefault: defaultValue }));
        }
        dispatch(setType({ key: 'RELASI', type: dataRelasi.type }));

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
        <div className="col-span-10 border">
          <FilterGrid />
        </div>
        <div className="col-span-10 h-[500px]">
          <GridPackingList />
        </div>
        <div className="col-span-10 h-[500px]">
          <GridPackingListDetail activeTab="jurnalumumdetail" />
        </div>
      </div>
    </PageContainer>
  );
};

export default Page;
