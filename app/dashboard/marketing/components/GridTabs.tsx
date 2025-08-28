'use client';

import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import GridMarketingBiaya from './GridMarketingBiaya';
import GridMarketingDetail from './GridMarketingdetail';
import GridMarketingManager from './GridMarketingManager';
import GridMarketingOrderan from './GridMarketingOrderan';
import GridMarketingProsesFee from './GridMarketingProsesFee';

export function GridTabs() {
  const [activeTab, setActiveTab] = useState('marketingorderan'); // Track tab aktif
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
        <TabsTrigger value="marketingorderan">Marketing Orderan</TabsTrigger>
        <TabsTrigger value="marketingbiaya">Marketing Biaya</TabsTrigger>
        <TabsTrigger value="marketingmanager">Marketing Manager</TabsTrigger>
        <TabsTrigger value="marketingprosesfee">
          Marketing Proses Fee
        </TabsTrigger>
        {/* <TabsTrigger value="marketingdetail">Marketing Detail</TabsTrigger> */}
      </TabsList>

      <TabsContent value="marketingorderan" className="h-full">
        <GridMarketingOrderan activeTab={activeTab} />
      </TabsContent>

      <TabsContent value="marketingbiaya" className="h-full">
        <GridMarketingBiaya activeTab={activeTab} />
      </TabsContent>

      <TabsContent value="marketingmanager" className="h-full">
        <GridMarketingManager activeTab={activeTab} />
      </TabsContent>

      <TabsContent value="marketingprosesfee" className="h-full">
        <GridMarketingProsesFee activeTab={activeTab} />

        <div className="col-span-10 mt-4 h-[500px]">
          <GridMarketingDetail />
        </div>
      </TabsContent>

      {/* <TabsContent value="marketingdetail" className="h-full">
        <GridMarketingDetail activeTab={activeTab} />
      </TabsContent> */}
    </Tabs>
  );
}
