'use client';

import { Tabs, TabsContent } from '@/components/ui/tabs';
import PageContainer from '@/components/layout/page-container';
import GridScheduleKapal from './component/GridScheduleKapal';

const Page = () => {
  return (
    <PageContainer scrollable>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsContent value="overview" className="space-y-4">
          <div className="grid h-fit grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-10 h-[500px]">
              <GridScheduleKapal />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default Page;
