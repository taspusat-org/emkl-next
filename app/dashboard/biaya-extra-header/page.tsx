'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { RootState } from '@/lib/store/store';
import { useDispatch, useSelector } from 'react-redux';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { fieldLength } from '@/lib/apis/field-length.api';
import PageContainer from '@/components/layout/page-container';
import { setFieldLength } from '@/lib/store/field-length/fieldLengthSlice';
import FilterGrid from './components/FilterGrid';
import {
  JENISORDERANEXPORT,
  JENISORDERANIMPORT,
  JENISORDERBONGKARAN,
  JENISORDERBONGKARANNAMA,
  JENISORDEREKSPORTNAMA,
  JENISORDERIMPORTNAMA,
  JENISORDERMUATAN,
  JENISORDERMUATANNAMA
} from '@/constants/biayaextraheader';
import GridBiayaExtraHeader from './components/GridBiayaExtraHeader';
import GridBiayaExtraMuatanDetail from './components/GridBiayaExtraMuatanDetail';
import GridBiayaExtraBongkaranDetail from './components/GridBiayaExtraBongkaranDetail';
import { getJenisOrderanFn } from '@/lib/apis/jenisorderan.api';
import {
  setData,
  setDefault,
  setType
} from '@/lib/store/lookupSlice/lookupSlice';
import { getBiayaemklFn } from '@/lib/apis/biayaemkl.api';

interface ApiResponse {
  type: string;
  data: any; // Define a more specific type for data if possible
}

const Page = () => {
  const dispatch = useDispatch();
  const [modegrid, setModeGrid] = useState<string>('');
  const { selectedJenisOrderanNama, onReload } = useSelector(
    (state: RootState) => state.filter
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fieldLength('biayaextraheader');
        dispatch(setFieldLength(result.data));

        const [jenisOrderanFilterGridLookup, biayaEmklLookup] =
          await Promise.all<ApiResponse>([
            getJenisOrderanFn({ isLookUp: 'true' }),
            getBiayaemklFn({ isLookUp: 'true' })
          ]);

        if (jenisOrderanFilterGridLookup.type === 'local') {
          dispatch(
            setData({
              key: 'JENIS ORDER FILTER GRID',
              data: jenisOrderanFilterGridLookup.data
            })
          );
          dispatch(
            setType({
              key: 'JENIS ORDER FILTER GRID',
              type: jenisOrderanFilterGridLookup.type
            })
          );

          const defaultValue =
            jenisOrderanFilterGridLookup.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';

          dispatch(
            setDefault({
              key: 'JENIS ORDER FILTER GRID',
              isdefault: defaultValue
            })
          );
        }

        if (biayaEmklLookup.type === 'local') {
          dispatch(setData({ key: 'BIAYA EMKL', data: biayaEmklLookup.data }));
          dispatch(setType({ key: 'BIAYA EMKL', type: biayaEmklLookup.type }));

          const defaultValue =
            biayaEmklLookup.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';

          dispatch(setDefault({ key: 'BIAYA EMKL', isdefault: defaultValue }));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [dispatch]);

  useEffect(() => {
    if (onReload) {
      setModeGrid(selectedJenisOrderanNama);
    }
  }, [onReload, selectedJenisOrderanNama]);

  return (
    <PageContainer scrollable>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsContent value="overview" className="space-y-4">
          <div className="grid h-fit grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-10 border">
              <FilterGrid />
            </div>
            <div className="col-span-10 h-[500px]">
              <GridBiayaExtraHeader />
            </div>
            <div className="col-span-10 h-[500px]">
              {modegrid == JENISORDERMUATANNAMA ? (
                <GridBiayaExtraMuatanDetail />
              ) : modegrid == JENISORDERBONGKARANNAMA ? (
                <GridBiayaExtraBongkaranDetail />
              ) : modegrid == JENISORDERIMPORTNAMA ? (
                <></>
              ) : modegrid == JENISORDEREKSPORTNAMA ? (
                <></>
              ) : (
                <GridBiayaExtraMuatanDetail />
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default Page;
