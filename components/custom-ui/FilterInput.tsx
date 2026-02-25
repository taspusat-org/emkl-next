import { FaTimes } from 'react-icons/fa';
import React, { useCallback, useEffect, useState, memo } from 'react';
import { Input } from '../ui/input';

export const shouldAllowSelectCell = (): boolean => {
  const activeElement = document.activeElement;

  // Cek apakah yang fokus adalah input atau textarea
  if (
    activeElement instanceof HTMLInputElement ||
    activeElement instanceof HTMLTextAreaElement
  ) {
    return false;
  }

  return true;
};
const FilterInput = memo(
  ({
    colKey,
    value,
    onChange,
    onClear,
    inputRef,
    autoFocus = false,
    tabIndex = 0,
    onClick = () => {}
  }: {
    colKey: string;
    value: string;
    onChange: (value: string) => void;
    onClear: () => void;
    inputRef: (el: HTMLInputElement | null) => void;
    autoFocus?: boolean;
    tabIndex?: number;
    onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
  }) => {
    const [localValue, setLocalValue] = useState(value);

    // Sync dengan parent value jika berubah dari luar (clear, etc)
    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value.toUpperCase();
        setLocalValue(newValue); // Update local immediately
        onChange(newValue); // Debounced update ke parent
      },
      [onChange]
    );

    return (
      <div className="relative h-[50%] w-full px-1">
        <Input
          ref={inputRef}
          className="filter-input z-[999999] h-8 rounded-none text-sm"
          value={localValue}
          type="text"
          onChange={handleChange}
          autoFocus={autoFocus}
          tabIndex={tabIndex}
          onClick={onClick}
        />
        {localValue && (
          <button
            className="text-primary-text absolute right-2 top-2 text-xs"
            onClick={onClear}
            type="button"
          >
            <FaTimes />
          </button>
        )}
      </div>
    );
  }
);
export default FilterInput;
