'use client';

import React, { useEffect } from 'react';
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
  JENISORDERMUATAN
} from '@/constants/biayaextraheader';
import GridBiayaExtraHeader from './components/GridBiayaExtraHeader';
import GridBiayaExtraMuatanDetail from './components/GridBiayaExtraMuatanDetail';
import GridBiayaExtraBongkaranDetail from './components/GridBiayaExtraBongkaranDetail';

const Page = () => {
  const dispatch = useDispatch();
  const { selectedJenisOrderan, selectedJenisOrderanNama, onReload } =
    useSelector((state: RootState) => state.filter);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fieldLength('blheader');
        dispatch(setFieldLength(result.data));
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [dispatch]);

  const renderedGrid = () => {
    switch (selectedJenisOrderan) {
      case JENISORDERMUATAN:
        console.log('HEREEE');

        return <GridBiayaExtraMuatanDetail />;
      case JENISORDERBONGKARAN:
        console.log('ATAU HEREEE');

        return <GridBiayaExtraBongkaranDetail />;
      // return <></>
      case JENISORDERANIMPORT:
        return <></>;
      case JENISORDERANEXPORT:
        return <></>;
      default:
        console.log('ATAU HEREEE KAH');

        return <GridBiayaExtraMuatanDetail />;
    }
  };

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
            <div className="col-span-10 h-[500px]">{renderedGrid()}</div>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default Page;
