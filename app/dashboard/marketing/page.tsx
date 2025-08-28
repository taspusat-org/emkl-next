'use client';
import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import React, { useEffect } from 'react';
import { GridTabs } from './components/GridTabs';
import { useDispatch } from 'react-redux';
import { getParameterFn } from '@/lib/apis/parameter.api';
import {
  setData,
  setDefault,
  setType
} from '@/lib/store/lookupSlice/lookupSlice';
import GridMarketing from './components/GridMarketing';
import { fieldLength } from '@/lib/apis/field-length.api';
import { setFieldLength } from '@/lib/store/field-length/fieldLengthSlice';
import GridMarketingDetail from './components/GridMarketingdetail';
import { getMarketingGroupFn } from '@/lib/apis/marketinggroup.api';

interface ApiResponse {
  type: string;
  data: any; // Define a more specific type for data if possible
}

const Page = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fieldLength('marketing');
        dispatch(setFieldLength(result.data));

        const [getStatusAktifLookup, getMarketingGroupLookup] =
          await Promise.all<ApiResponse>([
            getParameterFn({ isLookUp: 'true' }),
            getMarketingGroupFn({ isLookUp: 'true' })
          ]);

        if (getStatusAktifLookup.type === 'local') {
          const multipleUsing = [
            'STATUS TARGET',
            'STATUS BAGI FEE',
            'STATUS FEE MANAGER',
            'STATUS PRA FEE'
          ];

          const statusAktifData = getStatusAktifLookup.data.filter(
            (item: any) => item.grp === 'STATUS AKTIF'
          );
          const statusNilaiData = getStatusAktifLookup.data.filter(
            (item: any) => item.grp === 'STATUS NILAI'
          );
          // grpsToFilter.forEach((grp) => {
          //   const filteredData = getStatusAktifLookup.data.filter(
          //     (item: any) => item.grp === grp
          //   );
          //   // console.log('ini hasil filterdData',filteredData, grp);

          //   dispatch(setData({ key: grp, data: filteredData }));
          //   dispatch(setType({ key: grp, type: getStatusAktifLookup.type }));

          //   const defaultValue = filteredData
          //     .map((item: any) => item.default)
          //     .find((val: any) => val !== null || '');

          //   dispatch(setDefault({ key: grp, isdefault: String(defaultValue) }));
          // });

          dispatch(setData({ key: 'STATUS AKTIF', data: statusAktifData }));
          dispatch(
            setType({ key: 'STATUS AKTIF', type: getStatusAktifLookup.type })
          );
          const defaultValueStatusAktif = statusNilaiData
            .map((item: any) => item.default)
            .find((val: any) => val !== null || '');
          dispatch(
            setDefault({
              key: 'STATUS AKTIF',
              isdefault: String(defaultValueStatusAktif)
            })
          );

          multipleUsing.forEach((labelKey) => {
            dispatch(setData({ key: labelKey, data: statusNilaiData }));
            dispatch(
              setType({ key: labelKey, type: getStatusAktifLookup.type })
            );

            const defaultValue = statusNilaiData
              .map((item: any) => item.default)
              .find((val: any) => val !== null || '');

            dispatch(
              setDefault({ key: labelKey, isdefault: String(defaultValue) })
            );
          });
        }

        if (getMarketingGroupLookup.type === 'local') {
          dispatch(
            setData({
              key: 'MARKETING GROUP',
              data: getMarketingGroupLookup.data
            })
          );
          dispatch(
            setType({
              key: 'MARKETING GROUP',
              type: getMarketingGroupLookup.type
            })
          );
          const defaultValue =
            getMarketingGroupLookup.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';
          dispatch(
            setDefault({ key: 'MARKETING GROUP', isdefault: defaultValue })
          );
        }
      } catch (err) {
        console.error('Error fetching data:', err);
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
              <GridMarketing />
            </div>

            <div className="col-span-10 h-[500px]">
              <GridTabs />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default Page;
