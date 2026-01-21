'use client';

import React, { useEffect, useState } from 'react';
import { RootState } from '@/lib/store/store';
import { useDispatch, useSelector } from 'react-redux';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { fieldLength } from '@/lib/apis/field-length.api';
import PageContainer from '@/components/layout/page-container';
import { setFieldLength } from '@/lib/store/field-length/fieldLengthSlice';
import {
  setData,
  setDefault,
  setType
} from '@/lib/store/lookupSlice/lookupSlice';
import GridBiayaHeader from './components/GridBiayaHeader';
import FilterGrid from './components/FilterGrid';
import {
  JENISORDERANEXPORT,
  JENISORDERANIMPORT,
  JENISORDERBONGKARAN,
  JENISORDERMUATAN
} from '@/constants/biayaheader';
import GridBiayaMuatanDetail from './components/GridBiayaMuatanDetail';

interface ApiResponse {
  type: string;
  data: any; // Define a more specific type for data if possible
}

const Page = () => {
  const dispatch = useDispatch();
  const [modegrid, setModeGrid] = useState<number>();
  const { selectedJenisOrderan, selectedJenisOrderanNama, onReload } =
    useSelector((state: RootState) => state.filter);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fieldLength('biayaheader');
        dispatch(setFieldLength(result.data));

        // const [
        //   jenisOrderaranLookup,
        // ] = await Promise.all<ApiResponse>([
        //   getJenisOrderanFn({ isLookUp: 'true' }),
        // ]);

        // if (jenisOrderaranLookup.type === 'local') {
        //   dispatch(
        //     setData({ key: 'JENIS ORDERAN', data: jenisOrderaranLookup.data })
        //   );
        //   dispatch(
        //     setType({ key: 'JENIS ORDERAN', type: jenisOrderaranLookup.type })
        //   );

        //   const defaultValue =
        //     jenisOrderaranLookup.data
        //       .map((item: any) => item.default)
        //       .find((val: any) => val !== null) || '';

        //   // Dispatch the default data
        //   dispatch(
        //     setDefault({ key: 'JENIS ORDERAN', isdefault: defaultValue })
        //   );
        // }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [dispatch]);

  useEffect(() => {
    if (onReload) {
      setModeGrid(Number(selectedJenisOrderan));
    }
  }, [onReload, selectedJenisOrderan]);

  return (
    <PageContainer scrollable>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsContent value="overview" className="space-y-4">
          <div className="grid h-fit grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-10 border">
              <FilterGrid />
            </div>
            <div className="col-span-10 h-[500px]">
              <GridBiayaHeader />
            </div>

            <div className="col-span-10 h-[500px]">
              {modegrid == JENISORDERMUATAN ? (
                <GridBiayaMuatanDetail />
              ) : modegrid == JENISORDERBONGKARAN ? (
                <></>
              ) : modegrid == JENISORDERANIMPORT ? (
                <></>
              ) : modegrid == JENISORDERANEXPORT ? (
                <></>
              ) : (
                <GridBiayaMuatanDetail />
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default Page;
