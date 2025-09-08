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
import GridKasGantungHeader from './components/GridPengeluaranHeader';
import GridKasGantungDetail from './components/GridPengeluaranDetail';
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

        const [
          getRelasiLookup,
          getBankLookup,
          getAkunpusatLookup,
          getAlatbayarLookup,
          getDaftarbankLookup
        ] = await Promise.all([
          getRelasiFn({ isLookUp: 'true' }),
          getBankFn({ isLookUp: 'true' }),
          getAkunpusatFn({ isLookUp: 'true' }),
          getAlatbayarFn({ isLookUp: 'true' }),
          getDaftarBankFn({ isLookUp: 'true' })
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

        if (getBankLookup.type === 'local') {
          dispatch(setData({ key: 'BANK', data: getBankLookup.data }));
          const defaultValue =
            getBankLookup.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';

          dispatch(setDefault({ key: 'BANK', isdefault: defaultValue }));
        }
        dispatch(setType({ key: 'BANK', type: getBankLookup.type }));

        if (getAkunpusatLookup.type === 'local') {
          dispatch(
            setData({ key: 'COA KREDIT', data: getAkunpusatLookup.data })
          );
          const defaultValue =
            getAkunpusatLookup.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';

          dispatch(setDefault({ key: 'COA KREDIT', isdefault: defaultValue }));
        }
        dispatch(setType({ key: 'COA KREDIT', type: getAkunpusatLookup.type }));

        if (getAlatbayarLookup.type === 'local') {
          dispatch(
            setData({ key: 'ALAT BAYAR', data: getAlatbayarLookup.data })
          );
          const defaultValue =
            getAlatbayarLookup.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';

          dispatch(setDefault({ key: 'ALAT BAYAR', isdefault: defaultValue }));
        }
        dispatch(setType({ key: 'ALAT BAYAR', type: getAlatbayarLookup.type }));

        if (getDaftarbankLookup.type === 'local') {
          dispatch(
            setData({ key: 'DAFTAR BANK', data: getDaftarbankLookup.data })
          );
          const defaultValue =
            getDaftarbankLookup.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';

          dispatch(setDefault({ key: 'DAFTAR BANK', isdefault: defaultValue }));
        }
        dispatch(
          setType({ key: 'DAFTAR BANK', type: getDaftarbankLookup.type })
        );
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
