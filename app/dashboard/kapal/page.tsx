'use client';

import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import React, { useEffect } from 'react';
import GridKapal from './components/GridKapal';
import { fieldLength } from '@/lib/apis/field-length.api';
import { setFieldLength } from '@/lib/store/field-length/fieldLengthSlice';
import { useDispatch } from 'react-redux';
const Page = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fieldLength('kapal');
        dispatch(setFieldLength(result.data));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error fetching data:', err);
      } finally {
      }
    };

    fetchData();
  }, [dispatch]);

  return (
    <PageContainer scrollable>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsContent value="overview" className="space-y-4">
          <div className="grid h-fit grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-10 h-[500px]">
              <GridKapal />
            </div>

            <div className="col-span-10 h-[500px]"></div>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default Page;
