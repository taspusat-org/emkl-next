/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useGetMenu } from '@/lib/server/useMenu';
import { Button } from '@/components/ui/button';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import LookUp from '@/components/custom-ui/LookUp';
import { Input } from '@/components/ui/input';
import { IoMdClose, IoMdRefresh } from 'react-icons/io';
import { FaSave, FaTimes } from 'react-icons/fa';
import InputMask from '@mona-health/react-input-mask';
import DataGrid, {
  CellKeyDownArgs,
  Column,
  DataGridHandle
} from 'react-data-grid';
import {
  formatCurrency,
  formatDateCalendar,
  formatDateToDDMMYYYY,
  isLeapYear,
  parseCurrency,
  parseDateFromDDMMYYYY
} from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { parse } from 'date-fns';
import { KasGantungHeader } from '@/lib/types/kasgantungheader.type';
import { Checkbox } from '@/components/ui/checkbox';
import InputDatePicker from '@/components/custom-ui/InputDatePicker';
import {
  useGetKasGantungHeader,
  useGetKasGantungHeaderList,
  useGetKasGantungHeaderPengembalian
} from '@/lib/server/useKasGantung';
import { useGetPengembalianKasGantungDetail } from '@/lib/server/usePengembalianKasGantung';
const FormPengembalianKasGantung = ({
  popOver,
  setPopOver,
  forms,
  onSubmit,
  mode,
  handleClose,
  isLoadingCreate,
  isLoadingUpdate,
  isLoadingDelete
}: any) => {
  const headerData = useSelector((state: RootState) => state.header.headerData);
  const {
    data: detail,
    isLoading,
    refetch: refetchDetail
  } = useGetPengembalianKasGantungDetail(headerData?.id ?? 0);
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [isReload, setIsReload] = useState<boolean>(false);
  const [popOverTglDari, setPopOverTglDari] = useState<boolean>(false);
  const [popOverTglSampai, setPopOverTglSampai] = useState<boolean>(false);
  const [editingRowId, setEditingRowId] = useState<number | null>(null); // Menyimpan ID baris yang sedang diedit
  const [tglDari, setTglDari] = useState<string>('');
  const [tglSampai, setTglSampai] = useState<string>('');
  const [checkedRows, setCheckedRows] = useState<Set<number>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [dataGridKey, setDataGridKey] = useState(0);
  const openName = useSelector((state: RootState) => state.lookup.openName);
  const selectLookup = useSelector(
    (state: RootState) => state.selectLookup.selectLookup['BANK']
  );

  const [filters, setFilters] = useState({
    nobukti: '',
    tglbukti: '',
    keterangan: '',
    sisa: '',
    nominal: ''
  });
  const gridRef = useRef<DataGridHandle>(null);
  const {
    data: allData,
    isLoading: isLoadingData,
    refetch
  } = useGetKasGantungHeaderList(
    {
      dari: tglDari,
      sampai: tglSampai
    },
    popOver
  );
  const {
    data: dataDetail,
    isLoading: isLoadingDataDetail,
    refetch: refetchListDetail
  } = useGetKasGantungHeaderPengembalian(
    {
      id: headerData.id ?? '',
      dari: tglDari,
      sampai: tglSampai
    },
    popOver // Mengoper popOver ke dalam hook
  );
  const [rows, setRows] = useState<KasGantungHeader[]>([]);
  function handleCellClick(args: { row: KasGantungHeader }) {
    const clickedRow = args.row;
    const rowIndex = rows.findIndex((r) => r.id === clickedRow.id);
    if (rowIndex !== -1) {
      setSelectedRow(rowIndex);
    }
  }
  const handleRowSelect = (rowId: number) => {
    setCheckedRows((prev) => {
      const updated = new Set(prev);
      if (updated.has(rowId)) {
        updated.delete(rowId);
      } else {
        updated.add(rowId);
      }

      setIsAllSelected(updated.size === rows.length);
      return updated;
    });
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setCheckedRows(new Set());
    } else {
      const allIds = rows.map((row) => row.id);
      setCheckedRows(new Set(allIds));
    }
    setIsAllSelected(!isAllSelected);
  };

  // Fungsi untuk menangani double click (memulai mode edit dengan nilai yang diformat)
  const handleDoubleClick = (rowId: number, initialValue: string | number) => {
    if (!checkedRows.has(rowId)) {
      return; // Don't proceed if the row is not selected
    }

    setEditingRowId(rowId);
  };
  const formatWithCommas = (val: string): string => {
    // ambil cuma digit
    const digits = val.replace(/\D/g, '');
    // sisipkan koma setiap 3 digit dari kanan
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Fungsi untuk menangani perubahan input
  const handleChange = (
    rowId: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = e.target.value;
    const formatted = formatWithCommas(newValue);

    // Update the corresponding nominal value in the row
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === rowId ? { ...row, nominal: String(formatted) } : row
      )
    );

    // Ensure the 'nominal' in 'details' field is also updated in the form
    const updatedDetails = forms.getValues('details') || []; // Get the current details
    const updatedArray = updatedDetails.map((detail: any) =>
      detail.id === rowId
        ? { ...detail, nominal: formatted } // Update only the correct detail
        : detail
    );

    // Set updated array to 'details'
    forms.setValue('details', updatedArray);
  };

  const beforeMaskedStateChange = ({
    previousState,
    currentState,
    nextState
  }: {
    previousState: { value: string; selection: any };
    currentState: { value: string; selection: any };
    nextState: { value: string; selection: any };
  }) => {
    const nextVal = nextState.value || '';
    // a) ambil hanya digit & titik
    const raw = nextVal.replace(/[^0-9.]/g, '');
    // b) split integer & decimal (hanya 1 dot pertama)
    const [intPart, ...rest] = raw.split('.');
    const decPart = rest.join(''); // kalau user ngetik lebih dari 1 dot, kita gabung sisanya

    // c) format integer part dengan koma sebagai ribuan
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // d) kalau ada decimal part, re‐attach
    const formatted =
      decPart.length > 0 ? `${formattedInt}.${decPart}` : formattedInt;

    // e) cursor selalu di akhir
    const pos = formatted.length;
    return {
      value: formatted,
      selection: { start: pos, end: pos }
    };
  };
  const handleBlur = (formattedStr: string, rowId: number) => {
    if (!formattedStr.includes(',')) {
      return;
    }

    setEditingRowId(null);

    const finalValue = formattedStr + '.00';

    if (!formattedStr.includes('.')) {
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === rowId ? { ...row, nominal: String(finalValue) } : row
        )
      );
    } else {
      setRows((rs) =>
        rs.map((r) => (r.id === rowId ? { ...r, nominal: formattedStr } : r))
      );
    }

    // Ensure the 'nominal' field in 'details' is updated in the form
    const updatedDetails = forms.getValues('details') || []; // Get the current details
    const updatedArray = updatedDetails.map((detail: any) =>
      detail.id === rowId
        ? { ...detail, nominal: finalValue } // Update only the correct detail
        : detail
    );

    // Set updated array to 'details'
    forms.setValue('details', updatedArray);
  };
  const handleFocus = (rowIdx: number) => {
    setRows((prevRows) => {
      return prevRows.map((row, idx) => {
        if (idx === rowIdx) {
          // Ensure isNew is always a boolean
          const updatedNominal = row.nominal?.endsWith('.00')
            ? row.nominal.slice(0, -3)
            : row.nominal;

          return {
            ...row,
            nominal: updatedNominal // Update nominal value
          };
        }
        return row;
      });
    });
  };
  const handleColumnFilterChange = (
    colKey: keyof typeof filters,
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [colKey]: value
    }));
  };

  // Fungsi untuk mengfilter data berdasarkan filters
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      return (
        (filters.nobukti
          ? row.nobukti.toUpperCase().includes(filters.nobukti.toUpperCase())
          : true) &&
        (filters.tglbukti ? row?.tglbukti?.includes(filters.tglbukti) : true) &&
        (filters.keterangan
          ? row?.keterangan
              ?.toUpperCase()
              .includes(filters.keterangan.toUpperCase())
          : true) &&
        (filters.sisa ? row?.sisa?.toString().includes(filters.sisa) : true) &&
        (filters.nominal
          ? row?.nominal?.toString().includes(filters.nominal)
          : true)
      );
    });
  }, [rows, filters]);
  function highlightText(
    text: string | number | null | undefined,
    search: string,
    columnFilter: string = ''
  ) {
    const textValue = text != null ? String(text) : '';
    if (!textValue) return '';

    if (!search.trim() && !columnFilter.trim()) {
      return textValue;
    }

    const combined = search + columnFilter;
    if (!combined) {
      return textValue;
    }

    // 1. Fungsi untuk escape regex‐meta chars
    const escapeRegExp = (s: string) =>
      s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

    // 2. Pecah jadi tiap karakter, escape, lalu join dengan '|'
    const pattern = combined
      .split('')
      .map((ch) => escapeRegExp(ch))
      .join('|');

    // 3. Build regex-nya
    const regex = new RegExp(`(${pattern})`, 'gi');

    // 4. Replace dengan <span>
    const highlighted = textValue.replace(
      regex,
      (m) =>
        `<span style="background-color: yellow; font-size: 13px">${m}</span>`
    );

    return (
      <span
        className="text-sm"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    );
  }

  interface SummaryRow {
    id: number;
    totalSisa: string;
    totalNominal: string;
  }

  const summaryRows = useMemo((): readonly SummaryRow[] => {
    // Recalculate totalSisa and totalNominal
    const totalSisa = filteredRows.reduce(
      (acc, row) =>
        acc +
        (row.sisa
          ? parseCurrency(String(row.sisa)) - parseCurrency(row.nominal)
          : 0),
      0
    );

    const totalNominal = filteredRows.reduce(
      (acc, row) => acc + (row.nominal ? parseCurrency(row.nominal) : 0),
      0
    );
    return [
      {
        id: 0, // Format the total to string as currency
        totalSisa: formatCurrency(totalSisa), // Format the total to string as currency
        totalNominal: formatCurrency(totalNominal) // Format the total to string as currency
      }
    ];
  }, [filteredRows]); // Dependency on filteredRows, so it updates when filteredRows change

  const columns = useMemo((): Column<KasGantungHeader>[] => {
    return [
      {
        key: 'nomor',
        name: 'NO',
        width: 50,
        resizable: true,
        draggable: true,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full flex-col items-center gap-1">
            <div className="headers-cell h-[50%] items-center justify-center text-center">
              <p className="text-sm  ">No.</p>
            </div>

            <div className="flex h-[50%] w-full cursor-pointer items-center justify-center">
              <FaTimes className="bg-red-500 text-white" />
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const rowIndex = rows.findIndex((row) => row.id === props.row.id);
          return (
            <div className="flex h-full w-full cursor-pointer items-center justify-center text-sm">
              {rowIndex + 1}
            </div>
          );
        }
      },
      {
        key: 'select',
        name: '',
        width: 50,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%]"></div>
            <div className="flex h-[50%] w-full items-center justify-center">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={() => handleSelectAll()}
                id="header-checkbox"
                className="mb-2"
              />
            </div>
          </div>
        ),
        renderCell: ({ row }: { row: KasGantungHeader }) => (
          <div className="flex h-full items-center justify-center">
            <Checkbox
              checked={checkedRows.has(row.id)}
              onCheckedChange={() => handleRowSelect(row.id, row)}
              id={`row-checkbox-${row.id}`}
            />
          </div>
        )
      },
      {
        key: 'nobukti',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 200,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>Nomor Bukti</p>
            </div>
            <div className="relative h-[50%] w-full px-1">
              <Input
                className="filter-input z-[999999] h-8 rounded-none text-sm"
                value={filters.nobukti ? filters?.nobukti?.toUpperCase() : ''}
                type="text"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase(); // Menjadikan input menjadi uppercase
                  handleColumnFilterChange('nobukti', value);
                }}
              />
              {filters.nobukti && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('nobukti', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        name: 'NOMOR BUKTI',
        renderCell: (props: any) => {
          const columnFilter = filters.nobukti || '';
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-sm">
              {highlightText(props.row.nobukti || '', columnFilter)}
            </div>
          );
        }
      },
      {
        key: 'tglbukti',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>TGL Bukti</p>
            </div>
            <div className="relative h-[50%] w-full px-1">
              <Input
                className="filter-input z-[999999] h-8 rounded-none text-sm"
                value={filters.tglbukti ? filters?.tglbukti?.toUpperCase() : ''}
                type="text"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase(); // Menjadikan input menjadi uppercase
                  handleColumnFilterChange('tglbukti', value);
                }}
              />
              {filters.tglbukti && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('tglbukti', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        name: 'TGL BUKTI',
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-sm">
              {highlightText(props.row.tglbukti || '', filters.tglbukti)}
            </div>
          );
        }
      },
      {
        key: 'sisa',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>Sisa</p>
            </div>
            <div className="relative h-[50%] w-full px-1">
              <Input
                className="filter-input z-[999999] h-8 rounded-none text-sm"
                value={filters.sisa ? filters?.sisa?.toUpperCase() : ''}
                type="text"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase(); // Menjadikan input menjadi uppercase
                  handleColumnFilterChange('sisa', value);
                }}
              />
              {filters.sisa && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('sisa', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        name: 'sisa',
        renderCell: (props: any) => {
          const parsedNominal = parseCurrency(props.row.nominal);
          const newSisa =
            parseCurrency(props.row.sisa) - (parsedNominal ? parsedNominal : 0);
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-sm">
              {/* {lookUpPropsRelasi.map((props, index) => (
                <LookUp
                  key={index}
                  {...props}
                  lookupValue={(id) => forms.setValue('relasi_id', Number(id))}
                  inputLookupValue={forms.getValues('relasi_id')}
                  lookupNama={forms.getValues('relasi_nama')}
                />
              ))} */}

              {highlightText(
                mode !== 'add'
                  ? formatCurrency(props.row.sisa)
                  : formatCurrency(newSisa) || '',
                filters.sisa
              )}
            </div>
          );
        },
        renderSummaryCell: () => {
          return (
            <div className="text-sm font-semibold">
              {summaryRows[0]?.totalSisa}
            </div>
          );
        }
      },
      {
        key: 'keterangan',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>Keterangan</p>
            </div>
            <div className="relative h-[50%] w-full px-1">
              <Input
                className="filter-input z-[999999] h-8 rounded-none text-sm"
                value={
                  filters.keterangan ? filters?.keterangan?.toUpperCase() : ''
                }
                type="text"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase(); // Menjadikan input menjadi uppercase
                  handleColumnFilterChange('keterangan', value);
                }}
              />
              {filters.keterangan && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('keterangan', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        name: 'KETERANGAN',
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-sm">
              {props.row.keterangan}
            </div>
          );
        }
      },
      {
        key: 'nominal',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>Nominal</p>
            </div>
            <div className="relative h-[50%] w-full px-1">
              <Input
                className="filter-input z-[999999] h-8 rounded-none text-sm"
                value={filters.nominal ? filters?.nominal?.toUpperCase() : ''}
                type="text"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase(); // Menjadikan input menjadi uppercase
                  handleColumnFilterChange('nominal', value);
                }}
              />
              {filters.nominal && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('nominal', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        name: 'nominal',
        renderCell: (props: any) => {
          const rowId = props.row.id;
          const rowIdx = props.rowIdx;

          // Pengecekan apakah baris dalam mode edit dan baris ini dicentang
          const isEditing = rowId === editingRowId;
          const raw = props.row.nominal ?? '';
          return (
            <div
              className="m-0 flex h-full w-full cursor-pointer items-center py-2 text-sm "
              onDoubleClick={() => handleDoubleClick(rowId, props.row.nominal)} // Menambahkan event double click
            >
              {isEditing ? (
                <InputMask
                  mask=""
                  maskPlaceholder={null}
                  className={`h-7 w-full rounded-sm border border-blue-500 px-1 py-1 text-sm text-zinc-900 focus:bg-[#ffffee] focus:outline-none focus:ring-0`}
                  maskChar={null}
                  value={String(raw) ?? ''}
                  beforeMaskedStateChange={beforeMaskedStateChange}
                  autoFocus
                  onChange={(e: any) => handleChange(rowId, e)}
                  onBlur={() => handleBlur(props.row.nominal, rowId)}
                  onFocus={() => handleFocus(rowIdx)}
                />
              ) : (
                <p className="text-sm">
                  {highlightText(
                    formatCurrency(props.row.nominal) || '',
                    filters.nominal
                  )}
                </p> // Menampilkan nilai jika tidak dalam mode edit
              )}
            </div>
          );
        },
        renderSummaryCell: () => {
          return (
            <div className="text-sm font-semibold">
              {summaryRows[0]?.totalNominal}
            </div>
          );
        }
      }
    ];
  }, [rows, checkedRows, editingRowId, filteredRows, summaryRows]);
  const lookUpPropsRelasi = [
    {
      columns: [{ key: 'nama', name: 'NAMA' }],
      // filterby: { class: 'system', method: 'get' },
      selectedRequired: false,
      label: 'RELASI',
      singleColumn: false,
      pageSize: 20,
      showOnButton: true,
      postData: 'nama'
    }
  ];
  const lookUpPropsBank = [
    {
      columns: [{ key: 'nama', name: 'NAMA' }],
      // filterby: { class: 'system', method: 'get' },
      selectedRequired: false,
      label: 'BANK',
      singleColumn: false,
      pageSize: 20,
      showOnButton: true,
      postData: 'nama'
    }
  ];
  const lookUpPropsAlatBayar = [
    {
      columns: [{ key: 'nama', name: 'NAMA' }],
      // filterby: { class: 'system', method: 'get' },
      endpoint: 'alatbayar',
      filterby: { statuslangsungcair: 1, statusdefault: 1 },
      selectedRequired: false,
      label: 'ALAT BAYAR',

      singleColumn: false,
      pageSize: 20,
      showOnButton: true,
      postData: 'nama'
    }
  ];
  const formRef = useRef<HTMLFormElement | null>(null); // Ref untuk form

  useEffect(() => {
    // Fungsi untuk menangani pergerakan fokus berdasarkan tombol
    const handleKeyDown = (event: KeyboardEvent) => {
      // Jika popOverDate ada nilainya, jangan lakukan apa-apa
      if (openName) {
        return;
      }

      const form = formRef.current;

      if (!form) return;

      const inputs = Array.from(
        form.querySelectorAll('input, select, textarea, button')
      ).filter(
        (element) =>
          element.id !== 'image-dropzone' &&
          element.tagName !== 'BUTTON' &&
          !element.hasAttribute('readonly') // Pengecualian jika input readonly
      ) as HTMLElement[]; // Ambil semua input dalam form kecuali button dan readonly inputs

      const focusedElement = document.activeElement as HTMLElement;

      // Cek apakah elemen yang difokuskan adalah dropzone
      const isImageDropzone =
        document.querySelector('input#image-dropzone') === focusedElement;
      const isFileInput =
        document.querySelector('input#file-input') === focusedElement;

      if (isImageDropzone || isFileInput) return; // Jangan pindah fokus jika elemen fokus adalah dropzone atau input file

      let nextElement: HTMLElement | null = null;

      if (event.key === 'ArrowDown' || event.key === 'Tab') {
        nextElement = getNextFocusableElement(inputs, focusedElement, 'down');
        if (event.key === 'Tab') {
          event.preventDefault(); // Cegah default tab behavior jika ingin mengontrol pergerakan fokus
        }
      } else if (
        event.key === 'ArrowUp' ||
        (event.shiftKey && event.key === 'Tab')
      ) {
        nextElement = getNextFocusableElement(inputs, focusedElement, 'up');
      }
      // Jika ditemukan input selanjutnya, pindahkan fokus
      if (nextElement) {
        nextElement.focus();
      }
    };

    // Fungsi untuk mendapatkan elemen input selanjutnya berdasarkan arah (down atau up)
    const getNextFocusableElement = (
      inputs: HTMLElement[],
      currentElement: HTMLElement,
      direction: 'up' | 'down'
    ): HTMLElement | null => {
      const index = Array.from(inputs).indexOf(currentElement as any);

      if (direction === 'down') {
        // Jika sudah di input terakhir, tidak perlu pindah fokus
        if (index === inputs.length - 1) {
          return null; // Tidak ada elemen selanjutnya
        }
        return inputs[index + 1]; // Fokus pindah ke input setelahnya
      } else {
        return inputs[index - 1]; // Fokus pindah ke input sebelumnya
      }
    };

    // Menambahkan event listener untuk keydown
    document.addEventListener('keydown', handleKeyDown);

    // Membersihkan event listener ketika komponen tidak lagi digunakan
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openName]); // Tambahkan popOverDate sebagai dependensi

  const onReload = () => {
    setIsReload(true);
    setCheckedRows(new Set());
    setIsAllSelected(false);
    refetch();
  };
  const dateMask = [
    /[0-3]/, // D1
    /\d/, // D2
    '-',
    /[0-1]/, // M1
    /\d/, // M2
    '-',
    /\d/, // Y1
    /\d/, // Y2
    /\d/, // Y3
    /\d/ // Y4
  ];

  function EmptyRowsRenderer() {
    return (
      <div
        className="flex h-fit w-full items-center justify-center border border-l-0 border-t-0 border-blue-500 py-1"
        style={{ textAlign: 'center', gridColumn: '1/-1' }}
      >
        <p className="text-gray-400">NO ROWS DATA FOUND</p>
      </div>
    );
  }
  useEffect(() => {
    // Hanya mengupdate rows jika isReload bernilai true
    if (mode && popOver) {
      if (dataDetail && mode !== 'add') {
        const newRows =
          dataDetail?.map((row: KasGantungHeader) => ({
            ...row,
            id: Number(row.id),
            nominal: row.nominal ?? '' // Jika nominal tidak ada, set default ke ""
          })) || [];
        setRows(newRows);
        setIsReload(false); // Setelah data di-set, set kembali isReload ke false
      } else if (isReload && allData && mode === 'add') {
        const newRows =
          allData?.map((row: KasGantungHeader) => ({
            ...row,
            id: Number(row.id),
            nominal: row.nominal ?? '' // Jika nominal tidak ada, set default ke ""
          })) || [];
        setRows(newRows);
        setIsReload(false); // Setelah data di-set, set kembali isReload ke false
      }
    }
  }, [allData, isReload, dataDetail, mode, popOver]);
  useEffect(() => {
    const currentDate = new Date(); // Dapatkan tanggal sekarang

    // Set tglDari to the first day of the current month
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const formattedTglDari = formatDateToDDMMYYYY(firstDayOfMonth); // Format ke DD-MM-YYYY
    setTglDari(formattedTglDari); // Set nilai tglDari

    // Set tglSampai to the last day of the current month
    const lastDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    const formattedTglSampai = formatDateToDDMMYYYY(lastDayOfMonth); // Format ke DD-MM-YYYY
    setTglSampai(formattedTglSampai); // Set nilai tglSampai

    // Set tglbukti di form
    forms.setValue('tglbukti', formattedTglSampai); // Or you can use formattedTglDari depending on your use case
  }, [forms]); // Dependency array ensures it runs only once when the component is mounted
  useEffect(() => {
    if (!popOver) {
      setRows([]);
      setCheckedRows(new Set());
      setIsAllSelected(false);
      lastInitializedDetailKey.current = ''; // Reset key cache
    }
  }, [popOver]);

  // Calculate the total sums of `sisa` and `nominal` dynamically
  const lastInitializedDetailKey = useRef<string>('');

  // Ini akan dijalankan setiap kali popOver buka DAN detail berubah
  useEffect(() => {
    if (popOver && detail && mode !== 'add' && rows.length > 0) {
      const detailKey = JSON.stringify(
        detail.data.map((item: any) => item.kasgantung_nobukti).sort()
      );

      if (detailKey !== lastInitializedDetailKey.current) {
        lastInitializedDetailKey.current = detailKey;

        const detailNoBuktiSet = new Set(
          detail.data.map((item: any) => item.kasgantung_nobukti)
        );

        const matchedRows = rows.filter((row) =>
          detailNoBuktiSet.has(row.nobukti)
        );
        const matchedRowIds = matchedRows.map((row) => row.id);

        setCheckedRows(new Set(matchedRowIds));
        forms.setValue('details', matchedRows, { shouldDirty: true });
      }
    }
  }, [popOver, detail, mode, rows]);

  useEffect(() => {
    const updatedDetail = rows.filter((row) => checkedRows.has(row.id));
    forms.setValue('details', updatedDetail, { shouldDirty: true });
  }, [checkedRows, rows, forms]);

  return (
    <Dialog open={popOver} onOpenChange={setPopOver}>
      <DialogTitle hidden={true}>Title</DialogTitle>
      <DialogContent className="flex h-full min-w-full flex-col overflow-hidden border bg-white">
        <div className="flex items-center justify-between bg-[#e0ecff] px-2 py-2">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Menu Form
          </h2>
          <div
            className="cursor-pointer rounded-md border border-zinc-200 bg-red-500 p-0 hover:bg-red-400"
            onClick={() => {
              setPopOver(false);
              handleClose();
            }}
          >
            <IoMdClose className="h-5 w-5 font-bold text-white" />
          </div>
        </div>
        <div className="h-full flex-1 overflow-y-auto bg-zinc-200 pl-1 pr-2">
          <div className="min-h-full bg-white px-5 py-3">
            <Form {...forms}>
              <form
                ref={formRef}
                onSubmit={onSubmit}
                className="flex h-full flex-col gap-6"
              >
                <div className="flex h-[100%] flex-col gap-2 lg:gap-3">
                  <div className="flex flex-row">
                    <FormField
                      name="nobukti"
                      control={forms.control}
                      render={({ field }) => (
                        <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                          <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[30%]">
                            NO BUKTI
                          </FormLabel>
                          <div className="flex flex-col lg:w-[70%]">
                            <FormControl>
                              <Input
                                {...field}
                                disabled
                                value={field.value ?? ''}
                                type="text"
                                readOnly={mode === 'view' || mode === 'delete'}
                              />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="tglbukti"
                      control={forms.control}
                      render={({ field }) => (
                        <FormItem className="flex w-full flex-col justify-between lg:ml-4 lg:flex-row lg:items-center">
                          <FormLabel
                            required={true}
                            className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[30%]"
                          >
                            TGL BUKTI
                          </FormLabel>
                          <div className="flex flex-col lg:w-[70%]">
                            <FormControl>
                              <InputDatePicker
                                value={field.value}
                                onChange={field.onChange}
                                showCalendar
                                onSelect={(date) =>
                                  forms.setValue('tglbukti', date)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    name="keterangan"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          KETERANGAN
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ''}
                              type="text"
                              readOnly={mode === 'view' || mode === 'delete'}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <div className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                    <div className="w-full lg:w-[15%]">
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        RELASI
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookUpPropsRelasi.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(id) =>
                            forms.setValue('relasi_id', Number(id))
                          }
                          inputLookupValue={forms.getValues('relasi_id')}
                          lookupNama={forms.getValues('relasi_nama')}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex w-full flex-row gap-4">
                    <div className="flex w-full flex-row items-center">
                      <FormLabel
                        required={true}
                        className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[30%]"
                      >
                        TGL DARI
                      </FormLabel>
                      <div className="flex flex-col lg:w-[70%]">
                        <div
                          className={`relative flex flex-row rounded-sm border border-zinc-300 focus:outline-none focus:ring-0 ${
                            mode === 'delete'
                              ? 'text-zinc-400'
                              : 'text-zinc-600'
                          } focus-within:border-blue-500`}
                        >
                          <InputMask
                            mask="99-99-9999" // Set date mask (DD-MM-YYYY format)
                            className="h-9 w-full rounded-sm px-3 py-2 text-sm text-zinc-900 focus:bg-[#ffffee] focus:outline-none focus:ring-0"
                            value={tglDari} // Bind the value to tglDari
                            alwaysShowMask={true}
                            maskPlaceholder="DD-MM-YYYY"
                            placeholder="DD-MM-YYYY"
                            onChange={(e: any) => setTglDari(e.target.value)} // Update tglDari when the input changes
                          />

                          <Popover
                            open={popOverTglDari}
                            onOpenChange={setPopOverTglDari}
                          >
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className="flex w-9 cursor-pointer items-center justify-center border border-[#adcdff] bg-[#e0ecff] text-[#0e2d5f]"
                              >
                                <CalendarIcon className="h-4 w-4 text-gray-500" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="right-4 w-fit max-w-xs border border-blue-500 bg-white"
                              style={{ position: 'fixed' }}
                              sideOffset={-1}
                            >
                              <Calendar
                                mode="single"
                                captionLayout="dropdown-buttons"
                                fromYear={1960}
                                toYear={2030}
                                defaultMonth={
                                  tglDari && tglDari !== 'DD-MM-YYYY'
                                    ? parse(tglDari, 'dd-MM-yyyy', new Date())
                                    : new Date()
                                }
                                selected={
                                  tglDari
                                    ? parseDateFromDDMMYYYY(tglDari)
                                    : undefined
                                }
                                onSelect={(value: any) => {
                                  if (value) {
                                    const formattedDate =
                                      formatDateCalendar(value); // Format the selected date to string
                                    setTglDari(formattedDate); // Update the tglDari state with the formatted date
                                    setPopOverTglDari(false); // Close the popover
                                  }
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full flex-row items-center lg:ml-4">
                      <FormLabel
                        required={true}
                        className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[30%]"
                      >
                        SAMPAI TGL
                      </FormLabel>
                      <div className="flex flex-col lg:w-[70%]">
                        <div
                          className={`relative flex flex-row rounded-sm border border-zinc-300 focus:outline-none focus:ring-0 ${
                            mode === 'delete'
                              ? 'text-zinc-400'
                              : 'text-zinc-600'
                          } focus-within:border-blue-500`}
                        >
                          <InputMask
                            mask="99-99-9999" // Set date mask (DD-MM-YYYY format)
                            className="h-9 w-full rounded-sm px-3 py-2 text-sm text-zinc-900 focus:bg-[#ffffee] focus:outline-none focus:ring-0"
                            value={tglSampai} // Bind the value to tglSampai
                            alwaysShowMask={true}
                            maskPlaceholder="DD-MM-YYYY"
                            placeholder="DD-MM-YYYY"
                            onChange={(e: any) => setTglSampai(e.target.value)} // Update tglSampai when the input changes
                          />

                          <Popover
                            open={popOverTglSampai}
                            onOpenChange={setPopOverTglSampai}
                          >
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className="flex w-9 cursor-pointer items-center justify-center border border-[#adcdff] bg-[#e0ecff] text-[#0e2d5f]"
                              >
                                <CalendarIcon className="h-4 w-4 text-gray-500" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="right-4 w-fit max-w-xs border border-blue-500 bg-white"
                              style={{ position: 'fixed' }}
                              sideOffset={-1}
                            >
                              <Calendar
                                mode="single"
                                captionLayout="dropdown-buttons"
                                fromYear={1960}
                                toYear={2030}
                                defaultMonth={
                                  tglSampai && tglSampai !== 'DD-MM-YYYY'
                                    ? parse(tglSampai, 'dd-MM-yyyy', new Date())
                                    : new Date()
                                }
                                selected={
                                  tglSampai
                                    ? parseDateFromDDMMYYYY(tglSampai)
                                    : undefined
                                }
                                onSelect={(value: any) => {
                                  if (value) {
                                    const formattedDate =
                                      formatDateCalendar(value); // Format the selected date to string
                                    setTglSampai(formattedDate); // Update the tglDari state with the formatted date
                                    setPopOverTglSampai(false); // Close the popover
                                  }
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="default"
                    type="button"
                    className="mt-2 flex w-fit flex-row items-center justify-center px-4"
                    onClick={onReload}
                  >
                    <IoMdRefresh />
                    <p style={{ fontSize: 12 }} className="font-normal">
                      Reload
                    </p>
                  </Button>
                  <div className="border-gray flex w-full flex-col gap-4 border border-gray-300 px-2 py-3">
                    <p className="text-sm text-black">POSTING PENERIMAAN</p>
                    <div className="flex flex-row lg:gap-3">
                      <div className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <div className="w-full lg:w-[15%]">
                          <FormLabel className="text-sm font-semibold text-gray-700">
                            KAS/BANK
                          </FormLabel>
                        </div>
                        <div className="w-full lg:w-[70%]">
                          {lookUpPropsBank.map((props, index) => (
                            <LookUp
                              key={index}
                              {...props}
                              lookupValue={(id) =>
                                forms.setValue('statusbank', Number(id))
                              }
                              inputLookupValue={forms.getValues('bank_id')}
                              lookupNama={forms.getValues('bank_nama')}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <div className="w-full lg:w-[15%]">
                          <FormLabel className="text-sm font-semibold text-gray-700">
                            ALAT BAYAR
                          </FormLabel>
                        </div>
                        <div className="w-full lg:w-[70%]">
                          {lookUpPropsAlatBayar.map((props, index) => (
                            <LookUp
                              key={index}
                              {...props}
                              filterby={[
                                { statusbank: selectLookup?.statusbank }
                              ]}
                              lookupValue={(id) =>
                                forms.setValue('relasi_id', Number(id))
                              }
                              inputLookupValue={forms.getValues('relasi_id')}
                              lookupNama={forms.getValues('relasi_nama')}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <FormField
                        name="nobukti"
                        control={forms.control}
                        render={({ field }) => (
                          <FormItem className="flex w-full flex-col lg:flex-row lg:items-center">
                            <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                              NO BUKTI KAS GANTUNG
                            </FormLabel>
                            <div className="flex flex-col lg:w-[35%]">
                              <FormControl>
                                <Input
                                  disabled
                                  value=""
                                  type="text"
                                  readOnly={
                                    mode === 'view' || mode === 'delete'
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="h-[400px] min-h-[550px]">
                    <div className="flex h-[100%] w-full flex-col rounded-sm border border-blue-500 bg-white">
                      <div
                        className="flex h-[38px] w-full flex-row items-center rounded-t-sm border-b border-blue-500 px-2"
                        style={{
                          background:
                            'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 100%)'
                        }}
                      ></div>

                      <DataGrid
                        key={dataGridKey}
                        ref={gridRef}
                        columns={columns}
                        onCellClick={handleCellClick}
                        rows={filteredRows}
                        bottomSummaryRows={summaryRows}
                        onSelectedCellChange={(args) => {
                          handleCellClick({ row: args.row });
                        }}
                        headerRowHeight={70}
                        rowHeight={30}
                        renderers={{ noRowsFallback: <EmptyRowsRenderer /> }}
                        className="rdg-light fill-grid text-sm"
                      />
                      {/* <div
                        className="flex flex-row border border-b-0 border-l-0 border-blue-500 p-2"
                        style={{ gridColumn: '1/-1' }}
                      >
                        <div className="flex w-full flex-row items-center justify-between">
                          <p className="text-sm font-semibold">Total</p>
                          <div className="flex flex-row gap-3">
                            <p className="text-sm font-semibold">
                              {formatCurrency(totalSisa)}
                            </p>
                            <p className="text-sm font-semibold">
                              {formatCurrency(totalNominal)}
                            </p>
                          </div>
                        </div>
                      </div> */}
                      <div
                        className="flex flex-row justify-between border border-x-0 border-b-0 border-blue-500 p-2"
                        style={{
                          background:
                            'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 100%)'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
        <div className="m-0 flex h-fit items-end gap-2 bg-zinc-200 px-3 py-2">
          <Button
            type="submit"
            onClick={onSubmit}
            disabled={mode === 'view'}
            className="flex w-fit items-center gap-1 text-sm"
          >
            <FaSave />
            <p className="text-center">
              {mode === 'delete' ? 'DELETE' : 'SAVE'}
            </p>
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="flex w-fit items-center gap-1 bg-zinc-500 text-sm text-white hover:bg-zinc-400"
            onClick={handleClose}
          >
            <IoMdClose /> <p className="text-center text-white">Cancel</p>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormPengembalianKasGantung;
