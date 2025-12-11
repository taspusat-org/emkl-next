'use client';

import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setTab } from '@/lib/store/tabSlice/tabSlice';

interface FormTabsProps {
  mode: string; // atau bisa enum, atau union misalnya "create" | "edit",
  forms: any;
}

export function FormTabs({ mode, forms }: FormTabsProps) {
  const dispatch = useDispatch();
  const [activeFormTab, setActiveFormTab] = useState('detailbiaya'); // Track tab aktif

  useEffect(() => {
    dispatch(setTab('detailbiaya'));
  }, [dispatch]);

  return (
    <Tabs
      defaultValue={'detailbiaya'}
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
        <TabsTrigger value="detailbiaya">Detail Biaya</TabsTrigger>
        <TabsTrigger value="detailinvoice">Detail Invoice</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
