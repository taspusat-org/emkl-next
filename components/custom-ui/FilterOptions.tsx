import React, { useState, useEffect, useRef } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { api2 } from '@/lib/utils/AxiosInstance';
import { usePathname } from 'next/navigation';

interface SelectOptionProps {
  endpoint: string;
  columnKey: string;
  filterBy?: Record<string, string>;
  onChange: (value: string) => void;
  value?: string;
  label?: string;
  defaultValue?: string;
  selectedValue?: string;
}

const CONFIG_PATH =
  process.env.NEXT_PUBLIC_FILTERING_CONFIG_PATH ??
  '/config/default-filter.json';

const FilterOptions: React.FC<SelectOptionProps> = ({
  columnKey,
  endpoint,
  filterBy,
  value: valueKey = '',
  label: labelKey = '',
  defaultValue: defaultValueProp = '',
  selectedValue,
  onChange
}) => {
  const pathname = usePathname();
  const slug = pathname.split('/').pop() ?? '';

  const [options, setOptions] = useState<{ value: string; label: string }[]>(
    []
  );
  const [localSelectedValue, setLocalSelectedValue] = useState<string>('');

  // Ref agar tidak trigger re-render, tapi bisa diakses lintas useEffect
  const configDefaultRef = useRef<string | null>(null);
  const configLoadedRef = useRef(false);
  const optionsRef = useRef<{ value: string; label: string }[]>([]);
  const optionsLoadedRef = useRef(false);

  // ── Fungsi apply default: jalankan hanya saat kedua fetch sudah selesai ──
  const applyDefault = (
    currentOptions: { value: string; label: string }[],
    defaultVal: string
  ) => {
    if (selectedValue !== undefined) return; // parent controlled, skip
    if (!defaultVal) return;

    const dv = defaultVal.toLowerCase();
    const match =
      currentOptions.find((o) => o.value.toLowerCase() === dv) ||
      currentOptions.find((o) => o.label.toLowerCase() === dv);

    if (match) {
      setLocalSelectedValue(match.value);
      onChange?.(match.value);
    }
  };

  // ── 1. Fetch default-filter.json ──
  useEffect(() => {
    configLoadedRef.current = false;
    configDefaultRef.current = null;

    const fetchConfig = async () => {
      try {
        const res = await fetch(CONFIG_PATH);
        if (res.ok) {
          const config = await res.json();
          const pageSection = config[slug];
          let found: string | undefined;

          if (Array.isArray(pageSection)) {
            // Format array: [{ "statusaktif": "AKTIF" }, ...]
            const matched = pageSection.find(
              (obj: Record<string, string>) => obj[columnKey] !== undefined
            );
            found = matched?.[columnKey];
          } else if (pageSection && typeof pageSection === 'object') {
            // Format object: { "statusaktif": "AKTIF", ... }
            found = pageSection[columnKey];
          }

          configDefaultRef.current = found ?? defaultValueProp;
        } else {
          configDefaultRef.current = defaultValueProp;
        }
      } catch {
        configDefaultRef.current = defaultValueProp;
      }

      configLoadedRef.current = true;

      // Options sudah selesai duluan? Langsung apply.
      if (optionsLoadedRef.current) {
        applyDefault(optionsRef.current, configDefaultRef.current ?? '');
      }
    };

    fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, columnKey]);

  // ── 2. Fetch opsi dari API ──
  useEffect(() => {
    optionsLoadedRef.current = false;

    const fetchData = async () => {
      try {
        const response = await api2.get(`/${endpoint}`, { params: filterBy });

        const optionsData = (response.data?.data ?? response.data ?? []).map(
          (item: any) => ({
            value: String(item[valueKey] ?? ''),
            label: String(item[labelKey] ?? '')
          })
        );

        const finalOptions = [{ value: '', label: 'ALL' }, ...optionsData];

        optionsRef.current = finalOptions;
        setOptions(finalOptions);
        optionsLoadedRef.current = true;

        // Config sudah selesai duluan? Langsung apply.
        if (configLoadedRef.current) {
          applyDefault(
            finalOptions,
            configDefaultRef.current ?? defaultValueProp
          );
        }
      } catch (error) {
        console.error('Error fetching parameter data:', error);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, JSON.stringify(filterBy), valueKey, labelKey]);

  // ── 3. Sinkronkan nilai dari parent (controlled) ──
  useEffect(() => {
    if (selectedValue !== undefined && selectedValue !== localSelectedValue) {
      setLocalSelectedValue(selectedValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedValue]);

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
      <SelectTrigger className="filter-select z-[999999] mr-1 h-8 w-full cursor-pointer overflow-hidden rounded-none border border-input-border bg-background-input p-1 text-xs font-thin ">
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
