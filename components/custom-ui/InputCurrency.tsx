import React, { useEffect, useState } from 'react';
import InputMask from '@mona-health/react-input-mask';

type CurrencyInputProps = {
  value?: string;
  onValueChange?: (val: string) => void;
  icon?: React.ReactNode;
  className?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  placeholder?: string;
};

const InputCurrency: React.FC<CurrencyInputProps> = ({
  value = '',
  onValueChange,
  icon,
  className = '',
  autoFocus = false,
  readOnly = false,
  placeholder = ''
}) => {
  const [inputValue, setInputValue] = useState(value);

  const formatCurrency = (rawValue: string) => {
    const raw = rawValue.replace(/[^0-9.]/g, '');
    const [intPartRaw = '', decPartRaw = ''] = raw.split('.');
    const endsWithDot = raw.endsWith('.');

    if (endsWithDot) {
      // User baru saja mengetik '.', pertahankan
      return `${intPartRaw}.`;
    }

    // Batasi 2 desimal saat mengetik
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
    const raw = e.target.value;
    const formatted = formatCurrency(raw);
    setInputValue(formatted);
    onValueChange?.(formatted);
  };

  const handleBlur = (formattedStr: string) => {
    // Jika nilai kosong, langsung set tanpa menambahkan .00
    if (!formattedStr) {
      setInputValue('');
    }
    // Jika sudah ada desimal, jangan tambahkan .00 lagi
    else if (formattedStr.includes('.')) {
      setInputValue(formattedStr);
    }
    // Jika tidak ada desimal, tambahkan .00
    else {
      setInputValue(formattedStr + '.00');
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Select all text when focused
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
