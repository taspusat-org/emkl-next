'use client';
import React, { useEffect, useState } from 'react';
import { CalendarIcon } from '@radix-ui/react-icons';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import InputMask from 'react-input-mask';
import LookUp from '@/components/custom-ui/LookUp';
import { useDispatch } from 'react-redux';
import {
  setOnReload,
  setSelectedDate,
  setSelectedDate2,
  setSelectedJenisOrderan,
  setSelectedJenisOrderanNama
} from '@/lib/store/filterSlice/filterSlice';
import { useSelector } from 'react-redux';
import { IoReload } from 'react-icons/io5';
import { Button } from '@/components/ui/button';
import { IoMdRefresh } from 'react-icons/io';
import InputDatePicker from '@/components/custom-ui/InputDatePicker';
import { JENISORDERMUATANNAMA } from '@/constants/bookingorderan';
import PeriodeValidation from '@/components/custom-ui/PeriodeValidate';

const FilterGrid = () => {
  const dispatch = useDispatch();
  const { onReload } = useSelector((state: any) => state.filter);
  const [triggerValidation, setTriggerValidation] = useState(false);

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

  const [jenisOrderanNama, setJenisOrderanNama] = useState<string>('');
  // const [dataJenisOrderParameter, setDataJenisOrderParameter] = useState<any[]>(
  //   []
  // );
  const lookUpJenisOrderan = [
    {
      columns: [{ key: 'subgrp', name: 'subgrp' }],
      labelLookup: 'JENIS ORDERAN LOOKUP',
      selectedRequired: false,
      endpoint: 'parameter?grp=jenis+orderan',
      label: 'JENIS ORDER',
      singleColumn: true,
      pageSize: 20,
      postData: 'subgrp',
      dataToPost: 'id'
    }
  ];

  useEffect(() => {
    const now = new Date();
    const fmt = (date: Date) =>
      `${String(date.getDate()).padStart(2, '0')}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}-${date.getFullYear()}`;

    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    dispatch(setSelectedDate(fmt(firstOfMonth)));
    dispatch(setSelectedDate2(fmt(lastOfMonth)));
  }, [dispatch]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const [getJenisOrderParameter] = await Promise.all<ApiResponse>([
  //         getParameterFn({
  //           isLookUp: 'true',
  //           filters: {
  //             grp: 'JENIS ORDERAN'
  //           }
  //         })
  //       ]);

  //       if (getJenisOrderParameter) {
  //         setDataJenisOrderParameter(getJenisOrderParameter.data ?? []);
  //       }
  //     } catch (err) {
  //       console.error('Error fetching data:', err);
  //     }
  //   };

  //   fetchData();
  // }, [dispatch]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const [getJenisOrderParameter] = await Promise.all<ApiResponse>([
  //         getParameterFn({
  //           isLookUp: 'true',
  //           filters: {
  //             grp: 'JENIS ORDERAN'
  //           }
  //         })
  //       ]);

  //       if (getJenisOrderParameter) {
  //         setDataJenisOrderParameter(getJenisOrderParameter.data ?? []);
  //       }
  //     } catch (err) {
  //       console.error('Error fetching data:', err);
  //     }
  //   };

  //   fetchData();
  // }, [dispatch]);

  // useEffect(() => {
  //   //

  //   if (jenisOrderanNama || jenisOrderanNama != '') {
  //     const formatData = dataJenisOrderParameter.filter(
  //       (item: any) => item.subgrp == jenisOrderanNama
  //     );

  //     dispatch(setSelectedJenisOrderan(formatData[0]?.id));
  //   }
  // }, [jenisOrderanNama]);

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

          <div className="mt-2 flex w-[50%] flex-col items-center justify-between lg:flex-row">
            <label
              htmlFor=""
              className="w-full text-sm font-bold text-black lg:w-[20%]"
            >
              Jenis Orderan:
              <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
            </label>
            <div className="relative w-full text-black lg:w-[60%]">
              {lookUpJenisOrderan.map((props, index) => (
                <LookUp
                  key={index}
                  {...props}
                  onSelectRow={(val) => {
                    dispatch(setSelectedJenisOrderan(Number(val.id)));
                    dispatch(setSelectedJenisOrderanNama(val.subgrp));
                    setJenisOrderanNama(val.nama);
                  }}
                  onClear={() => {
                    setJenisOrderanNama('');
                    dispatch(setSelectedJenisOrderan(null));
                    dispatch(setSelectedJenisOrderanNama(''));
                  }}
                  lookupNama={JENISORDERMUATANNAMA}
                />
              ))}
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
