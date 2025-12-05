'use client';

import React, { useEffect, useMemo } from 'react';
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
import GridPanjarHeader from './components/GridPanjarHeader';
import GridPanjarMuatanDetail from './components/GridPanjarMuatanDetail';
import GridPanjarBongkaranDetail from './components/GridPanjaranBongkaranDetail';

const Page = () => {
  const dispatch = useDispatch();
  const { selectedJenisOrderan, selectedJenisOrderanNama, onReload } =
    useSelector((state: RootState) => state.filter);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fieldLength('panjarheader');
        dispatch(setFieldLength(result.data));
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [dispatch]);

  const renderedGrid = useMemo(() => {
    if (!onReload) {
      return <GridPanjarMuatanDetail />;
    }

    switch (selectedJenisOrderan) {
      case JENISORDERMUATAN:
        console.log('MUATAN');
        return <GridPanjarMuatanDetail />;
      case JENISORDERBONGKARAN:
        console.log('BONGKARAN');
        return <GridPanjarBongkaranDetail />;
      case JENISORDERANIMPORT:
        console.log('IMPORT');
        return <></>;
      case JENISORDERANEXPORT:
        console.log('EXPORT');
        return <></>;
      default:
        console.log('DEFAULT');
        return <GridPanjarMuatanDetail />;
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
              <GridPanjarHeader />
            </div>
            <div className="col-span-10 h-[500px]">{renderedGrid}</div>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default Page;
