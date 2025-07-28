import React, { useState } from 'react';
import InputMask from '@mona-health/react-input-mask';
import { Calendar } from '@/components/ui/calendar';
import { FaCalendarAlt } from 'react-icons/fa';
import { parse, format } from 'date-fns';
import { isLeapYear, formatDateCalendar } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
export interface DateInputProps
  extends Omit<
    React.ComponentProps<typeof InputMask>,
    | 'beforeMaskedStateChange'
    | 'mask'
    | 'alwaysShowMask'
    | 'maskPlaceholder'
    | 'placeholder'
    | 'value'
    | 'onChange'
  > {
  /** Current value of the input ("DD-MM-YYYY" format) */
  value?: string;
  /** Called when the value changes via typing or calendar */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** If true, show calendar popover */
  showCalendar?: boolean;
  /** Callback when a date is selected in the calendar */
  onSelect?: (date: Date) => void;
  /** Year range start for calendar */
  fromYear?: number;
  /** Year range end for calendar */
  toYear?: number;
  /** Additional CSS classes for wrapper */
  className?: string;
}

/**
 * A reusable date input with mask and optional calendar.
 */
const InputDatePicker: React.FC<DateInputProps> = ({
  value = '',
  onChange,
  showCalendar = false,
  onSelect,
  fromYear = 1960,
  toYear = 2030,
  className = '',
  ...rest
}) => {
  const [open, setOpen] = useState(false);
  const dateMask = [
    /[0-3]/, // D1
    /\d/, // D2
    '-',
    /[0-1]/, // M1
    /\d/, // M2
    '-',
    /\d/, // Y1
    /\d/, // Y2
    /\d/, // Y3
    /\d/ // Y4
  ];
  return (
    <div
      className={`relative flex flex-row items-center rounded-sm border border-zinc-300 focus-within:border-blue-500 ${className}`}
    >
      <InputMask
        mask={dateMask}
        {...rest}
        className="h-9 w-full rounded-sm px-3 text-sm text-zinc-900 focus:bg-[#ffffee] focus:outline-none focus:ring-0"
        maskPlaceholder="DD-MM-YYYY"
        placeholder="DD-MM-YYYY"
        alwaysShowMask
        value={value}
        onChange={onChange}
        beforeMaskedStateChange={({
          previousState,
          currentState,
          nextState
        }) => {
          const nextVal = nextState.value || '';
          const parts = nextVal.split('-');

          if (
            parts.length === 3 &&
            parts[0] !== 'DD' &&
            parts[1] !== 'MM' &&
            /^\d{2}$/.test(parts[0]) &&
            /^\d{2}$/.test(parts[1])
          ) {
            const dayNum = Number(parts[0]);
            const monthStr = parts[1];
            const yearNum = Number(parts[2]);

            if (dayNum === 31) {
              const monthsWith31 = ['01', '03', '05', '07', '08', '10', '12'];
              if (!monthsWith31.includes(monthStr)) {
                return {
                  value: previousState.value,
                  selection: previousState.selection
                };
              }
            }
            if (parts[1].length === 2) {
              const [fc, sc] = monthStr.split('') as [string, string];
              if (fc === '1' && Number(sc) > 2) {
                return {
                  value: previousState.value,
                  selection: previousState.selection
                };
              }
              if (!['0', '1'].includes(fc)) {
                return {
                  value: previousState.value,
                  selection: previousState.selection
                };
              }
              if (fc === '0' && sc === '0') {
                return {
                  value: previousState.value,
                  selection: previousState.selection
                };
              }
            }
            if (
              parts[0] === '29' &&
              parts[1] === '02' &&
              /^\d{4}$/.test(parts[2])
            ) {
              if (!isLeapYear(yearNum)) {
                return {
                  value: previousState.value,
                  selection: previousState.selection
                };
              }
            }
          }
          return { value: nextState.value, selection: nextState.selection };
        }}
      />

      {showCalendar && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-9 w-9 cursor-pointer items-center justify-center border border-[#adcdff] bg-[#e0ecff] text-[#0e2d5f] hover:bg-[#abcbfd]"
            >
              <FaCalendarAlt className="h-4 w-4 text-[#0e2d5f]" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="absolute right-4 w-auto max-w-xs border border-blue-500 bg-white"
            sideOffset={-1}
          >
            <Calendar
              mode="single"
              captionLayout="dropdown-buttons"
              fromYear={fromYear}
              toYear={toYear}
              selected={
                value ? parse(value, 'dd-MM-yyyy', new Date()) : undefined
              }
              onSelect={(date) => {
                if (date) {
                  const formatted = formatDateCalendar(date);
                  onChange?.({ target: { value: formatted } } as any);
                  onSelect?.(formatted);
                  setOpen(false);
                }
              }}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default InputDatePicker;
