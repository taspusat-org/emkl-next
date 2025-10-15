'use client';

import FilterGrid from './components/FilterGrid';
import React, { useEffect, useState } from 'react';
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
  statusJobTerimaSjPabrik
} from '@/constants/statusjob';
import GridStatusJobMasukGudang from './components/GridStatusJobMasukGudang';
import GridStatusJob from './components/GridStatusJob';

interface ApiResponse {
  type: string;
  data: any; // Define a more specific type for data if possible
}

const Page = () => {
  const dispatch = useDispatch();
  const {
    selectedJenisOrderan,
    selectedJenisOrderanNama,
    selectedJenisStatusJob,
    selectedJenisStatusJobNama
  } = useSelector((state: RootState) => state.filter);
  // console.log('selectedJenisOrderan di page',selectedJenisOrderan, 'selectedJenisOrderanNama di page', selectedJenisOrderanNama, 'selectedJenisStatusJob do page',selectedJenisStatusJob, 'selectedJenisStatusJobNama di page', selectedJenisStatusJobNama);

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

  const renderedGrid = () => {
    switch (selectedJenisOrderan) {
      case JENISORDERMUATAN:
        switch (selectedJenisStatusJob) {
          case statusJobMasukGudang:
            return <GridStatusJobMasukGudang />;
          case statusJobTurunDepo:
            return <></>;
          case statusJobKeluarGudang:
            return <></>;
          case statusJobTerimaSjPabrik:
            return <></>;
          default:
            return <GridStatusJobMasukGudang />;
        }

      case JENISORDERBONGKARAN:
        return <></>;
      case JENISORDERANIMPORT:
        return <></>;
      case JENISORDERANEKSPORT:
        return <></>;

      default:
        switch (selectedJenisStatusJob) {
          case statusJobMasukGudang:
            return <GridStatusJobMasukGudang />;
          default:
            return <GridStatusJobMasukGudang />;
        }
    }
  };

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
          {/* <GridBookingMuatan /> */}
          {renderedGrid()}
        </div>
      </div>
    </PageContainer>
  );
};

export default Page;
