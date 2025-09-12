'use client';

import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { fieldLength } from '@/lib/apis/field-length.api';
import { getParameterFn } from '@/lib/apis/parameter.api';
import { getAkunpusatFn } from '@/lib/apis/akunpusat.api';
import PageContainer from '@/components/layout/page-container';
import GridPengeluaranEmkl from './components/GridPengeluaranEmkl';
import { setFieldLength } from '@/lib/store/field-length/fieldLengthSlice';
import {
  setData,
  setType,
  setDefault
} from '@/lib/store/lookupSlice/lookupSlice';

interface ApiResponse {
  type: string;
  data: any; // Define a more specific type for data if possible
}

const Page = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fieldLength('pengeluaranemkl');
        dispatch(setFieldLength(result.data));

        const [getStatusAktifLookup, getAkunPusatLookup] =
          await Promise.all<ApiResponse>([
            getParameterFn({ isLookUp: 'true' }),
            getAkunpusatFn({ isLookUp: 'true' })
          ]);

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

          const formatData = getStatusAktifLookup.data.filter(
            (item: any) => item.kelompok != ''
          );
          dispatch(setData({ key: 'FORMAT', data: formatData }));
          dispatch(setType({ key: 'FORMAT', type: getStatusAktifLookup.type }));
          const defaultValue = getAkunPusatLookup.data
            .map((item: any) => item.default)
            .find((val: any) => val !== null || '');
          dispatch(
            setDefault({ key: 'FORMAT', isdefault: String(defaultValue) })
          );
        }

        if (getAkunPusatLookup.type === 'local') {
          const multipleKey = [
            'COA_DEBET',
            'COA_KREDIT',
            'COA_BANK_DEBET',
            'COA_BANK_KREDIT',
            'COA_HUTANG_DEBET',
            'COA_HUTANG_KREDIT'
          ];

          multipleKey.forEach((labelKey) => {
            dispatch(setData({ key: labelKey, data: getAkunPusatLookup.data }));
            dispatch(setType({ key: labelKey, type: getAkunPusatLookup.type }));

            const defaultValue = getAkunPusatLookup.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null || '');

            dispatch(
              setDefault({ key: labelKey, isdefault: String(defaultValue) })
            );
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
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsContent value="overview" className="space-y-4">
          <div className="grid h-fit grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-10 h-[500px]">
              <GridPengeluaranEmkl />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default Page;
