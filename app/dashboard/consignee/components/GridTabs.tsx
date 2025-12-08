import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GridConsigneeDetail from './GridConsigneeDetail';
import GridConsigneeBiaya from './GridConsigneebIAYA';
import GridConsigneeHargaJual from './GridConsigneeHargaJual';
import { useState } from 'react';

export function GridTabs() {
  const [activeTab, setActiveTab] = useState('consigneedetail'); // Track tab aktif
  return (
    <Tabs
      defaultValue={activeTab}
      onValueChange={setActiveTab}
      className="h-full w-full"
    >
      <TabsList
        className="flex w-full flex-row justify-start gap-1 rounded-t-sm border border-blue-500"
        style={{
          background: 'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 100%)'
        }}
      >
        <TabsTrigger value="consigneedetail">Consignee Detail</TabsTrigger>
        <TabsTrigger value="consigneebiaya">Consignee Biaya</TabsTrigger>
        <TabsTrigger value="consigneehargajual">
          Consignee Harga Jual
        </TabsTrigger>
      </TabsList>
      <TabsContent value="consigneedetail" className="h-full">
        <GridConsigneeDetail activeTab={activeTab} />
      </TabsContent>
      <TabsContent value="consigneebiaya" className="h-full">
        <GridConsigneeBiaya activeTab={activeTab} />
      </TabsContent>
      <TabsContent value="consigneehargajual" className="h-full">
        <GridConsigneeHargaJual activeTab={activeTab} />
      </TabsContent>
    </Tabs>
  );
}
