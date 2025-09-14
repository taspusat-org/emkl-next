'use client';

import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import GridHutangDetail from './GridHutangDetail';
import GridJurnalUmumDetail from '../../jurnal-umum/components/GridJurnalUmumDetail';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';

export function GridTabs() {
  const [activeTab, setActiveTab] = useState('hutangdetail'); // Track tab aktif
  const headerData = useSelector((state: RootState) => state.header.headerData);
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
        <TabsTrigger value="hutangdetail">Hutang Detail</TabsTrigger>
        <TabsTrigger value="jurnalumumdetail">Jurnal Umum Detail</TabsTrigger>
      </TabsList>

      <TabsContent value="hutangdetail" className="h-full">
        <GridHutangDetail
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
