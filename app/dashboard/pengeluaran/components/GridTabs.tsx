'use client';

import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import GridPengeluaranDetail from './GridPengeluaranDetail';
import GridJurnalUmumDetail from '../../jurnal-umum/components/GridJurnalUmumDetail';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';

export function GridTabs() {
  const headerData = useSelector((state: RootState) => state.header.headerData);
  const [activeTab, setActiveTab] = useState('pengeluarandetail'); // Track tab aktif
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
        <TabsTrigger value="pengeluarandetail">Pengeluaran Detail</TabsTrigger>
        <TabsTrigger value="jurnalumumdetail">Jurnal Umum Detail</TabsTrigger>
      </TabsList>

      <TabsContent value="pengeluarandetail" className="h-full">
        <GridPengeluaranDetail activeTab={activeTab} />
      </TabsContent>

      <TabsContent value="jurnalumumdetail" className="h-full">
        <GridJurnalUmumDetail activeTab={activeTab} />
      </TabsContent>
    </Tabs>
  );
}
