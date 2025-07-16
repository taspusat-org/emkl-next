'use client';

import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import React from 'react';
import GridLogtrail from './components/GridLogtrail';
import GridHeader from './components/GridHeader';
import GridDetail from './components/GridDetail';
import { RootState } from '@/lib/store/store';
import { useSelector } from 'react-redux';
const Page = () => {
  const idHeader = useSelector((state: RootState) => state.logtrail.header);
  const idDetail = useSelector((state: RootState) => state.logtrail.detail);

  // const dispatch = useDispatch();

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const result = await getAllAcosFn({ limit: 0, isLookUp: true });
  //       if (result.type === 'local') {
  //         dispatch(setData(result.data));
  //         dispatch(setType(result.type));
  //       } else {
  //         dispatch(setType(result.type));
  //       }
  //     } catch (err) {
  //       console.error('Error fetching data:', err);
  //     } finally {
  //     }
  //   };

  //   fetchData();
  // }, [dispatch]);

  return (
    <PageContainer scrollable>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsContent value="overview" className="space-y-4">
          <div className="grid h-fit grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-10 h-[500px]">
              <GridLogtrail />
            </div>
            {idHeader ? (
              <div className="col-span-10 h-[500px]">
                <GridHeader />
              </div>
            ) : (
              ''
            )}
            {idDetail ? (
              <div className="col-span-10 h-[500px]">
                <GridDetail />
              </div>
            ) : (
              ''
            )}
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default Page;
