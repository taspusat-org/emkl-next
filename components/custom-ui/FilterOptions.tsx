import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { api2 } from '@/lib/utils/AxiosInstance';

interface SelectOptionProps {
  endpoint: string;
  filterBy?: Record<string, string>;
  onChange: (value: string) => void;
  /** nama field di response untuk value (mis. "id") */
  value?: string;
  /** nama field di response untuk label (mis. "text") */
  label?: string;
  /** bisa label atau value; keduanya didukung */
  defaultValue?: string;
  /** nilai terpilih dari parent (controlled). Boleh kosong (''). */
  selectedValue?: string;
}

const FilterOptions: React.FC<SelectOptionProps> = ({
  endpoint,
  filterBy,
  value: valueKey = '',
  label: labelKey = '',
  defaultValue = '',
  selectedValue,
  onChange
}) => {
  const [options, setOptions] = useState<{ value: string; label: string }[]>(
    []
  );
  const [localSelectedValue, setLocalSelectedValue] = useState<string>('');

  const fetchData = async () => {
    try {
      const response = await api2.get(`/${endpoint}`, { params: filterBy });

      // Tentukan apakah data ada di response.data.data atau langsung di response.data
      const optionsData = (response.data?.data ?? response.data ?? []).map(
        (item: any) => ({
          value: String(item[valueKey] ?? ''),
          label: String(item[labelKey] ?? '')
        })
      );

      // Menambahkan opsi 'ALL' sebagai pilihan pertama
      setOptions([{ value: '', label: 'ALL' }, ...optionsData]);
    } catch (error) {
      console.error('Error fetching parameter data:', error);
    }
  };

  // Ambil opsi saat endpoint / filterBy berubah
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, JSON.stringify(filterBy), valueKey, labelKey]);

  // Sinkronkan nilai dari parent kalau diberikan (controlled)
  useEffect(() => {
    if (selectedValue !== undefined && selectedValue !== localSelectedValue) {
      setLocalSelectedValue(selectedValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedValue]);

  // Setelah opsi tersedia, set default awal:
  // - Jika parent belum ngasih selectedValue (undefined), pakai defaultValue
  // - defaultValue bisa berupa value ATAU label (case-insensitive)
  useEffect(() => {
    if (selectedValue !== undefined) return; // parent yang pegang kendali

    if (!options.length) return;
    if (!defaultValue) return;

    const dv = String(defaultValue).toLowerCase();

    // Coba treat defaultValue sebagai value dulu
    let match =
      options.find((o) => o.value.toLowerCase() === dv) ||
      // kalau tidak ketemu, treat sebagai label
      options.find((o) => o.label.toLowerCase() === dv);

    if (match && match.value !== localSelectedValue) {
      setLocalSelectedValue(match.value);
      onChange?.(match.value); // push ke parent agar filters.filters.statusaktif langsung terisi
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, defaultValue, selectedValue]);

  const handleChange = (val: string) => {
    setLocalSelectedValue(val);
    onChange?.(val);
  };

  const selectedLabel =
    localSelectedValue === ''
      ? 'ALL'
      : options.find((o) => o.value === localSelectedValue)?.label ??
        localSelectedValue;

  return (
    <Select value={localSelectedValue} onValueChange={handleChange}>
      <SelectTrigger className="filter-select z-[999999] mr-1 h-8 w-full cursor-pointer overflow-hidden rounded-none border border-gray-300 p-1 text-xs font-thin">
        <SelectValue>{selectedLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option, idx) => (
            <SelectItem
              key={`${option.value}-${idx}`}
              className="cursor-pointer text-xs"
              value={option.value}
            >
              <p className="text-sm font-normal">{option.label}</p>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default FilterOptions;
