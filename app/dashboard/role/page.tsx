import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import React from 'react';
import GridRoleAcl from './components/GridRoleAcl';
import GridRole from './components/GridRole';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';

const page = () => {
  return (
    <PageContainer scrollable>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsContent value="overview" className="space-y-4">
          <div className="grid h-fit grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-10 h-[500px]">
              <GridRole />
            </div>
            <div className="col-span-10 h-[500px]">
              <GridRoleAcl />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default page;
