'use client';

import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import GridBank from './components/GridBank';
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
import { getAkunpusatFn } from '@/lib/apis/akunpusat.api';
import { IParameter } from '@/lib/types/parameter.type';

interface ApiResponse {
  type: string;
  data: any;
}

interface IAkunpusat {
  id: number;
  coa: number;
  keterangancoa: string;
  default?: number | string | null;
}

const Page = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fieldLengthResult = await fieldLength('bank');
        dispatch(setFieldLength(fieldLengthResult.data));

        const [getStatusAktifLookup, getAkunpusatLookup] = await Promise.all([
          getParameterFn({ isLookUp: 'true' }),
          getAkunpusatFn({ isLookUp: 'true' })
        ]);

        // Process Parameter lookup data dengan type safety
        if (
          getStatusAktifLookup.type === 'local' &&
          getStatusAktifLookup.data
        ) {
          const grpsToFilter = [
            'STATUS AKTIF',
            'STATUS NILAI',
            'STATUS RELASI',
            'STATUS APPROVAL',
            'STATUS BANK' // Tambahan untuk status bank
          ];

          grpsToFilter.forEach((grp) => {
            const filteredData = getStatusAktifLookup.data.filter(
              (item: IParameter) => item.grp === grp
            );

            if (filteredData.length > 0) {
              dispatch(setData({ key: grp, data: filteredData }));
              dispatch(setType({ key: grp, type: getStatusAktifLookup.type }));

              // Set default value jika ada
              const defaultItem = filteredData.find(
                (item: IParameter) => item.default !== null
              );
              const defaultValue = defaultItem
                ? String(defaultItem.default)
                : '';

              dispatch(setDefault({ key: grp, isdefault: defaultValue }));
            }
          });

          // Setup lookup untuk format-format yang ada di database
          const formatGroups = [
            { key: 'PENERIMAAN', subgrp: 'NOMOR PENERIMAAN' },
            { key: 'PENGELUARAN', subgrp: 'NOMOR PENGELUARAN' },
            { key: 'PENERIMAAN GANTUNG', subgrp: 'NOMOR PENERIMAAN GANTUNG' },
            { key: 'PENGELUARAN GANTUNG', subgrp: 'NOMOR PENGELUARAN GANTUNG' },
            { key: 'PENCAIRAN', subgrp: 'NOMOR PENCAIRAN' },
            { key: 'REKAP PENERIMAAN', subgrp: 'NOMOR REKAP PENERIMAAN' },
            { key: 'REKAP PENGELUARAN', subgrp: 'NOMOR REKAP PENGELUARAN' }
          ];

          // Setup untuk format groups
          formatGroups.forEach(({ key, subgrp }) => {
            const formatData = getStatusAktifLookup.data.filter(
              (item: IParameter) => item.subgrp === subgrp
            );

            if (formatData && formatData.length > 0) {
              dispatch(setData({ key, data: formatData }));
              dispatch(setType({ key, type: 'local' }));

              const defaultItem = formatData.find(
                (item: IParameter) => item.default !== null
              );
              const defaultValue = defaultItem
                ? String(defaultItem.default)
                : '';
              dispatch(setDefault({ key, isdefault: defaultValue }));
            }
          });

          // Setup untuk status bank jika belum ada di grpsToFilter
          const statusBankData = getStatusAktifLookup.data.filter(
            (item: IParameter) => item.grp === 'STATUS BANK'
          );

          if (statusBankData && statusBankData.length > 0) {
            dispatch(setData({ key: 'STATUS BANK', data: statusBankData }));
            dispatch(setType({ key: 'STATUS BANK', type: 'local' }));

            const defaultItem = statusBankData.find(
              (item: IParameter) => item.default !== null
            );
            const defaultValue = defaultItem ? String(defaultItem.default) : '';
            dispatch(
              setDefault({ key: 'STATUS BANK', isdefault: defaultValue })
            );
          }
        }

        if (getAkunpusatLookup.type === 'local') {
          dispatch(
            setData({ key: 'AKUNPUSAT', data: getAkunpusatLookup.data })
          );
          const defaultValue =
            getAkunpusatLookup.data
              .map((item: any) => item.default)
              .find((val: any) => val !== null) || '';

          dispatch(setDefault({ key: 'AKUNPUSAT', isdefault: defaultValue }));
        }
        dispatch(setType({ key: 'AKUNPUSAT', type: getAkunpusatLookup.type }));
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
