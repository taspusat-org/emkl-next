import React, { useEffect, useState } from 'react';
import InputMask from '@mona-health/react-input-mask';

type CurrencyInputProps = {
  value?: string;
  onValueChange?: (val: string) => void;
  icon?: React.ReactNode;
  className?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  isPercent?: boolean;
  placeholder?: string;
  onBlur?: () => void;
};

const InputCurrency: React.FC<CurrencyInputProps> = ({
  value = '',
  onValueChange,
  onBlur,
  icon,
  className = '',
  autoFocus = false,
  isPercent = false,
  readOnly = false,
  disabled = false,
  placeholder = ''
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Helper to extract sign and numeric part
  const getSignAndNumeric = (
    str: string
  ): { sign: string; numeric: string } => {
    if (str.startsWith('-')) {
      return { sign: '-', numeric: str.slice(1) };
    }
    return { sign: '', numeric: str };
  };

  // Format number with thousand separators only (no decimal forcing)
  const formatWithCommas = (rawValue: string): string => {
    const { sign, numeric } = getSignAndNumeric(rawValue);

    // Remove all non-numeric characters except dots from numeric part
    const cleaned = numeric.replace(/[^0-9.]/g, '');

    if (cleaned === '') {
      return sign;
    }

    // Split by decimal point
    const parts = cleaned.split('.');

    // Format integer part with commas
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Handle decimal part
    if (parts.length > 1) {
      // Limit decimal places to 2
      parts[1] = parts[1].slice(0, 2);
      return sign + parts.join('.');
    }

    return sign + parts[0];
  };

  // Format with .00 decimal (for blur and initial value)
  const formatWithDecimal = (rawValue: string): string => {
    if (!rawValue || rawValue === '') return '';

    const { sign, numeric } = getSignAndNumeric(rawValue);

    // Remove all non-numeric characters except dots from numeric part
    const cleaned = numeric.replace(/[^0-9.]/g, '');

    let integerPart = '0';
    let decimalPart = '00';

    if (cleaned !== '') {
      // Split by decimal point
      const parts = cleaned.split('.');

      // Format integer part with commas
      integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

      // Handle decimal part
      if (parts.length > 1) {
        decimalPart = (parts[1] + '00').slice(0, 2);
      }
    }

    return sign + integerPart + '.' + decimalPart;
  };

  // Initialize value on mount or when external value changes
  useEffect(() => {
    if (!isFocused) {
      const valueStr = String(value || '');

      if (valueStr === '') {
        setInputValue('');
      } else {
        // Check if value already has proper formatting
        const hasDecimal = valueStr.includes('.');
        const hasComma = valueStr.includes(',');

        // If value doesn't have decimal or comma, format it with decimal
        if (!hasDecimal && !hasComma && valueStr !== '') {
          setInputValue(formatWithDecimal(valueStr));
        } else if (!hasDecimal && valueStr !== '') {
          // If only missing decimal, add it
          setInputValue(formatWithDecimal(valueStr));
        } else {
          // Value already formatted, just ensure commas are in place
          setInputValue(formatWithCommas(valueStr));
        }
      }
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Check for percent validation
    if (isPercent) {
      // Clean for parsing: remove commas, keep only digits, ., and - at start
      const clean = raw.replace(/,/g, '').replace(/[^0-9.-]/g, '');
      let parseStr: string;
      if (clean === '-' || clean.startsWith('-')) {
        const numPart = clean.slice(1).replace(/[^0-9.]/g, '');
        parseStr = '-' + numPart;
      } else {
        parseStr = clean.replace(/[^0-9.]/g, '');
      }
      const numericValue = parseFloat(parseStr);
      if (isNaN(numericValue) || numericValue < 0 || numericValue > 100) {
        return; // Don't update if invalid for percent
      }
    }

    // Format with commas only (no forced decimal during typing)
    const formatted = formatWithCommas(raw);
    setInputValue(formatted);
    onValueChange?.(formatted);
  };

  const handleBlur = () => {
    setIsFocused(false);

    if (!inputValue || inputValue === '') {
      setInputValue('');
      onValueChange?.('');
    } else {
      // Format with decimal on blur
      const formatted = formatWithDecimal(inputValue);
      setInputValue(formatted);
      onValueChange?.(formatted);
    }
    onBlur?.();
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    e.target.select();
  };

  const inputStopPropagation = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };

  // Custom beforeMaskedStateChange to handle cursor position
  const beforeMaskedStateChange = ({ nextState }: any) => {
    const { value: nextValue } = nextState;

    // Only format with commas during typing (no decimal forcing)
    const formatted = formatWithCommas(nextValue || '');

    // Calculate cursor position
    const oldLength = inputValue.length;
    const newLength = formatted.length;
    const diff = newLength - oldLength;

    let cursorPosition = nextState.selection.start;

    // Adjust cursor position if comma was added before cursor
    if (diff > 0) {
      const beforeCursor = nextValue.slice(0, nextState.selection.start);
      const formattedBeforeCursor = formatWithCommas(beforeCursor);
      cursorPosition = formattedBeforeCursor.length;
    }

    return {
      value: formatted,
      selection: {
        start: cursorPosition,
        end: cursorPosition
      }
    };
  };

  return (
    <div className="relative w-full">
      <InputMask
        mask=""
        inputMode="text"
        maskPlaceholder={null}
        maskChar={null}
        value={inputValue}
        readOnly={readOnly}
        disabled={disabled}
        beforeMaskedStateChange={beforeMaskedStateChange}
        onChange={handleChange}
        // autoFocus
        onKeyDown={inputStopPropagation}
        onClick={(e: any) => e.stopPropagation()}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`h-9 w-full rounded-sm border border-zinc-300 px-1 py-1 text-right text-sm focus:border-blue-500 focus:bg-[#ffffee] focus:outline-none focus:ring-0 ${className} ${
          readOnly || disabled ? 'text-zinc-400' : 'text-zinc-900'
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
