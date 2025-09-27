'use client';

import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import GridPengeluaranDetail from '../../pengeluaran/components/GridPengeluaranDetail';
import GridJurnalUmumDetail from '../../jurnalumumheader/components/GridJurnalUmumDetail';
import GridKasGantungDetail from './GridKasGantungDetail';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';

export function GridTabs() {
  const headerData = useSelector((state: RootState) => state.header.headerData);
  const [activeTab, setActiveTab] = useState('kasgantungdetail'); // Track tab aktif
  return (
    <Tabs
      defaultValue={activeTab}
      onValueChange={setActiveTab}
      className="h-full w-full"
    >
      <TabsList
        className="flex w-full flex-row flex-wrap justify-start gap-1 rounded-t-sm border border-blue-500"
        style={{
          background: 'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 100%)'
        }}
      >
        <TabsTrigger value="kasgantungdetail">Kas Gantung Detail</TabsTrigger>
        <TabsTrigger value="pengeluarandetail">Pengeluaran Detail</TabsTrigger>
        <TabsTrigger value="jurnalumumdetail">Jurnal Umum Detail</TabsTrigger>
      </TabsList>

      <TabsContent value="kasgantungdetail" className="h-full">
        <GridKasGantungDetail
          activeTab={activeTab}
          nobukti={headerData?.nobukti}
        />
      </TabsContent>

      <TabsContent value="pengeluarandetail" className="h-full">
        <GridPengeluaranDetail
          activeTab={activeTab}
          nobukti={headerData?.pengeluaran_nobukti}
        />
      </TabsContent>

      <TabsContent value="jurnalumumdetail" className="h-full">
        <GridJurnalUmumDetail
          activeTab={activeTab}
          nobukti={headerData?.pengeluaran_nobukti}
        />
      </TabsContent>
    </Tabs>
  );
}
