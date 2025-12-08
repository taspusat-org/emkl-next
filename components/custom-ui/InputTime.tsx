import React, { useEffect, useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface InputTimeProps {
  value?: string; // HH:mm
  onChange?: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minuteStep?: number; // default 5
}

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const parseTime = (v?: string) => {
  if (!v) return { hour: 0, minute: 0 };
  const [h = '0', m = '0'] = v.split(':');
  const hour = Math.max(0, Math.min(23, parseInt(h || '0', 10) || 0));
  const minute = Math.max(0, Math.min(59, parseInt(m || '0', 10) || 0));
  return { hour, minute };
};

export default function InputTime({
  value,
  onChange,
  placeholder = 'HH:mm',
  disabled,
  className,
  minuteStep = 5
}: InputTimeProps) {
  const isControlled =
    typeof value !== 'undefined' && typeof onChange === 'function';
  const parsed = parseTime(value);
  const [hour, setHour] = useState<number>(parsed.hour);
  const [minute, setMinute] = useState<number>(parsed.minute);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isControlled) {
      const p = parseTime(value);
      setHour(p.hour);
      setMinute(p.minute);
    }
  }, [value]);

  const minutes = Array.from(
    { length: Math.ceil(60 / minuteStep) },
    (_, i) => i * minuteStep
  );
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const display = isControlled ? value ?? '' : `${pad(hour)}:${pad(minute)}`;

  const apply = (h: number, m: number) => {
    const time = `${pad(h)}:${pad(m)}`;
    if (onChange) onChange(time);
    if (!isControlled) {
      setHour(h);
      setMinute(m);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={className}>
          <Input
            ref={inputRef}
            value={display}
            onClick={() => !disabled && setOpen((v) => !v)}
            onChange={() => {}}
            placeholder={placeholder}
            readOnly
            disabled={disabled}
          />
        </div>
      </PopoverTrigger>

      <PopoverContent side="bottom" align="start" className="w-[320px] p-2">
        <div className="flex gap-2">
          <div className="max-h-52 w-1/2 overflow-auto">
            <div className="grid grid-cols-4 gap-1">
              {hours.map((h) => (
                <Button
                  key={h}
                  size="sm"
                  variant={h === hour ? 'secondary' : 'ghost'}
                  onClick={() => setHour(h)}
                  className="text-xs"
                >
                  {pad(h)}
                </Button>
              ))}
            </div>
          </div>

          <div className="max-h-52 w-1/2 overflow-auto">
            <div className="grid grid-cols-4 gap-1">
              {minutes.map((m) => (
                <Button
                  key={m}
                  size="sm"
                  variant={m === minute ? 'secondary' : 'ghost'}
                  onClick={() => setMinute(m)}
                  className="text-xs"
                >
                  {pad(m)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={() => apply(hour, minute)}>
            Set
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
