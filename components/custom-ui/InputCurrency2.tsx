import React, { useState, useEffect } from 'react';
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

  // Sinkronkan nilai awal dari props (jika perlu)
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Format integer dengan koma ribuan
  const formatInt = (intStr: string) =>
    (intStr || '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Helper: format currency sambil mempertahankan titik di akhir kalau user baru mengetik '.'
  const formatCurrency = (rawValue: string) => {
    // Hilangkan karakter selain angka atau titik
    const raw = rawValue.replace(/[^0-9.]/g, '');

    // Deteksi titik di akhir
    const endsWithDot = raw.endsWith('.');

    // Ambil hanya titik pertama (abaikan titik-titik berikutnya)
    const [intPartRaw = '', decPartRaw = ''] = raw.split('.');

    const formattedInt = formatInt(intPartRaw);

    if (endsWithDot) {
      // User baru saja mengetik '.', pertahankan
      return `${formattedInt}.`;
    }

    // Batasi 2 desimal saat mengetik
    const dec = decPartRaw.slice(0, 2);

    return dec ? `${formattedInt}.${dec}` : formattedInt;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Hilangkan koma dari tampilan sebelumnya agar perhitungan konsisten
    let raw = e.target.value.replace(/,/g, '');

    // Normalisasi: hanya pakai titik pertama, batasi 2 desimal
    const [intPart = '', decPartRaw = ''] = raw.split('.');
    const decPart = decPartRaw.slice(0, 2);

    // Bangun kembali raw untuk formatter; jika user sudah mengetik titik,
    // pertahankan titik meskipun desimal masih kosong
    raw = raw.includes('.') ? `${intPart}.${decPart}` : intPart;

    const formatted = formatCurrency(raw);

    setInputValue(formatted);
    onValueChange?.(formatted);
  };

  // Saat blur, pastikan selalu punya 2 desimal (pad dengan 0)
  const handleBlur = () => {
    const raw = (inputValue || '').replace(/,/g, '');

    if (raw === '') {
      setInputValue('');
      onValueChange?.('');
      return;
    }

    const endsWithDot = raw.endsWith('.');
    const [intPartRaw = '', decRaw = ''] = raw.split('.');
    const formattedInt = formatInt(intPartRaw || '0'); // fungsi yang sama untuk ribuan

    let finalVal: string;

    if (!raw.includes('.')) {
      // Tidak ada titik → angka bulat → tambahkan .00
      finalVal = `${formattedInt}.00`;
    } else if (endsWithDot) {
      // Ada titik & di akhir → pertahankan trailing dot
      finalVal = `${formattedInt}.`;
    } else {
      // Ada titik & ada desimal → potong max 2 digit, JANGAN pad
      finalVal = `${formattedInt}${decRaw ? `.${decRaw.slice(0, 2)}` : ''}`;
    }

    setInputValue(finalVal);
    onValueChange?.(finalVal);
  };
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <div className="relative w-full">
      <InputMask
        mask="" // tidak ada pola mask tetap
        maskPlaceholder={null}
        maskChar={null}
        value={inputValue}
        readOnly={readOnly}
        onChange={handleChange}
        autoFocus={autoFocus}
        onFocus={handleFocus}
        onBlur={handleBlur}
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
