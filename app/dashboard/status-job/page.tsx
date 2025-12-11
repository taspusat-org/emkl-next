'use client';

import FilterGrid from './components/FilterGrid';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fieldLength } from '@/lib/apis/field-length.api';
import PageContainer from '@/components/layout/page-container';
import {
  setData,
  setDefault,
  setType
} from '@/lib/store/lookupSlice/lookupSlice';
import { RootState } from '@/lib/store/store';
import {
  JENISORDERMUATAN,
  JENISORDERANIMPORT,
  JENISORDERANEKSPORT,
  JENISORDERBONGKARAN,
  statusJobMasukGudang,
  statusJobTurunDepo,
  statusJobKeluarGudang,
  statusJobTerimaSjPabrik,
  JENISORDERMUATANNAMA,
  STATUSJOBMASUKGUDANGNAMA,
  JENISORDERBONGKARANNAMA,
  JENISORDERANIMPORTNAMA,
  JENISORDERANEKSPORTNAMA,
  statusJobTurunDepoNama,
  statusJobKeluarGudangNama,
  statusJobTerimaSjPabrikNama
} from '@/constants/statusjob';
import GridStatusJobMasukGudang from './components/GridStatusJobMasukGudang';
import GridStatusJob from './components/GridStatusJob';

interface ApiResponse {
  type: string;
  data: any; // Define a more specific type for data if possible
}

const Page = () => {
  const dispatch = useDispatch();
  const [modegrid, setModeGrid] = useState<string>('');
  const [modegridStatusJob, setModeGridStatusJob] = useState<string>('');
  const { selectedJenisOrderanNama, selectedJenisStatusJobNama, onReload } =
    useSelector((state: RootState) => state.filter);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fieldLengthResult = await fieldLength('statusjob');
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [dispatch]);

  // const renderedGrid = () => {
  //   switch (selectedJenisOrderan) {
  //     case JENISORDERMUATAN:
  //       switch (selectedJenisStatusJob) {
  //         case statusJobMasukGudang:
  //           return <GridStatusJobMasukGudang />;
  //         case statusJobTurunDepo:
  //           return <></>;
  //         case statusJobKeluarGudang:
  //           return <></>;
  //         case statusJobTerimaSjPabrik:
  //           return <></>;
  //         default:
  //           return <GridStatusJobMasukGudang />;
  //       }

  //     case JENISORDERBONGKARAN:
  //       return <></>;
  //     case JENISORDERANIMPORT:
  //       return <></>;
  //     case JENISORDERANEKSPORT:
  //       return <></>;

  //     default:
  //       switch (selectedJenisStatusJob) {
  //         case statusJobMasukGudang:
  //           return <GridStatusJobMasukGudang />;
  //         default:
  //           return <GridStatusJobMasukGudang />;
  //       }
  //   }
  // };

  useEffect(() => {
    if (onReload) {
      setModeGrid(selectedJenisOrderanNama);
      setModeGridStatusJob(selectedJenisStatusJobNama);
    }
  }, [onReload, selectedJenisOrderanNama, selectedJenisStatusJobNama]);

  return (
    <PageContainer scrollable>
      <div className="grid h-fit grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-10 border">
          <FilterGrid />
        </div>
        <div className="col-span-10 h-[500px]">
          <GridStatusJob />
        </div>
        <div className="col-span-10 h-[500px]">
          {/* {renderedGrid} */}
          {modegrid == JENISORDERMUATANNAMA ? (
            modegridStatusJob === STATUSJOBMASUKGUDANGNAMA ? (
              <GridStatusJobMasukGudang />
            ) : modegridStatusJob === statusJobTurunDepoNama ? (
              <></>
            ) : modegridStatusJob === statusJobKeluarGudangNama ? (
              <></>
            ) : modegridStatusJob === statusJobTerimaSjPabrikNama ? (
              <></>
            ) : (
              <GridStatusJobMasukGudang />
            )
          ) : modegrid == JENISORDERBONGKARANNAMA ? (
            <></>
          ) : modegrid == JENISORDERANIMPORTNAMA ? (
            <></>
          ) : modegrid == JENISORDERANEKSPORTNAMA ? (
            <></>
          ) : (
            <GridStatusJobMasukGudang />
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default Page;
