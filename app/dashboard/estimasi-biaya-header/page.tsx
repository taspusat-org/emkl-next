'use client';

import React, { useEffect } from 'react';
import { RootState } from '@/lib/store/store';
import { useDispatch, useSelector } from 'react-redux';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { fieldLength } from '@/lib/apis/field-length.api';
import PageContainer from '@/components/layout/page-container';
import { setFieldLength } from '@/lib/store/field-length/fieldLengthSlice';
import GridEstimasiBiayaHeader from './components/GridEstimasiBiayaHeader';
import FilterGrid from './components/FilterGrid';
import { GridTabs } from './components/GridTabs';
import { getJenisOrderanFn } from '@/lib/apis/jenisorderan.api';
import {
  setData,
  setDefault,
  setType
} from '@/lib/store/lookupSlice/lookupSlice';
import { getShipperFn } from '@/lib/apis/shipper.api';
import { getAllOrderanMuatanFn } from '@/lib/apis/orderanHeader.api';
import { getParameterFn } from '@/lib/apis/parameter.api';
import { getComodityFn } from '@/lib/apis/comodity.api';
import { getConsigneeFn } from '@/lib/apis/consignee.api';

interface ApiResponse {
  type: string;
  data: any; // Define a more specific type for data if possible
}

const Page = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fieldLength('estimasibiayaheader');
        dispatch(setFieldLength(result.data));

        const [
          jenisOrderaranLookup,
          orderanHeaderLookup,
          shipperLookup,
          parameterLookup,
          comodityLookup,
          consigneeLookup
        ] = await Promise.all<ApiResponse>([
          getJenisOrderanFn({ isLookUp: 'true' }),
          getAllOrderanMuatanFn({ isLookUp: 'true' }),
          getShipperFn({ isLookUp: 'true' }),
          getParameterFn({ isLookUp: 'true' }),
          getComodityFn({ isLookUp: 'true' }),
          getConsigneeFn({ isLookUp: 'true' })
        ]);

        if (jenisOrderaranLookup.type === 'local') {
          dispatch(
            setData({ key: 'JENIS ORDERAN', data: jenisOrderaranLookup.data })
          );
          dispatch(
            setType({ key: 'JENIS ORDERAN', type: jenisOrderaranLookup.type })
          );

          const defaultValue =
            jenisOrderaranLookup.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';

          // Dispatch the default data
          dispatch(
            setDefault({ key: 'JENIS ORDERAN', isdefault: defaultValue })
          );
        }

        if (orderanHeaderLookup.type === 'local') {
          dispatch(
            setData({ key: 'ORDERAN LOOKUP', data: orderanHeaderLookup.data })
          );
          dispatch(
            setType({ key: 'ORDERAN LOOKUP', type: orderanHeaderLookup.type })
          );

          const defaultValue =
            orderanHeaderLookup.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';

          // Dispatch the default data
          dispatch(
            setDefault({ key: 'ORDERAN LOOKUP', isdefault: defaultValue })
          );
        }

        if (shipperLookup.type === 'local') {
          dispatch(setData({ key: 'SHIPPER', data: shipperLookup.data }));
          dispatch(setType({ key: 'SHIPPER', type: shipperLookup.type }));

          const defaultValue =
            shipperLookup.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';

          // Dispatch the default data
          dispatch(setDefault({ key: 'SHIPPER', isdefault: defaultValue }));
        }

        if (parameterLookup.type === 'local') {
          const statusNilaiData = parameterLookup.data.filter(
            (item: any) => item.grp === 'STATUS NILAI'
          );
          dispatch(setData({ key: 'STATUS PPN', data: statusNilaiData }));
          dispatch(setType({ key: 'STATUS PPN', type: parameterLookup.type }));

          const defaultValue = statusNilaiData
            .map((item: any) => item.default)
            .find((val: any) => val !== null || '');

          dispatch(
            setDefault({ key: 'STATUS PPN', isdefault: String(defaultValue) })
          );
        }

        if (comodityLookup.type === 'local') {
          dispatch(setData({ key: 'COMODITY', data: comodityLookup.data }));
          dispatch(setType({ key: 'COMODITY', type: comodityLookup.type }));

          const defaultValue =
            comodityLookup.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';

          // Dispatch the default data
          dispatch(setDefault({ key: 'COMODITY', isdefault: defaultValue }));
        }

        if (consigneeLookup.type === 'local') {
          dispatch(setData({ key: 'CONSIGNEE', data: consigneeLookup.data }));
          dispatch(setType({ key: 'CONSIGNEE', type: consigneeLookup.type }));

          const defaultValue =
            consigneeLookup.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';

          // Dispatch the default data
          dispatch(setDefault({ key: 'CONSIGNEE', isdefault: defaultValue }));
        }
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
            <div className="col-span-10 border">
              <FilterGrid />
            </div>
            <div className="col-span-10 h-[500px]">
              <GridEstimasiBiayaHeader />
            </div>

            <div className="col-span-10 h-[500px]">
              <GridTabs />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default Page;
