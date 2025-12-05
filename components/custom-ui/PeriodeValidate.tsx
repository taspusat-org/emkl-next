'use client';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setSelectedDate,
  setSelectedDate2
} from '@/lib/store/filterSlice/filterSlice';
import InputDatePicker from '@/components/custom-ui/InputDatePicker';

interface PeriodeValidationProps {
  label?: string;
  onValidationChange?: (isValid: boolean) => void;
  triggerValidation?: boolean;
}

const PeriodeValidation: React.FC<PeriodeValidationProps> = ({
  label = 'periode',
  onValidationChange,
  triggerValidation = false
}) => {
  const dispatch = useDispatch();
  const { selectedDate, selectedDate2 } = useSelector(
    (state: any) => state.filter
  );

  const [showError, setShowError] = useState<{
    status: boolean;
    message: string;
  }>({
    status: false,
    message: ''
  });

  const parseDateFromDDMMYYYY = (dateString: string): Date | undefined => {
    const parts = dateString.split('-');
    if (parts.length !== 3) return undefined;
    const [day, month, year] = parts.map(Number);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return undefined;
    return new Date(year, month - 1, day);
  };

  const validateDates = (tanggalDari: string, tanggalSampai: string) => {
    const dateDari = parseDateFromDDMMYYYY(tanggalDari);
    const dateSampai = parseDateFromDDMMYYYY(tanggalSampai);

    if (dateDari && dateSampai) {
      if (dateSampai < dateDari) {
        setShowError({
          status: true,
          message: `TANGGAL SAMPAI NILAI TIDAK BOLEH < DARI ${tanggalDari}`
        });
        if (onValidationChange) {
          onValidationChange(false);
        }
        return false;
      }
    }

    setShowError({
      status: false,
      message: ''
    });
    if (onValidationChange) {
      onValidationChange(true);
    }
    return true;
  };

  const handleDateChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    dispatch(setSelectedDate(newValue));
    setShowError({ status: false, message: '' });
    if (onValidationChange) {
      onValidationChange(true);
    }
  };

  const handleDateChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    dispatch(setSelectedDate2(newValue));
    setShowError({ status: false, message: '' });
    if (onValidationChange) {
      onValidationChange(true);
    }
  };

  const handleCalendarSelect1 = (value: any) => {
    if (value) {
      dispatch(setSelectedDate(String(value)));
      setShowError({ status: false, message: '' });
      if (onValidationChange) {
        onValidationChange(true);
      }
    } else {
      dispatch(setSelectedDate(''));
    }
  };

  const handleCalendarSelect2 = (value: any) => {
    if (value) {
      dispatch(setSelectedDate2(String(value)));
      setShowError({ status: false, message: '' });
      if (onValidationChange) {
        onValidationChange(true);
      }
    } else {
      dispatch(setSelectedDate2(''));
    }
  };

  useEffect(() => {
    if (triggerValidation && selectedDate && selectedDate2) {
      validateDates(selectedDate, selectedDate2);
    }
  }, [triggerValidation]);

  return (
    <div className="flex w-full flex-col items-center justify-between lg:flex-row">
      <label
        htmlFor=""
        className="w-full text-sm font-bold text-black lg:w-[20%]"
      >
        {label}:<span style={{ color: 'red', marginLeft: '4px' }}>*</span>
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
          danger={showError.status}
        />

        {showError.status && (
          <p className="absolute left-0 top-full mt-1 text-[0.8rem] text-red-500">
            {showError.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default PeriodeValidation;
