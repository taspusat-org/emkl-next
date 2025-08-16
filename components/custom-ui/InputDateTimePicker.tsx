import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import InputMask from '@mona-health/react-input-mask';
import { Calendar } from '@/components/ui/calendar'; // sesuaikan path
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'; // sesuaikan path
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'; // sesuaikan path
import { Button } from '@/components/ui/button'; // sesuaikan path
import { FaCalendarAlt } from 'react-icons/fa';
import { format, parse, isValid } from 'date-fns';

export interface InputDateTimePickerProps
  extends Omit<
    React.ComponentProps<typeof InputMask>,
    | 'value'
    | 'onChange'
    | 'mask'
    | 'alwaysShowMask'
    | 'placeholder'
    | 'beforeMaskedStateChange'
  > {
  /** Controlled string value. Boleh '' saat kosong. */
  value: string;
  /** Dipanggil saat nilai berubah. Menghasilkan string ('' bila kosong). */
  onChange: (next: string) => void;
  /** Tampilkan tombol & popover kalender */
  showCalendar?: boolean;
  /** Tampilkan pemilih waktu (jam/menit/AM-PM) */
  showTime?: boolean;
  /** Step menit untuk picker */
  minuteStep?: number; // default 5
  /** Range tahun untuk kalender */
  fromYear?: number; // default 1960
  toYear?: number; // default 2035
  /** Format tanggal untuk input & parsing (mask tetap dd-MM-yyyy) */
  dateFormat?: string; // default 'dd-MM-yyyy'
  /** Format output string. Default: 'dd-MM-yyyy hh:mm a' saat showTime, else 'dd-MM-yyyy' */
  outputFormat?: string;
  /** Placeholder override (jika mau custom) */
  placeholderText?: string;
  /** Tombol clear */
  clearable?: boolean;
  /** Class wrapper tambahan */
  className?: string;
  /** Disable seluruh kontrol */
  disabled?: boolean;
}

const DATE_MASK: Array<RegExp | string> = [
  /[0-3]/,
  /\d/,
  '-', // DD-
  /[0-1]/,
  /\d/,
  '-', // MM-
  /\d/,
  /\d/,
  /\d/,
  /\d/ // YYYY
];

const DATETIME_12H_MASK: Array<RegExp | string> = [
  /[0-3]/,
  /\d/,
  '-', // DD-
  /[0-1]/,
  /\d/,
  '-', // MM-
  /\d/,
  /\d/,
  /\d/,
  /\d/, // YYYY
  ' ',
  /[0-1]/,
  /\d/,
  ':', // HH:
  /[0-5]/,
  /\d/,
  ' ', // MM
  /[A|P]/,
  /[M]/ // AM/PM (2 characters)
];

function isLeapYear(y: number) {
  return y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
}

function guardDateOnly(prev = '', next = ''): string {
  const [d = '', m = '', y = ''] = next.split('-');

  if (m.length === 2) {
    const [m1, m2] = m.split('') as [string, string];
    if (!['0', '1'].includes(m1)) return prev;
    if (m1 === '1' && Number(m2) > 2) return prev; // >12
    if (m1 === '0' && m2 === '0') return prev; // 00
  }

  if (d === '31' && m.length === 2) {
    const m31 = ['01', '03', '05', '07', '08', '10', '12'];
    if (!m31.includes(m)) return prev;
  }

  if (m === '02') {
    if (d === '30' || d === '31') return prev;
    if (d === '29' && /^\d{4}$/.test(y)) {
      if (!isLeapYear(Number(y))) return prev;
    }
  }

  return next;
}

function guardDateTime12h(prev = '', next = ''): string {
  // Validasi base tanggal dulu
  const base = guardDateOnly(prev, next);

  // Cek pola partial time; jangan terlalu agresif supaya tetap bisa mengetik bertahap
  // Pola longgar: DD-MM-YYYY( HH[:mm] [AP]M?)
  const re =
    /^(\d{2})-(\d{2})-(\d{4})(?: (\d{0,2})(?::(\d{0,2}))?(?: ([AaPp][Mm]?))?)?$/;
  const m = base.match(re);
  if (!m) return prev; // bila bentuknya tidak sesuai sama sekali, tahan ke prev

  const hh = m[4] ?? ''; // 0..2 digit
  const mm = m[5] ?? ''; // 0..2 digit
  const ap = m[6] ?? ''; // '', 'A', 'AM', 'P', 'PM'

  // Hour: bila 2 digit, harus 01..12 (00 tak boleh)
  if (hh.length === 2) {
    const n = Number(hh);
    if (n < 1 || n > 12) return prev;
  }
  // Hour: bila 1 digit pertama '0' → harus menuju 01..09 (boleh), kalau '1' → 10..12 (boleh)
  if (hh.length === 1) {
    if (!/[01]/.test(hh)) return prev;
  }

  // Minute: jika ada 1 digit pertama, harus 0..5
  if (mm.length === 1 && !/[0-5]/.test(mm)) return prev;
  // Minute lengkap 2 digit 00..59
  if (mm.length === 2) {
    const n = Number(mm);
    if (n < 0 || n > 59) return prev;
  }

  // AM/PM: izinkan ketik bertahap: 'A'/'P' -> wajib diikuti 'M' (besar/kecil)
  if (ap.length === 1 && !/[AaPp]/.test(ap)) return prev;
  if (ap.length === 2) {
    const up = ap.toUpperCase();
    if (up !== 'AM' && up !== 'PM') return prev;
  }
  console.log('base', base, 'hh', hh, 'mm', mm, 'ap', ap);
  return base;
}

function tryParse(value: string, dateFmt: string): Date | null {
  if (!value || !value.trim()) return null;
  // Priority: 12h 'hh:mm a', fallback ke 24h 'HH:mm', lalu hanya tanggal
  const f1 = `${dateFmt} hh:mm a`;
  const p1 = parse(value, f1, new Date());
  if (isValid(p1)) return p1;
  const f2 = `${dateFmt} HH:mm`;
  const p2 = parse(value, f2, new Date());
  if (isValid(p2)) return p2;
  const p3 = parse(value, dateFmt, new Date());
  if (isValid(p3)) return p3;
  return null;
}

function toDateString(d: Date | null, fmt: string) {
  return d ? format(d, fmt) : '';
}

const InputDateTimePicker = forwardRef<
  HTMLInputElement,
  InputDateTimePickerProps
>(
  (
    {
      value,
      onChange,
      showCalendar = true,
      showTime = false,
      minuteStep = 5,
      fromYear = 1960,
      toYear = 2035,
      dateFormat = 'dd-MM-yyyy',
      outputFormat,
      placeholderText,
      clearable = true,
      className = '',
      disabled = false,
      ...rest
    },
    ref
  ) => {
    const outFmt =
      outputFormat ?? (showTime ? `${dateFormat} hh:mm a` : dateFormat);

    const parsed = useMemo(
      () => tryParse(value, dateFormat),
      [value, dateFormat]
    );

    const [open, setOpen] = useState(false);
    const [inputText, setInputText] = useState<string>(
      toDateString(parsed, showTime ? `${dateFormat} hh:mm a` : dateFormat)
    );

    useEffect(() => {
      setInputText(
        toDateString(parsed, showTime ? `${dateFormat} hh:mm a` : dateFormat)
      );
    }, [parsed, dateFormat, showTime]);

    const mask = showTime ? DATETIME_12H_MASK : DATE_MASK;
    const placeholder =
      placeholderText ??
      (showTime ? 'DD-MM-YYYY HH:MM AM' : dateFormat.toUpperCase());

    const hours12 = useMemo(
      () => Array.from({ length: 12 }, (_, i) => i + 1),
      []
    );
    const minutes = useMemo(
      () =>
        Array.from(
          { length: Math.ceil(60 / minuteStep) },
          (_, i) => i * minuteStep
        ),
      [minuteStep]
    );

    const current = parsed ?? new Date(); // untuk UI

    const commitFromInput = (text: string) => {
      if (!text || /[_]/.test(text)) {
        onChange('');
        return;
      }
      const d = tryParse(text, dateFormat);
      if (!d) {
        onChange('');
        return;
      }
      let finalDate = d;
      if (showTime && parsed) {
        const merged = new Date(d);
        merged.setHours(parsed.getHours(), parsed.getMinutes(), 0, 0);
        finalDate = merged;
      }
      onChange(format(finalDate, outFmt));
    };

    const beforeMaskedStateChange = (states: any) => {
      if (!states?.nextState) return states;
      console.log('states', states);
      const prevVal: string =
        (states.previousState && states.previousState.value) ??
        (typeof inputText === 'string' ? inputText : '') ??
        '';
      const nextVal: string = states.nextState.value ?? '';
      const guarded = showTime
        ? guardDateTime12h(prevVal, nextVal)
        : guardDateOnly(prevVal, nextVal);
      const selection =
        states.nextState.selection ??
        states.currentState?.selection ??
        undefined;
      return { value: guarded, selection };
    };

    const pickDate = (d?: Date) => {
      if (!d) return;
      let finalDate = d;
      if (showTime && parsed) {
        finalDate = new Date(d);
        finalDate.setHours(parsed.getHours(), parsed.getMinutes(), 0, 0);
      }
      onChange(format(finalDate, outFmt));
      setOpen(false);
    };

    const setTimePart = (
      type: 'hour' | 'minute' | 'ampm',
      v: number | 'AM' | 'PM'
    ) => {
      const base = new Date(current);
      let h = base.getHours();
      let m = base.getMinutes();

      if (type === 'hour' && typeof v === 'number') {
        const isPM = h >= 12;
        const mapped = v % 12; // 12 -> 0
        h = isPM ? mapped + 12 : mapped;
        if (!isPM && v === 12) h = 0; // 12 AM
        if (isPM && v === 12) h = 12; // 12 PM
      }
      if (type === 'minute' && typeof v === 'number') {
        m = v;
      }
      if (type === 'ampm' && (v === 'AM' || v === 'PM')) {
        const wantPM = v === 'PM';
        h = wantPM ? (h % 12) + 12 : h % 12;
      }

      const next = new Date(base);
      next.setHours(h, m, 0, 0);
      onChange(format(next, outFmt));
    };

    const clear = () => {
      setInputText('');
      onChange('');
    };
    console.log(placeholder);
    return (
      <div
        className={`relative flex items-center rounded-sm border border-zinc-300 focus-within:border-blue-500 ${
          disabled ? 'pointer-events-none opacity-70' : ''
        } ${className}`}
      >
        <InputMask
          ref={ref as any}
          mask={mask}
          className={`h-9 w-full rounded-sm px-3 text-sm text-zinc-900 focus:bg-[#ffffee] focus:outline-none focus:ring-0 ${
            disabled ? 'cursor-not-allowed bg-gray-100 text-gray-500' : ''
          }`}
          maskPlaceholder={placeholder}
          placeholder={placeholder}
          alwaysShowMask
          value={inputText}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setInputText(e.target.value)
          }
          onBlur={() => commitFromInput(inputText)}
          beforeMaskedStateChange={beforeMaskedStateChange}
          disabled={disabled}
          {...rest}
        />

        {clearable && (value || inputText) && (
          <button
            type="button"
            aria-label="Clear date"
            className="absolute right-9 mr-1 rounded p-1 text-xs text-zinc-600 hover:bg-zinc-100"
            onClick={clear}
          >
            ✕
          </button>
        )}

        {showCalendar && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={disabled}
                className={`ml-1 flex h-9 w-9 items-center justify-center border ${
                  disabled
                    ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                    : 'cursor-pointer border-[#adcdff] bg-[#e0ecff] text-[#0e2d5f] hover:bg-[#abcbfd]'
                }`}
              >
                <FaCalendarAlt className="h-4 w-4 text-[#0e2d5f]" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="z-50 w-auto max-w-xs border border-blue-500 bg-white p-2"
              sideOffset={-1}
              align="end"
            >
              <div className={showTime ? 'sm:flex' : undefined}>
                <Calendar
                  mode="single"
                  captionLayout="dropdown-buttons"
                  fromYear={fromYear}
                  toYear={toYear}
                  defaultMonth={parsed ?? new Date()}
                  selected={parsed ?? undefined}
                  onSelect={pickDate}
                />

                {showTime && (
                  <div className="mt-2 flex flex-col divide-y sm:ml-2 sm:mt-0 sm:h-[300px] sm:flex-row sm:divide-x sm:divide-y-0">
                    <ScrollArea className="w-64 sm:w-auto">
                      <div className="flex p-2 sm:flex-col">
                        {hours12.map((h) => {
                          const selected =
                            (current.getHours() % 12 || 12) === h;
                          return (
                            <Button
                              key={h}
                              size="icon"
                              variant={selected ? 'default' : 'ghost'}
                              className="aspect-square shrink-0 sm:w-full"
                              onClick={() => setTimePart('hour', h)}
                            >
                              {h}
                            </Button>
                          );
                        })}
                      </div>
                      <ScrollBar
                        orientation="horizontal"
                        className="sm:hidden"
                      />
                    </ScrollArea>

                    <ScrollArea className="w-64 sm:w-auto">
                      <div className="flex p-2 sm:flex-col">
                        {minutes.map((min) => {
                          const selected = current.getMinutes() === min;
                          return (
                            <Button
                              key={min}
                              size="icon"
                              variant={selected ? 'default' : 'ghost'}
                              className="aspect-square shrink-0 sm:w-full"
                              onClick={() => setTimePart('minute', min)}
                            >
                              {min.toString().padStart(2, '0')}
                            </Button>
                          );
                        })}
                      </div>
                      <ScrollBar
                        orientation="horizontal"
                        className="sm:hidden"
                      />
                    </ScrollArea>

                    <ScrollArea>
                      <div className="flex p-2 sm:flex-col">
                        {['AM', 'PM'].map((ap) => {
                          const isPM = current.getHours() >= 12;
                          const selected =
                            (ap === 'AM' && !isPM) || (ap === 'PM' && isPM);
                          return (
                            <Button
                              key={ap}
                              size="icon"
                              variant={selected ? 'default' : 'ghost'}
                              className="aspect-square shrink-0 sm:w-full"
                              onClick={() =>
                                setTimePart('ampm', ap as 'AM' | 'PM')
                              }
                            >
                              {ap}
                            </Button>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    );
  }
);

InputDateTimePicker.displayName = 'InputDateTimePicker';

export default InputDateTimePicker;
