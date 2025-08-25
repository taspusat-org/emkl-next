import React, { useEffect, useState } from 'react';
import InputMask from '@mona-health/react-input-mask';

type CurrencyInputProps = {
  value?: string;
  onValueChange?: (val: string) => void;
  icon?: React.ReactNode;
  className?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  isPercent?: boolean;
  placeholder?: string;
};

const InputCurrency: React.FC<CurrencyInputProps> = ({
  value = '',
  onValueChange,
  icon,
  className = '',
  autoFocus = false,
  isPercent = false,
  readOnly = false,
  placeholder = ''
}) => {
  const [inputValue, setInputValue] = useState(value);

  const formatCurrency = (rawValue: string) => {
    const raw = rawValue.replace(/[^0-9.]/g, '');
    const [intPartRaw = '', decPartRaw = ''] = raw.split('.');
    const endsWithDot = raw.endsWith('.');

    if (endsWithDot) {
      return `${intPartRaw}.`;
    }

    const dec = decPartRaw.slice(0, 2);
    if (dec) {
      return `${intPartRaw.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${dec}`;
    }
    const formattedInt = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return formattedInt;
  };

  const beforeMaskedStateChange = ({ nextState }: any) => {
    const formatted = formatCurrency(nextState.value || '');
    return {
      value: formatted,
      selection: { start: formatted.length, end: formatted.length }
    };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;
    let formatted = formatCurrency(raw);

    // Jika isPercent adalah true, batasi agar nilai tidak lebih dari 100
    if (isPercent) {
      const numericValue = parseFloat(raw.replace(/[^0-9.]/g, ''));
      if (numericValue > 100) {
        raw = '100';
        formatted = formatCurrency(raw);
      }
    }

    setInputValue(formatted);
    onValueChange?.(formatted);
  };

  const handleBlur = (formattedStr: string) => {
    if (!formattedStr) {
      setInputValue('');
    } else if (formattedStr.includes('.')) {
      setInputValue(formattedStr);
    } else {
      setInputValue(formattedStr + '.00');
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
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
        value={inputValue}
        readOnly={readOnly}
        beforeMaskedStateChange={beforeMaskedStateChange}
        onChange={handleChange}
        autoFocus={autoFocus}
        onKeyDown={inputStopPropagation}
        onClick={(e: any) => e.stopPropagation()}
        onFocus={handleFocus}
        onBlur={() => handleBlur(inputValue)}
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

export default InputCurrency;
