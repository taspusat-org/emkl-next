'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import GridJurnalUmumDetail from '../../jurnal-umum/components/GridJurnalUmumDetail';
import GridPenerimaanDetail from '../../penerimaan/components/GridPenerimaanDetail';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import GridPengeluaranDetail from '../../pengeluaran/components/GridPengeluaranDetail';
import GridPenerimaanEmklDetail from './GridPenerimaanEmklDetail';
import GridHutangDetail from '../../hutang/components/GridHutangDetail';

export function GridTabs() {
  const headerData = useSelector((state: RootState) => state.header.headerData);
  const [activeTab, setActiveTab] = useState('penerimaanemkldetail'); // Track tab aktif
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
        <TabsTrigger value="penerimaanemkldetail">
          Penerimaan EMKL Detail
        </TabsTrigger>
        <TabsTrigger value="penerimaandetail">
          Penerimaan KAS/BANK Detail
        </TabsTrigger>
        <TabsTrigger value="jurnalumumdetail">Jurnal Umum Detail</TabsTrigger>
      </TabsList>

      <TabsContent value="penerimaanemkldetail" className="h-full">
        <GridPenerimaanEmklDetail
          activeTab={activeTab}
          nobukti={headerData.nobukti}
        />
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
