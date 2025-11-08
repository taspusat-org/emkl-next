'use client';

import React, { useEffect } from 'react';
import { RootState } from '@/lib/store/store';
import { getBankFn } from '@/lib/apis/bank.api';
import { useDispatch, useSelector } from 'react-redux';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { fieldLength } from '@/lib/apis/field-length.api';
import { getAlatbayarFn } from '@/lib/apis/alatbayar.api';
import PageContainer from '@/components/layout/page-container';
import { setFieldLength } from '@/lib/store/field-length/fieldLengthSlice';
import {
  setData,
  setType,
  setDefault
} from '@/lib/store/lookupSlice/lookupSlice';
import GridShippingInstruction from './components/GridShippingInstruction';
import FilterGrid from './components/FilterGrid';
import GridShippingInstructionDetail from './components/GridShippingInstructionDetail';
import GridShippingInstructionDetailRincian from './components/GridShippingInstructionDetailRincian';

interface ApiResponse {
  type: string;
  data: any; // Define a more specific type for data if possible
}

const Page = () => {
  const dispatch = useDispatch();
  const headerData = useSelector((state: RootState) => state.header.headerData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fieldLength('shippinginstruction');
        dispatch(setFieldLength(result.data));

        // const [getBankLookup, getAlatBayarLookup] =
        //   await Promise.all<ApiResponse>([
        //     getBankFn({ isLookUp: 'true' }),
        //     getAlatbayarFn({ isLookUp: 'true' })
        //   ]);

        // if (getBankLookup.type === 'local') {
        //   const multipleKey = ['BANK DARI', 'BANK KE'];

        //   multipleKey.forEach((labelKey) => {
        //     dispatch(setData({ key: labelKey, data: getBankLookup.data }));
        //     dispatch(setType({ key: labelKey, type: getBankLookup.type }));

        //     const defaultValue = getBankLookup.data
        //       .map((item: any) => item.default)
        //       .find((val: any) => val !== null || '');

        //     dispatch(
        //       setDefault({ key: labelKey, isdefault: String(defaultValue) })
        //     );
        //   });
        // }

        // if (getAlatBayarLookup.type === 'local') {
        //   dispatch(
        //     setData({ key: 'ALAT BAYAR', data: getAlatBayarLookup.data })
        //   );
        //   dispatch(
        //     setType({ key: 'ALAT BAYAR', type: getAlatBayarLookup.type })
        //   );

        //   const defaultValue = getAlatBayarLookup.data
        //     .map((item: any) => item.default)
        //     .find((val: any) => val !== null || '');

        //   dispatch(
        //     setDefault({ key: 'ALAT BAYAR', isdefault: String(defaultValue) })
        //   );
        // }
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
              <GridShippingInstruction />
            </div>
            <div className="col-span-10 h-[500px]">
              <GridShippingInstructionDetail />
            </div>
            <div className="col-span-10 h-[500px]">
              <GridShippingInstructionDetailRincian />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default Page;
