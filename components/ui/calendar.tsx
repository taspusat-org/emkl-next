'use client';

import * as React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { DayPicker, DropdownProps } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { useGetAllOffDays, useGetOffdays } from '@/lib/server/useOffdays';
import { IOffdays } from '@/lib/types/offday.type';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './select';
import { ScrollArea } from './scroll-area';
import { SelectViewport } from '@radix-ui/react-select';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const { data } = useGetAllOffDays();
  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed in JavaScript's Date object
  };

  const holidays =
    data?.data.map((item: IOffdays) => ({
      date: parseDate(item.tgl), // Use the parseDate function to handle the format correctly
      keterangan: item.keterangan
    })) || [];

  const holidayDates = holidays.map((holiday) => holiday.date);
  const isHolidayOrSunday = (date: Date) => {
    // Check if the date is a holiday or Sunday
    const isSunday = date.getDay() === 0; // Sunday is 0
    const isHoliday = holidayDates.some(
      (holidayDate) => holidayDate.getTime() === date.getTime()
    );
    return isSunday || isHoliday;
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium',
        caption_dropdowns: 'flex justify-center gap-1',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex flex-row justify-between',
        head_cell:
          'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2 gap-x-[1px] flex-row justify-between',
        cell: 'text-center text-sm p-0 bg-gradient-to-b from-[#eff5ff] to-[#e0ecff] relative border border-blue-500 [&:has([aria-selected])]:bg-yellow-500 focus-within:relative focus-within:z-20',
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-7 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-blue-400 rounded-none font-bold text-sm'
        ),
        day_selected:
          'bg-[#2694e8] text-white hover:bg-blue-400 hover:text-primary-foreground focus:bg-blue-400 focus:text-white',
        day_today: 'h-7 w-8 bg-[#ffef8f] border border-[#f9dd34] text-black',
        day_outside: 'opacity-50',
        day_disabled: 'text-muted-foreground opacity-50',
        day_range_middle:
          'aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_hidden: 'invisible',
        ...classNames
      }}
      components={{
        Dropdown: ({ value, onChange, children }: DropdownProps) => {
          const options = React.Children.toArray(
            children
          ) as React.ReactElement<React.HTMLProps<HTMLOptionElement>>[];
          const selected = options.find((child) => child.props.value === value);

          const handleChange = (val: string) => {
            const changeEvent = {
              target: { value: val }
            } as React.ChangeEvent<HTMLSelectElement>;
            onChange?.(changeEvent);
          };

          return (
            <Select
              value={value?.toString()}
              onValueChange={(val) => handleChange(val.toString())}
            >
              <SelectTrigger className="pr-1.5 focus:ring-0">
                <SelectValue>{selected?.props.children}</SelectValue>
              </SelectTrigger>

              <SelectContent
                position="popper"
                className="border-zinc-300 bg-white"
              >
                {/* Ganti <div> dengan <SelectViewport> */}
                <ScrollArea
                  className={
                    '[&>[data-radix-scroll-area-viewport]]:max-h-[200px]'
                  }
                >
                  {options.map((option, idx) => (
                    <SelectItem
                      className="cursor-pointer hover:bg-zinc-200"
                      key={`${option.props.value}-${idx}`}
                      value={option.props.value?.toString() ?? ''}
                    >
                      {option.props.children}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          );
        },
        IconLeft: () => <ChevronLeftIcon className="h-4 w-4" />,
        IconRight: () => <ChevronRightIcon className="h-4 w-4" />
      }}
      disabledDays={[...holidayDates, new Date().getDay() === 0]}
      dayClassName={(date) => {
        // Check if the day is a holiday or a Sunday
        if (isHolidayOrSunday(date)) {
          return 'day_disabled'; // Apply the disabled style
        }
        return ''; // No additional class for non-disabled days
      }}
      modifiers={{
        holiday: holidayDates,
        sunday: { dayOfWeek: [0] },
        saturday: { dayOfWeek: [6] }
      }}
      modifiersClassNames={{
        holiday: 'text-red-500',
        sunday: 'text-red-500',
        saturday: 'text-green-500'
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
