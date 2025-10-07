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
import { setProcessing } from '@/lib/store/loadingSlice/loadingSlice';
import InputDatePicker from '@/components/custom-ui/InputDatePicker';
import { getParameterFn } from '@/lib/apis/parameter.api';

interface ApiResponse {
  type: string;
  data: any; // Define a more specific type for data if possible
}

const FilterGrid = () => {
  const dispatch = useDispatch();
  const [popOverTglDari, setPopOverTglDari] = useState<boolean>(false);
  const [jenisOrderanNama, setJenisOrderanNama] = useState<string>('');
  const [jenisOrderan, setJenisOrderan] = useState<string | number>(0);
  const [dataJenisOrderParameter, setDataJenisOrderParameter] = useState<any[]>(
    []
  );
  const [popOverTgl, setPopOverTgl] = useState<boolean>(false);
  const { selectedDate, selectedDate2, onReload } = useSelector(
    (state: any) => state.filter
  );

  const lookUpJenisOrderan = [
    {
      columns: [{ key: 'nama', name: 'JENIS ORDERAN' }],
      labelLookup: 'JENIS ORDERAN LOOKUP',
      // required: true,
      selectedRequired: false,
      endpoint: 'JenisOrderan',
      label: 'JENIS ORDER',
      singleColumn: true,
      pageSize: 20,
      postData: 'nama',
      dataToPost: 'id'
    }
  ];

  const handleDateChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    dispatch(setSelectedDate(newValue)); // Dispatch to Redux
  };
  const handleDateChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    dispatch(setSelectedDate2(newValue)); // Dispatch to Redux
  };

  const handleCalendarSelect1 = (value: Date | undefined) => {
    if (value) {
      dispatch(setSelectedDate(String(value)));
      setPopOverTglDari(false);
    } else {
      setSelectedDate('');
    }
  };
  const handleCalendarSelect2 = (value: Date | undefined) => {
    if (value) {
      dispatch(setSelectedDate2(String(value)));
      setPopOverTgl(false); // Menutup popover setelah memilih tanggal
    } else {
      setSelectedDate(''); // Jika tidak ada tanggal yang dipilih, set menjadi kosong
    }
  };

  const onSubmit = () => {
    // dispatch(setProcessing());
    dispatch(setOnReload(true));
  };

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

  useEffect(() => {
    if (jenisOrderanNama || jenisOrderanNama != '' || jenisOrderan) {
      dispatch(setSelectedJenisOrderan(Number(jenisOrderan)));
    }
  }, [jenisOrderanNama, jenisOrderan, dispatch]);

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
          <div className="flex w-full flex-col items-center justify-between lg:flex-row">
            <label
              htmlFor=""
              className="w-full text-sm font-bold text-black lg:w-[20%]"
            >
              periode:
              <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
            </label>
            <div className="relative w-full lg:w-[30%]">
              <InputDatePicker
                value={selectedDate}
                showCalendar
                onChange={handleDateChange1}
                onSelect={handleCalendarSelect1}
              />
            </div>

            <div className="flex w-[20%] items-center justify-center">
              <p className="text-center text-sm font-bold text-black">S/D</p>
            </div>
            <div className="relative w-full lg:w-[30%]">
              <InputDatePicker
                value={selectedDate2}
                showCalendar
                onChange={handleDateChange2}
                onSelect={handleCalendarSelect2}
              />
            </div>
          </div>

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
                    console.log('onselect jenisorder', val);
                    // dispatch(setSelectedJenisOrderan(Number(val.id)));
                    dispatch(setSelectedJenisOrderanNama(val.nama));
                    setJenisOrderanNama(val.nama);
                    setJenisOrderan(val.id);
                  }}
                  onClear={() => {
                    setJenisOrderanNama('');
                    setJenisOrderan(0);
                    // dispatch(setSelectedJenisOrderan(null));
                    dispatch(setSelectedJenisOrderanNama(''));
                  }}
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
