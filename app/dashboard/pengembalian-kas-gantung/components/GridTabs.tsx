'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import GridPengembalianKasGantungDetail from './GridPengembalianKasGantungDetail';
import GridJurnalUmumDetail from '../../jurnalumumheader/components/GridJurnalUmumDetail';
import GridPenerimaanDetail from '../../penerimaan/components/GridPenerimaanDetail';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';

export function GridTabs() {
  const headerData = useSelector((state: RootState) => state.header.headerData);
  const [activeTab, setActiveTab] = useState('pengembaliankasgantungdetail'); // Track tab aktif
  return (
    <Tabs
      defaultValue={activeTab}
      onValueChange={setActiveTab}
      className="h-full w-full"
    >
      <TabsList className="flex w-full flex-row justify-start gap-1 rounded-t-sm border border-border bg-background-grid-header">
        <TabsTrigger value="pengembaliankasgantungdetail">
          Pengembalian Kas Gantung Detail
        </TabsTrigger>
        <TabsTrigger value="penerimaandetail">Penerimaan Detail</TabsTrigger>
        <TabsTrigger value="jurnalumumdetail">Jurnal Umum Detail</TabsTrigger>
      </TabsList>

      <TabsContent value="pengembaliankasgantungdetail" className="h-full">
        <GridPengembalianKasGantungDetail activeTab={activeTab} />
      </TabsContent>

      <TabsContent value="jurnalumumdetail" className="h-full">
        <GridJurnalUmumDetail
          activeTab={activeTab}
          nobukti={headerData.penerimaan_nobukti}
        />
      </TabsContent>
      <TabsContent value="penerimaandetail" className="h-full">
        <GridPenerimaanDetail
          activeTab={activeTab}
          nobukti={headerData.penerimaan_nobukti}
        />
      </TabsContent>
    </Tabs>
  );
}
