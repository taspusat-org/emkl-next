import { FaTimes } from 'react-icons/fa';
import React, { useCallback, useEffect, useState, memo } from 'react';
import { Input } from '../ui/input';

const FilterInput = memo(
  ({
    colKey,
    value,
    onChange,
    onClear,
    inputRef
  }: {
    colKey: string;
    value: string;
    onChange: (value: string) => void;
    onClear: () => void;
    inputRef: (el: HTMLInputElement | null) => void;
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
        />
        {localValue && (
          <button
            className="absolute right-2 top-2 text-xs text-gray-500"
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
