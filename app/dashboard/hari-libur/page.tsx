'use client';
import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setData, setType } from '@/lib/store/lookupSlice/lookupSlice';
import { getParameterFn } from '@/lib/apis/parameter.api';
import GridOffdays from './components/GridOffdays';

const Page = () => {
  return (
    <PageContainer scrollable>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsContent value="overview" className=" space-y-4">
          <div className="grid h-fit grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-10 h-[500px]">
              <GridOffdays />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default Page;
