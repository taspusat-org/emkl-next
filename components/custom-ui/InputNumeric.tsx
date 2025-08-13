import React, { useState } from 'react';
import InputMask from '@mona-health/react-input-mask';

type NumericInputProps = {
  value?: string;
  onValueChange?: (val: string) => void;
  icon?: React.ReactNode;
  className?: string;
  autoFocus?: boolean;
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
  placeholder = ''
}) => {
  const normalizeValue = (val: string | number) =>
    typeof val === 'number' ? String(val) : val;

  const [inputValue, setInputValue] = useState<string>(normalizeValue(value));
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);
    onValueChange?.(raw);
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
        value={inputValue} // Using processed value
        readOnly={readOnly}
        onChange={handleChange}
        autoFocus={autoFocus}
        onKeyDown={inputStopPropagation}
        onClick={(e: any) => e.stopPropagation()}
        placeholder={placeholder}
        className={`h-9 w-full rounded-sm border border-zinc-300 px-1 py-1 text-right text-sm focus:border-blue-500 focus:bg-[#ffffee] focus:outline-none focus:ring-0 ${className} ${
          readOnly ? 'text-zinc-400' : 'text-zinc-900'
        }`}
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
