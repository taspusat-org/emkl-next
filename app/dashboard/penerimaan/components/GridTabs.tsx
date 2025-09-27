'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import GridJurnalUmumDetail from '../../jurnalumumheader/components/GridJurnalUmumDetail';
import GridPenerimaanDetail from '../../penerimaan/components/GridPenerimaanDetail';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';

export function GridTabs() {
  const headerData = useSelector((state: RootState) => state.header.headerData);
  const [activeTab, setActiveTab] = useState('penerimaandetail'); // Track tab aktif
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
        <TabsTrigger value="penerimaandetail">Penerimaan Detail</TabsTrigger>
        <TabsTrigger value="jurnalumumdetail">Jurnal Umum Detail</TabsTrigger>
      </TabsList>

      <TabsContent value="jurnalumumdetail" className="h-full">
        <GridJurnalUmumDetail
          activeTab={activeTab}
          nobukti={headerData.nobukti}
        />
      </TabsContent>
      <TabsContent value="penerimaandetail" className="h-full">
        <GridPenerimaanDetail
          activeTab={activeTab}
          nobukti={headerData.nobukti}
        />
      </TabsContent>
    </Tabs>
  );
}
