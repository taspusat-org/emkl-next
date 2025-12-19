'use client';

import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import GridEstimasiBiayaDetailBiaya from './GridEstimasiBiayaDetailBiaya';
import GridEstimasiBiayaDetailInvoice from './GridEstimasiBiayaDetailInvoice';

export function GridTabs() {
  const [activeTab, setActiveTab] = useState('detailbiaya'); // Track tab aktif
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
        <TabsTrigger value="detailbiaya">Detail Biaya</TabsTrigger>
        <TabsTrigger value="detailinvoice">Detail Invoice</TabsTrigger>
      </TabsList>

      <TabsContent value="detailbiaya" className="h-full">
        <GridEstimasiBiayaDetailBiaya activeTab={activeTab} />
      </TabsContent>

      <TabsContent value="detailinvoice" className="h-full">
        <GridEstimasiBiayaDetailInvoice activeTab={activeTab} />
      </TabsContent>
    </Tabs>
  );
}
