'use client';

import { IoMdRefresh } from 'react-icons/io';
import { Button } from '@/components/ui/button';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import InputDatePicker from '@/components/custom-ui/InputDatePicker';
import {
  setOnReload,
  setSelectedDate,
  setSelectedDate2
} from '@/lib/store/filterSlice/filterSlice';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { filterInput, filterSchema } from '@/lib/validations/filter.validation';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';

const FilterGrid = () => {
  const dispatch = useDispatch();
  const [popOverTglDari, setPopOverTglDari] = useState<boolean>(false);
  const [popOverTgl, setPopOverTgl] = useState<boolean>(false);
  const [dateNotValid, setDateNotValid] = useState<boolean>(false);
  const { selectedDate, selectedDate2, onReload } = useSelector(
    (state: any) => state.filter
  );

  // const forms = useForm<filterInput>({
  //   resolver: zodResolver(filterSchema),
  //   mode: 'onSubmit',
  //   defaultValues: {
  //     tglDari: selectedDate,
  //     tglSampai: selectedDate2
  //   }
  // });
  // const formRef = useRef<HTMLFormElement | null>(null);

  const handleDateChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // if (!newValue) {
    //   forms.setValue('tglDari', e.target.value)
    // }
    // console.log('newValue',newValue);

    dispatch(setSelectedDate(newValue)); // Dispatch to Redux
  };

  const handleDateChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    dispatch(setSelectedDate2(newValue)); // Dispatch to Redux
  };

  const handleCalendarSelect1 = (value: Date | undefined) => {
    if (value) {
      dispatch(setSelectedDate(String(value)));
      setPopOverTglDari(false); // Menutup popover setelah memilih tanggal
    } else {
      setSelectedDate(''); // Jika tidak ada tanggal yang dipilih, set menjadi kosong
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

  // function validateTanggal(tglDari: string, tglSampai: string): boolean {
  //   dayjs.extend(customParseFormat);
  //   const date1 = dayjs(tglDari, "DD-MM-YYYY", true);
  //   const date2 = dayjs(tglSampai, "DD-MM-YYYY", true);

  //   if (!date1.isValid()) {
  //     console.error("Tanggal tidak valid:", tglDari, tglSampai);
  //     setDateNotValid(true)
  //     return false;
  //   }
  //   if (!date2.isValid()) {
  //     console.error("Tanggal tidak valid:", tglDari, tglSampai);
  //     return false;
  //   }

  //   return date2.isBefore(date1);
  // }

  const onSubmit = async (values: filterInput) => {
    // dispatch(setProcessing());
    // const result = validateTanggal(selectedDate, selectedDate2)
    // console.log('result', result);
    // if (result) {

    // } else {
    dispatch(setOnReload(true));
    // }
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
          {/* <Form {...forms}>
            <form
              ref={formRef}
              onSubmit={onSubmit as any}
              className="flex h-fixed flex-col gap-6"
            >
              <div className="flex w-full flex-col items-center justify-between lg:flex-row">
                <label
                  htmlFor=""
                  className="w-full text-sm font-bold text-black lg:w-[20%]"
                >
                  periode:
                  <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
                </label>
                  <FormField
                    name="tglDari"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col lg:flex-row lg:items-center ml-20">
                        <FormLabel
                        >
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <InputDatePicker
                              value={selectedDate}
                              showCalendar
                              onChange={handleDateChange1}
                              // onChange={(date: any) => {
                              //   forms.setValue('tglDari', date.target.value)
                              //   handleDateChange1
                              // }}
                              onSelect={(date: any) => {
                                handleCalendarSelect1
                                forms.setValue('tglDari', date)
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="flex w-[20%] items-center justify-center">
                    <p className="text-center text-sm font-bold text-black">S/D</p>
                  </div>

                  <FormField
                    name="tglSampai"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col lg:flex-row lg:items-center ml-20">
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <InputDatePicker
                              value={selectedDate2}
                              showCalendar
                              onChange={handleDateChange2}
                              onSelect={(date: any) => {
                                handleCalendarSelect2
                                forms.setValue('tglSampai', date)
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
              </div>
            </form>
          </Form> */}

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
              {/* {dateNotValid && (
                <p
                  ref={formRef}
                  id={'tglDari'}
                  className={cn('text-[0.8rem] font-medium text-destructive', className)}
                  {...props}
                >
                  {body}
                </p>
              )} */}
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

          <Button
            type="submit"
            variant="default"
            className="mt-2 flex flex-row items-center justify-center"
            onClick={onSubmit as any}
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
