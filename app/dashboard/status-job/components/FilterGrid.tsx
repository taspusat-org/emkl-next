'use client';

import { IoMdRefresh } from 'react-icons/io';
import { Button } from '@/components/ui/button';
import React, { useEffect, useState } from 'react';
import LookUp from '@/components/custom-ui/LookUp';
import { useDispatch, useSelector } from 'react-redux';
import InputDatePicker from '@/components/custom-ui/InputDatePicker';
import {
  setOnReload,
  setSelectedDate,
  setSelectedDate2,
  setSelectedJenisOrderan,
  setSelectedJenisOrderanNama,
  setSelectedJenisStatusJob,
  setSelectedJenisStatusJobNama
} from '@/lib/store/filterSlice/filterSlice';
import {
  JENISORDERMUATAN,
  JENISORDERMUATANNAMA,
  statusJobMasukGudang,
  STATUSJOBMASUKGUDANGNAMA
} from '@/constants/statusjob';
import PeriodeValidation from '@/components/custom-ui/PeriodeValidate';

interface ApiResponse {
  type: string;
  data: any; // Define a more specific type for data if possible
}

const FilterGrid = () => {
  const dispatch = useDispatch();
  const { onReload } = useSelector((state: any) => state.filter);
  const [statusJobNama, setStatusJobNama] = useState<string>('');
  const [triggerValidation, setTriggerValidation] = useState(false);
  const [jenisOrderanNama, setJenisOrderanNama] = useState<string>('');

  const lookUpJenisOrderan = [
    {
      columns: [{ key: 'nama', name: 'JENIS ORDERAN' }],
      labelLookup: 'JENIS ORDERAN LOOKUP',
      selectedRequired: false,
      endpoint: 'JenisOrderan',
      label: 'JENIS ORDER',
      singleColumn: true,
      pageSize: 20,
      postData: 'nama',
      dataToPost: 'id'
    }
  ];

  const lookUpJenisStatus = [
    {
      columns: [{ key: 'text', name: 'NAMA' }],
      labelLookup: 'JENIS STATUS LOOKUP',
      selectedRequired: false,
      endpoint: jenisOrderanNama
        ? `parameter?grp=data+status+job&subgrp=orderan${jenisOrderanNama.toLowerCase()}`
        : `parameter?grp=flagnull`,
      label: 'JENIS STATUS',
      singleColumn: true,
      pageSize: 20,
      postData: 'text',
      dataToPost: 'id'
    }
  ];

  const onSubmit = () => {
    setTriggerValidation(true);
  };

  const handleValidationResult = (isValid: boolean) => {
    if (triggerValidation) {
      if (isValid) {
        dispatch(setOnReload(true));
      }
      setTriggerValidation(false);
    }
  };

  useEffect(() => {
    const now = new Date();
    const fmt = (date: Date) =>
      `${String(date.getDate()).padStart(2, '0')}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}-${date.getFullYear()}`;

    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Set tanggal
    dispatch(setSelectedDate(fmt(firstOfMonth)));
    dispatch(setSelectedDate2(fmt(lastOfMonth)));

    // ✅ Set default jenis orderan dan status job
    dispatch(setSelectedJenisOrderan(JENISORDERMUATAN));
    dispatch(setSelectedJenisOrderanNama(JENISORDERMUATANNAMA));
    dispatch(setSelectedJenisStatusJob(statusJobMasukGudang));
    dispatch(setSelectedJenisStatusJobNama(STATUSJOBMASUKGUDANGNAMA));

    // Set local state
    setJenisOrderanNama(JENISORDERMUATANNAMA);
    setStatusJobNama(STATUSJOBMASUKGUDANGNAMA);
  }, [dispatch]);

  useEffect(() => {
    if (onReload) {
      // Simulate a reload operation
      dispatch(setOnReload(false));
    }
  }, [onReload]);

  return (
    <div className={`flex h-[100%] w-full justify-center`}>
      <div className="flex h-[100%]  w-full flex-col rounded-sm border border-blue-500 bg-white">
        <div
          className="flex h-[30px] w-full flex-row items-center rounded-t-sm border-b border-blue-500 px-2"
          style={{
            background: 'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 100%)'
          }}
        />
        <div className="bg-white p-4">
          <PeriodeValidation
            label="periode"
            onValidationChange={handleValidationResult}
            triggerValidation={triggerValidation}
          />

          <div className="flex flex-col justify-between lg:flex-row">
            <div className="mt-2 flex w-[50%] flex-col items-center justify-between lg:flex-row">
              <label
                htmlFor=""
                className="w-full text-sm font-bold text-black lg:w-[20%]"
              >
                Jenis Orderan:
                {/* <span style={{ color: 'red', marginLeft: '4px' }}>*</span> */}
              </label>
              <div className="relative w-full text-black lg:w-[60%]">
                {lookUpJenisOrderan.map((props, index) => (
                  <LookUp
                    key={index}
                    {...props}
                    onSelectRow={(val) => {
                      setJenisOrderanNama(val.nama);
                      dispatch(setSelectedJenisOrderan(Number(val.id)));
                      dispatch(setSelectedJenisOrderanNama(val.nama));
                    }}
                    onClear={() => {
                      setJenisOrderanNama('');
                      dispatch(setSelectedJenisOrderan(null));
                      dispatch(setSelectedJenisOrderanNama(''));
                    }}
                    lookupNama={
                      jenisOrderanNama ? jenisOrderanNama : JENISORDERMUATANNAMA
                    }
                  />
                ))}
              </div>
            </div>

            <div className="mt-6 flex w-[50%] flex-col items-center justify-between lg:flex-row">
              <label
                htmlFor=""
                className="ml-[108px] w-full text-sm font-bold text-black lg:w-[20%]"
              >
                Jenis Status:
                {/* <span style={{ color: 'red', marginLeft: '4px' }}>*</span> */}
              </label>
              <div className="relative w-full text-black lg:w-[60%]">
                {lookUpJenisStatus.map((props, index) => (
                  <LookUp
                    key={index}
                    {...props}
                    onSelectRow={(val) => {
                      setStatusJobNama(val.nama);
                      dispatch(setSelectedJenisStatusJob(Number(val.id)));
                      dispatch(setSelectedJenisStatusJobNama(val.text));
                    }}
                    onClear={() => {
                      setStatusJobNama('');
                      dispatch(setSelectedJenisStatusJob(null));
                      dispatch(setSelectedJenisStatusJobNama(''));
                    }}
                    lookupNama={
                      statusJobNama ? statusJobNama : STATUSJOBMASUKGUDANGNAMA
                    }
                  />
                ))}
              </div>
            </div>
          </div>

          <Button
            variant="default"
            className="mt-2 flex flex-row items-center justify-center"
            onClick={onSubmit}
          >
            <IoMdRefresh />
            <p style={{ fontSize: 12 }} className="font-normal">
              Reload
            </p>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterGrid;
