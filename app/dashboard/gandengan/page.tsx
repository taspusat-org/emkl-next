'use client';

import GridGandengan from './components/GridGandengan';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import PageContainer from '@/components/layout/page-container';

const Page = () => {
  return (
    <PageContainer scrollable>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsContent value="overview" className="space-y-4">
          <div className="grid h-fit grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-10 h-[500px]">
              <GridGandengan />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default Page;
