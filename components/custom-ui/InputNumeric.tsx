import React, { useState, useEffect } from 'react';
import InputMask from '@mona-health/react-input-mask';
import { cn } from '@/lib/utils';

type NumericInputProps = {
  value?: string | number | null;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (val: string | null) => void;
  icon?: React.ReactNode;
  className?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  isDecimal?: boolean;
  maxDecimalPlaces?: number;
};

const InputNumeric: React.FC<NumericInputProps> = ({
  value = '',
  onChange,
  onValueChange,
  icon,
  className = '',
  autoFocus = false,
  readOnly = false,
  disabled = false,
  placeholder = '',
  isDecimal = false,
  maxDecimalPlaces = 2
}) => {
  const normalizeValue = (val: string | number | null | undefined) => {
    if (val == null || val === '') return '';
    // Jangan convert 0 jadi string jika memang valuenya 0
    if (val === 0 || val === '0') return '0';
    return typeof val === 'number' ? String(val) : val;
  };

  const [inputValue, setInputValue] = useState<string>(normalizeValue(value));

  useEffect(() => {
    const normalized = normalizeValue(value);
    // Hanya update jika nilai external berubah dan berbeda dengan inputValue
    if (normalized !== inputValue) {
      setInputValue(normalized);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]); // Hanya depend pada value, bukan inputValue

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
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

      if (cleaned === '' || cleaned === '.') {
        setInputValue('');

        // Trigger both onChange and onValueChange
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
      // Original behavior: only digits
      const numeric = raw.replace(/\D+/g, '');
      if (numeric === '') {
        setInputValue('');

        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: '' }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange?.(syntheticEvent);
        onValueChange?.(null);
        return;
      }

      cleanedValue = numeric;
    }

    setInputValue(cleanedValue);

    // Trigger both onChange (for React Hook Form) and onValueChange
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
    <div className="relative w-full">
      <InputMask
        mask=""
        maskPlaceholder={null}
        maskChar={null}
        disabled={disabled}
        value={inputValue}
        readOnly={readOnly}
        onChange={handleChange}
        autoFocus={autoFocus}
        onKeyDown={inputStopPropagation}
        onClick={(e: any) => e.stopPropagation()}
        placeholder={placeholder}
        inputMode={isDecimal ? 'decimal' : 'numeric'}
        pattern={isDecimal ? '[0-9]*[.,]?[0-9]*' : '[0-9]*'}
        className={cn(
          `h-9 w-full rounded-sm border border-input-border bg-background-input px-1 py-1 text-right text-sm focus:border-input-border-focus focus:bg-background-input-focus focus:outline-none focus:ring-0 ${className} ${
            readOnly || disabled
              ? 'text-input-text-disabled'
              : 'text-input-text'
          }`
        )}
      />
      {icon && (
        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
          {icon}
        </div>
      )}
    </div>
  );
};

export default InputNumeric;
