import React, { useState, useEffect } from 'react';
import InputMask from '@mona-health/react-input-mask';
import { cn } from '@/lib/utils';

type NumericInputProps = {
  value?: string | number | null;
  onValueChange?: (val: string | null) => void; // ← empty dikirim sebagai null
  icon?: React.ReactNode;
  className?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
};

const InputNumeric: React.FC<NumericInputProps> = ({
  value = '',
  onValueChange,
  icon,
  className = '',
  autoFocus = false,
  readOnly = false,
  disabled = false,
  placeholder = ''
}) => {
  const normalizeValue = (val: string | number | null | undefined) =>
    val == null ? '' : typeof val === 'number' ? String(val) : val;

  const [inputValue, setInputValue] = useState<string>(normalizeValue(value));
  useEffect(() => {
    const normalized = normalizeValue(value);
    if (normalized !== inputValue) {
      setInputValue(normalized);
    }
  }, [value, inputValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const numeric = raw.replace(/\D+/g, ''); // hanya digit
    if (numeric === '') {
      setInputValue('');
      onValueChange?.(null); // ← penting: JANGAN kirim '0'
      return;
    }

    setInputValue(numeric);
    onValueChange?.(numeric);
  };

  const inputStopPropagation = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="relative w-full">
      <InputMask
        mask="999999999999999999999999"
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
        inputMode="numeric" // bantu keyboard numerik di mobile
        pattern="[0-9]*"
        className={cn(
          'flex h-9 w-full rounded-sm border border-zinc-300 bg-transparent px-3 py-1 text-xs font-normal uppercase text-zinc-900 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:bg-[#ffffee] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          readOnly ? 'text-zinc-700' : '',
          'tracking-normal', // Add this class for normal letter spacing
          className,
          // Add the conditional class for disabled background color
          disabled ? 'border-zinc-400 bg-gray-200' : '' // Set gray background for disabled state
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
