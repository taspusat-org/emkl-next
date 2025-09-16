'use client';

import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import GridBank from './components/GridMasterbiaya';
import { fieldLength } from '@/lib/apis/field-length.api';

import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setFieldLength } from '@/lib/store/field-length/fieldLengthSlice';
import { getParameterFn } from '@/lib/apis/parameter.api';
import {
  setData,
  setDefault,
  setType
} from '@/lib/store/lookupSlice/lookupSlice';
import { IParameter } from '@/lib/types/parameter.type';
import { getTujuankapalFn } from '@/lib/apis/tujuankapal.api';
import { getSandarKapalFn } from '@/lib/apis/sandarkapal.api';
import { getPelayaranFn } from '@/lib/apis/pelayaran.api';
import { getContainerFn } from '@/lib/apis/container.api';
import { getBiayaemklFn } from '@/lib/apis/biayaemkl.api';
import { getJenisOrderanFn } from '@/lib/apis/jenisorderan.api';

const Page = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fieldLengthResult = await fieldLength('masterbiaya');
        dispatch(setFieldLength(fieldLengthResult.data));

        const [
          getTujuankapalLookup,
          getSandarkapalLookup,
          getPelayaranLookup,
          getContainerLookup,
          getBiayaemklLookup,
          getJenisorderanLookup,
          getStatusAktifLookup
        ] = await Promise.all([
          getTujuankapalFn({ isLookUp: 'true' }),
          getSandarKapalFn({ isLookUp: 'true' }),
          getPelayaranFn({ isLookUp: 'true' }),
          getContainerFn({ isLookUp: 'true' }),
          getBiayaemklFn({ isLookUp: 'true' }),
          getJenisOrderanFn({ isLookUp: 'true' }),
          getParameterFn({ isLookUp: 'true' })
        ]);

        if (getTujuankapalLookup.type === 'local') {
          dispatch(
            setData({ key: 'TUJUAN KAPAL', data: getTujuankapalLookup.data })
          );
          const defaultValue =
            getTujuankapalLookup.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';

          dispatch(
            setDefault({ key: 'TUJUAN KAPAL', isdefault: defaultValue })
          );
        }
        dispatch(
          setType({ key: 'TUJUAN KAPAL', type: getTujuankapalLookup.type })
        );

        if (getSandarkapalLookup.type === 'local') {
          dispatch(
            setData({ key: 'SANDAR KAPAL', data: getSandarkapalLookup.data })
          );
          const defaultValue =
            getSandarkapalLookup.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';

          dispatch(
            setDefault({ key: 'SANDAR KAPAL', isdefault: defaultValue })
          );
        }
        dispatch(
          setType({ key: 'SANDAR KAPAL', type: getSandarkapalLookup.type })
        );

        if (getTujuankapalLookup.type === 'local') {
          dispatch(
            setData({ key: 'TUJUAN KAPAL', data: getTujuankapalLookup.data })
          );
          const defaultValue =
            getTujuankapalLookup.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';

          dispatch(
            setDefault({ key: 'TUJUAN KAPAL', isdefault: defaultValue })
          );
        }
        dispatch(
          setType({ key: 'TUJUAN KAPAL', type: getTujuankapalLookup.type })
        );

        if (getPelayaranLookup.type === 'local') {
          dispatch(
            setData({ key: 'PELAYARAN', data: getPelayaranLookup.data })
          );
          const defaultValue =
            getPelayaranLookup.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';

          dispatch(setDefault({ key: 'PELAYARAN', isdefault: defaultValue }));
        }
        dispatch(setType({ key: 'PELAYARAN', type: getPelayaranLookup.type }));

        if (getContainerLookup.type === 'local') {
          dispatch(
            setData({ key: 'CONTAINER', data: getContainerLookup.data })
          );
          const defaultValue =
            getContainerLookup.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';

          dispatch(setDefault({ key: 'CONTAINER', isdefault: defaultValue }));
        }
        dispatch(setType({ key: 'CONTAINER', type: getContainerLookup.type }));

        if (getBiayaemklLookup.type === 'local') {
          dispatch(
            setData({ key: 'BIAYA EMKL', data: getBiayaemklLookup.data })
          );
          const defaultValue =
            getBiayaemklLookup.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';

          dispatch(setDefault({ key: 'BIAYA EMKL', isdefault: defaultValue }));
        }
        dispatch(setType({ key: 'BIAYA EMKL', type: getBiayaemklLookup.type }));

        if (getJenisorderanLookup.type === 'local') {
          dispatch(
            setData({ key: 'JENIS ORDERAN', data: getJenisorderanLookup.data })
          );
          const defaultValue =
            getJenisorderanLookup.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';

          dispatch(
            setDefault({ key: 'JENIS ORDERAN', isdefault: defaultValue })
          );
        }
        dispatch(
          setType({ key: 'JENIS ORDERAN', type: getJenisorderanLookup.type })
        );

        if (getStatusAktifLookup.type === 'local') {
          const grpsToFilter = ['STATUS AKTIF'];

          grpsToFilter.forEach((grp) => {
            const filteredData = getStatusAktifLookup.data.filter(
              (item: any) => item.grp === grp
            );

            dispatch(setData({ key: grp, data: filteredData }));
            dispatch(setType({ key: grp, type: getStatusAktifLookup.type }));

            const defaultValue = filteredData
              .map((item: any) => item.default)
              .find((val: any) => val !== null || '');

            dispatch(setDefault({ key: grp, isdefault: String(defaultValue) }));
          });
        }
      } catch (err) {
        console.error('Error fetching lookup data:', err);
      }
    };

    fetchData();
  }, [dispatch]);

  return (
    <PageContainer scrollable>
      <div className="grid h-fit grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-7 h-[600px]">
          <GridBank />
        </div>
      </div>
    </PageContainer>
  );
};

export default Page;
