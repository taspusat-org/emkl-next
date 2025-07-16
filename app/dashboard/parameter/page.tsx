'use client';
import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setData, setType } from '@/lib/store/lookupSlice/lookupSlice';
import { getParameterFn } from '@/lib/apis/parameter.api';
import GridParameter from './components/GridParameter';

const Page = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetching data with isLookUp flag and filters
        const result = await getParameterFn({
          isLookUp: 'true', // Pass isLookUp inside filters
          filters: {
            grp: 'STATUS AKTIF' // Example filter
          }
        });

        // Handle the result based on its type
        if (result.type === 'local') {
          // Save local data to Redux with a unique key (e.g., 'Status Aktif')
          dispatch(setData({ key: 'Status Aktif', data: result.data }));

          // Ensure the type is set to 'local' in Redux
          dispatch(setType({ key: 'Status Aktif', type: result.type }));
        } else {
          // If the type is not local, just store the type (this can be expanded for JSON data handling)
          dispatch(setType({ key: 'Status Aktif', type: result.type }));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    // Call the fetchData function to fetch and store data
    fetchData();
  }, [dispatch]);

  return (
    <PageContainer scrollable>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsContent value="overview" className=" space-y-4">
          <div className="grid h-fit grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-10 h-[500px]">
              <GridParameter />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default Page;
