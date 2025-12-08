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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
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
      <div className="flex h-[100%] w-full flex-col rounded-sm border border-blue-500 bg-white">
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
