'use client';

import PageContainer from '@/components/layout/page-container';
import { fieldLength } from '@/lib/apis/field-length.api';
import { setFieldLength } from '@/lib/store/field-length/fieldLengthSlice';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import GridMarketingGroup from './components/GridMarketingGroup';

const Page = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fieldLength('marketinggroup');
        dispatch(setFieldLength(result.data));
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
      }
    };
    fetchData();
  }, [dispatch]);
  return (
    <PageContainer scrollable>
      <div className="grid h-fit grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-10 h-[500px]">
          <GridMarketingGroup />
        </div>
      </div>
    </PageContainer>
  );
};

export default Page;
