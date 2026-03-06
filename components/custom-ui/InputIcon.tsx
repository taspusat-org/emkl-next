import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';

type InputIconProps = {
  icon?: React.ReactNode;
  textIcon?: string;
  readOnly?: boolean;
  className?: string;
  value?: string | number | null;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (val: string | null) => void;
  isDecimal?: boolean;
  maxDecimalPlaces?: number;
  maxLength?: number;
  [key: string]: any;
};

const InputIcon: React.FC<InputIconProps> = ({
  icon,
  textIcon,
  readOnly,
  className,
  value,
  onChange,
  onValueChange,
  isDecimal = false,
  maxDecimalPlaces = 2,
  maxLength,
  ...props
}) => {
  const normalizeValue = (val: string | number | null | undefined) =>
    val == null ? '' : typeof val === 'number' ? String(val) : val;

  const [inputValue, setInputValue] = useState<string>(normalizeValue(value));

  useEffect(() => {
    const normalized = normalizeValue(value);
    if (normalized !== inputValue) {
      setInputValue(normalized);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;

    // Apply maxLength if specified
    if (maxLength && raw.length > maxLength) {
      raw = raw.slice(0, maxLength);
    }

    let cleanedValue: string;

    if (isDecimal) {
      // Allow digits and one decimal point
      let cleaned = raw.replace(/[^\d.]/g, '');

      // Ensure only one decimal point
      const parts = cleaned.split('.');
      if (parts.length > 2) {
        cleaned = parts[0] + '.' + parts.slice(1).join('');
      }

      // Limit decimal places
      if (parts.length === 2) {
        cleaned = parts[0] + '.' + parts[1].slice(0, maxDecimalPlaces);
      }

      // Apply maxLength after decimal formatting
      if (maxLength && cleaned.length > maxLength) {
        cleaned = cleaned.slice(0, maxLength);
      }

      if (cleaned === '' || cleaned === '.') {
        setInputValue('');

        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: '' }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange?.(syntheticEvent);
        onValueChange?.(null);
        return;
      }

      cleanedValue = cleaned;
    } else {
      // Default behavior: pass through as-is (or apply custom logic if needed)
      cleanedValue = raw;
    }

    setInputValue(cleanedValue);

    const syntheticEvent = {
      ...e,
      target: { ...e.target, value: cleanedValue }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange?.(syntheticEvent);
    onValueChange?.(cleanedValue);
  };

  const inputStopPropagation = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="relative flex w-full flex-row">
      <Input
        {...props}
        value={inputValue}
        onChange={handleChange}
        onKeyDown={inputStopPropagation}
        onClick={(e: any) => e.stopPropagation()}
        readOnly={readOnly}
        inputMode={isDecimal ? 'decimal' : props.inputMode}
        pattern={isDecimal ? '[0-9]*[.,]?[0-9]*' : props.pattern}
        maxLength={maxLength}
        className={cn(
          readOnly ? 'text-zinc-400' : '',
          isDecimal ? 'rounded-r-none pr-1 text-right' : '',
          'tracking-normal',
          className
        )}
      />
      {(icon || textIcon) && (
        <div className="pointer-events-none flex items-center rounded-r-sm border border-gray-400">
          <div className="flex h-full w-[30px] items-center justify-center rounded-br-sm rounded-tr-sm border-l border-[#ced4da]  bg-[#e9ecef]">
            {icon ? icon : textIcon}
          </div>
        </div>
      )}
    </div>
  );
};

export default InputIcon;
