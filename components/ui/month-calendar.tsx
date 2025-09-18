import { cn } from '@/lib/utils';
import { buttonVariants } from './button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';

type Month = {
  number: number;
  name: string;
};

const MONTHS: Month[][] = [
  [
    { number: 0, name: 'Jan' },
    { number: 1, name: 'Feb' },
    { number: 2, name: 'Mar' }
  ],
  [
    { number: 3, name: 'Apr' },
    { number: 4, name: 'May' },
    { number: 5, name: 'Jun' }
  ],
  [
    { number: 6, name: 'Jul' },
    { number: 7, name: 'Aug' },
    { number: 8, name: 'Sep' }
  ],
  [
    { number: 9, name: 'Oct' },
    { number: 10, name: 'Nov' },
    { number: 11, name: 'Dec' }
  ]
];

type ButtonVariant =
  | 'default'
  | 'outline'
  | 'ghost'
  | 'link'
  | 'destructive'
  | 'secondary'
  | null
  | undefined;

type MonthCalProps = {
  selectedMonth?: Date;
  onMonthSelect?: (date: Date) => void;
  onYearForward?: () => void;
  onYearBackward?: () => void;
  callbacks?: {
    yearLabel?: (year: number) => string;
    monthLabel?: (month: Month) => string;
  };
  variant?: {
    calendar?: {
      main?: ButtonVariant;
      selected?: ButtonVariant;
    };
    chevrons?: ButtonVariant;
  };
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
};

function MonthCal({
  selectedMonth,
  onMonthSelect,
  callbacks,
  variant,
  minDate,
  maxDate,
  disabledDates,
  onYearBackward,
  onYearForward
}: MonthCalProps) {
  const [year, setYear] = React.useState<number>(
    selectedMonth?.getFullYear() ?? new Date().getFullYear()
  );
  const [month, setMonth] = React.useState<number>(
    selectedMonth?.getMonth() ?? new Date().getMonth()
  );
  const [menuYear, setMenuYear] = React.useState<number>(year);

  // State untuk mengontrol view (month view atau year view)
  const [viewMode, setViewMode] = React.useState<'month' | 'year'>('month');

  // State untuk range tahun yang ditampilkan
  const [yearRangeStart, setYearRangeStart] = React.useState<number>(
    Math.floor(menuYear / 12) * 12
  );

  if (minDate && maxDate && minDate > maxDate) minDate = maxDate;

  const disabledDatesMapped = disabledDates?.map((d) => {
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  // Function untuk generate array tahun (12 tahun per halaman)
  const generateYearRange = (): number[] => {
    const years: number[] = [];
    for (let i = 0; i < 12; i++) {
      years.push(yearRangeStart + i);
    }
    return years;
  };

  // Function untuk membuat grid tahun (3x4)
  const createYearGrid = (): number[][] => {
    const years = generateYearRange();
    const grid: number[][] = [];
    for (let i = 0; i < 4; i++) {
      grid.push(years.slice(i * 3, (i + 1) * 3));
    }
    return grid;
  };

  const renderYearSelection = () => {
    const yearGrid = createYearGrid();

    return (
      <>
        <div className="relative flex items-center justify-center pt-1">
          {/* Button untuk kembali ke mode pilihan bulan */}
          <button
            type="button"
            onClick={() => setViewMode('month')}
            className={cn(
              'hover:text-primary-foreground rounded border border-[#2694e8] bg-[#bae1ff] px-2 py-1 text-sm font-semibold text-[#1773b9] transition-colors hover:bg-[#8abfe8] focus:bg-blue-300'
            )}
          >
            Back to{' '}
            {callbacks?.yearLabel ? callbacks?.yearLabel(menuYear) : menuYear}
          </button>
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => {
                setYearRangeStart(yearRangeStart - 12);
              }}
              className={cn(
                buttonVariants({ variant: variant?.chevrons ?? 'outline' }),
                'absolute left-1 inline-flex h-7 w-7 items-center justify-center p-0'
              )}
            >
              <ChevronLeft className="h-4 w-4 opacity-50" />
            </button>
            <button
              type="button"
              onClick={() => {
                setYearRangeStart(yearRangeStart + 12);
              }}
              className={cn(
                buttonVariants({ variant: variant?.chevrons ?? 'outline' }),
                'absolute right-1 inline-flex h-7 w-7 items-center justify-center p-0'
              )}
            >
              <ChevronRight className="h-4 w-4 opacity-50" />
            </button>
          </div>
        </div>
        <table className="w-full border-collapse space-y-1 p-1">
          <tbody>
            {yearGrid.map((yearRow, rowIndex) => (
              <tr
                key={`year-row-${rowIndex}`}
                className="mt-2 flex w-full pb-1"
              >
                {yearRow.map((yearValue) => (
                  <td
                    key={yearValue}
                    className="relative h-10 w-1/3 gap-x-2 gap-y-0 px-1 text-center text-sm focus-within:relative focus-within:z-20"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setMenuYear(yearValue);
                        setViewMode('month');
                        if (onYearForward && yearValue > menuYear) {
                          onYearForward();
                        } else if (onYearBackward && yearValue < menuYear) {
                          onYearBackward();
                        }
                      }}
                      disabled={
                        (maxDate && yearValue > maxDate.getFullYear()) ||
                        (minDate && yearValue < minDate.getFullYear())
                      }
                      className={cn(
                        yearValue === menuYear
                          ? variant?.calendar?.selected ??
                              'border border-[#f9dd34] bg-[#ffef8f] text-zinc-900 hover:bg-[#fff6c2]'
                          : variant?.calendar?.main ??
                              'hover:text-primary-foreground border border-[#2694e8] bg-[#bae1ff] font-semibold text-[#1773b9] hover:bg-[#8abfe8] focus:bg-blue-300 focus:text-white',
                        'h-full w-full rounded-sm p-0 font-semibold disabled:cursor-not-allowed disabled:opacity-50 aria-selected:opacity-100'
                      )}
                    >
                      {yearValue}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  };

  // Render Month Selection View (existing view dengan modifikasi)
  const renderMonthSelection = () => {
    return (
      <>
        <div className="relative flex items-center justify-center pt-1">
          {/* Tahun sekarang menjadi button */}
          <button
            type="button"
            onClick={() => {
              setYearRangeStart(Math.floor(menuYear / 12) * 12);
              setViewMode('year');
            }}
            className={cn(
              'hover:text-primary-foreground rounded border border-[#2694e8] bg-[#bae1ff] px-2 py-1 text-sm font-semibold text-[#1773b9] transition-colors hover:bg-[#8abfe8] focus:bg-blue-300'
            )}
          >
            {callbacks?.yearLabel ? callbacks?.yearLabel(menuYear) : menuYear}
          </button>
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => {
                setMenuYear(menuYear - 1);
                if (onYearBackward) onYearBackward();
              }}
              className={cn(
                buttonVariants({ variant: variant?.chevrons ?? 'outline' }),
                'absolute left-1 inline-flex h-7 w-7 items-center justify-center p-0'
              )}
            >
              <ChevronLeft className="h-4 w-4 opacity-50" />
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuYear(menuYear + 1);
                if (onYearForward) onYearForward();
              }}
              className={cn(
                buttonVariants({ variant: variant?.chevrons ?? 'outline' }),
                'absolute right-1 inline-flex h-7 w-7 items-center justify-center p-0'
              )}
            >
              <ChevronRight className="h-4 w-4 opacity-50" />
            </button>
          </div>
        </div>
        <table className="w-full border-collapse space-y-1 p-1">
          <tbody>
            {MONTHS.map((monthRow, a) => {
              return (
                <tr key={'row-' + a} className="mt-2 flex w-full pb-1">
                  {monthRow.map((m) => {
                    return (
                      <td
                        key={m.number}
                        className="relative h-10 w-1/3 gap-x-2 gap-y-0 px-1 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setMonth(m.number);
                            setYear(menuYear);
                            if (onMonthSelect)
                              onMonthSelect(new Date(menuYear, m.number));
                          }}
                          disabled={
                            (maxDate
                              ? menuYear > maxDate?.getFullYear() ||
                                (menuYear == maxDate?.getFullYear() &&
                                  m.number > maxDate.getMonth())
                              : false) ||
                            (minDate
                              ? menuYear < minDate?.getFullYear() ||
                                (menuYear == minDate?.getFullYear() &&
                                  m.number < minDate.getMonth())
                              : false) ||
                            (disabledDatesMapped
                              ? disabledDatesMapped?.some(
                                  (d) =>
                                    d.year == menuYear && d.month == m.number
                                )
                              : false)
                          }
                          className={cn(
                            month == m.number && menuYear == year
                              ? variant?.calendar?.selected ??
                                  'border border-[#f9dd34] bg-[#ffef8f] text-zinc-900 hover:bg-[#fff6c2]'
                              : variant?.calendar?.main ??
                                  'hover:text-primary-foreground border border-[#2694e8] bg-[#bae1ff] font-semibold text-[#1773b9] hover:bg-[#8abfe8] focus:bg-blue-300 focus:text-white',
                            'h-full w-full rounded-sm p-0 font-semibold aria-selected:opacity-100'
                          )}
                        >
                          {callbacks?.monthLabel
                            ? callbacks.monthLabel(m)
                            : m.name}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </>
    );
  };

  // Main render based on viewMode
  return viewMode === 'year' ? renderYearSelection() : renderMonthSelection();
}

export default MonthCal;
