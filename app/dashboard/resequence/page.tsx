import PageContainer from '@/components/layout/page-container';
import React from 'react';
import FormResequence from './components/FormResequence';
import { Tabs, TabsContent } from '@/components/ui/tabs';

const Page = () => {
  return (
    <PageContainer scrollable>
      <FormResequence />
    </PageContainer>
  );
};

export default Page;
