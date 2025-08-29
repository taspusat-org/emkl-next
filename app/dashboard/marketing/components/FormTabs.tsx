'use client';

import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import GridMarketingDetail from './GridMarketingdetail';
import GridMarketingManager from './GridMarketingManager';
import GridMarketingProsesFee from './GridMarketingProsesFee';
import FormMarketingOrderan from './FormMarketingOrderan';
import FormMarketingBiaya from './FormMarketingBiaya';
import { useDispatch } from 'react-redux';
import { setTab } from '@/lib/store/tabSlice/tabSlice';

interface FormTabsProps {
  mode: string; // atau bisa enum, atau union misalnya "create" | "edit",
  forms: any;
}

export function FormTabs({ mode, forms }: FormTabsProps) {
  const dispatch = useDispatch();
  const [activeFormTab, setActiveFormTab] = useState('formMarketingOrderan'); // Track tab aktif

  useEffect(() => {
    dispatch(setTab('formMarketingOrderan'));
  }, [dispatch]);

  return (
    // <Tabs
    //   defaultValue={activeFormTab}
    //   onValueChange={setActiveFormTab}
    //   className="h-full w-full"
    // >

    <Tabs
      defaultValue={'formMarketingOrderan'}
      onValueChange={(value) => dispatch(setTab(value))}
      // className="h-full w-full"
      // className="mb-4"
    >
      <TabsList
        className="flex w-full flex-row flex-wrap justify-start gap-1 rounded-t-sm border border-blue-500"
        style={{
          background: 'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 100%)'
        }}
      >
        <TabsTrigger value="formMarketingOrderan">
          Marketing Orderan
        </TabsTrigger>
        <TabsTrigger value="formMarketingBiaya">Marketing Biaya</TabsTrigger>
        <TabsTrigger value="formMarketingManager">
          Marketing Manager
        </TabsTrigger>
        <TabsTrigger value="formMarketingProsesFee">
          Marketing Proses Fee
        </TabsTrigger>
      </TabsList>

      {/* <TabsContent value="formMarketingOrderan" className="h-full">
        <FormMarketingOrderan activeForm={activeFormTab} mode={mode} forms={forms} />
      </TabsContent>

      <TabsContent value="formMarketingBiaya" className="h-full">
        <FormMarketingBiaya activeForm={activeFormTab} mode={mode} forms={forms} />
      </TabsContent>

      <TabsContent value="marketingmanager" className="h-full">
        <GridMarketingManager activeTab={activeFormTab} />
      </TabsContent>

      <TabsContent value="marketingprosesfee" className="h-full">
        <GridMarketingProsesFee activeTab={activeFormTab} />
      </TabsContent> */}
    </Tabs>
  );
}
