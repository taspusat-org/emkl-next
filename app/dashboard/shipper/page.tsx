'use client';

import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import GridShipper from './components/GridShipper';
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
import { getMarketingHeaderFn } from '@/lib/apis/marketingheader.api';
import { IParameter } from '@/lib/types/parameter.type';
import { getShipperFn } from '@/lib/apis/shipper.api';

interface ApiResponse {
  type: string;
  data: any;
}

interface IAkunpusat {
  id: number;
  coa: number;
  keterangancoa: string;
  default?: number | string | null;
}

const Page = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fieldLengthResult = await fieldLength('shipper');
        dispatch(setFieldLength(fieldLengthResult.data));

        const [
          getStatusAktifLookup,
          getAkunpusatLookup,
          getMarketingLookup,
          getShipperLookup
        ] = await Promise.all([
          getParameterFn({ isLookUp: 'true' }),
          getAkunpusatFn({ isLookUp: 'true' }),
          getMarketingHeaderFn({ isLookUp: 'true' }),
          getShipperFn({ isLookUp: 'true' })
        ]);

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

        if (getAkunpusatLookup.type === 'local') {
          dispatch(
            setData({ key: 'KETERANGANCOA', data: getAkunpusatLookup.data })
          );
          const defaultValue =
            getAkunpusatLookup.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';

          dispatch(
            setDefault({ key: 'KETERANGANCOA', isdefault: defaultValue })
          );
        }
        dispatch(
          setType({ key: 'KETERANGANCOA', type: getAkunpusatLookup.type })
        );

        if (getMarketingLookup.type === 'local') {
          dispatch(
            setData({ key: 'MARKETING', data: getMarketingLookup.data })
          );
          const defaultValue =
            getMarketingLookup.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';

          dispatch(setDefault({ key: 'MARKETING', isdefault: defaultValue }));
        }
        dispatch(setType({ key: 'MARKETING', type: getMarketingLookup.type }));

        if (getShipperLookup.type === 'local') {
          dispatch(setData({ key: 'SHIPPER', data: getShipperLookup.data }));
          const defaultValue =
            getShipperLookup.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';

          dispatch(setDefault({ key: 'SHIPPER', isdefault: defaultValue }));
        }
        dispatch(setType({ key: 'SHIPPER', type: getShipperLookup.type }));
      } catch (err) {
        console.error('Error fetching lookup data:', err);
      }
    };

    fetchData();
  }, [dispatch]);

  return (
    <PageContainer scrollable>
      <div className="grid h-fit grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-7 h-[600px]">
          <GridShipper />
        </div>
      </div>
    </PageContainer>
  );
};

export default Page;
