import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback
} from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { TbLayoutNavbarFilled } from 'react-icons/tb';
import { IoClose } from 'react-icons/io5';
import { useDispatch } from 'react-redux';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

import {
  setLookUpValue,
  setSearchTerm
} from '@/lib/store/searchLookupSlice/searchLookupSlice';
import { Label } from '../ui/label';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { ImSpinner2 } from 'react-icons/im';
import DataGrid, {
  CellKeyDownArgs,
  Column,
  DataGridHandle
} from 'react-data-grid';
import { api, api2 } from '@/lib/utils/AxiosInstance';
import { FaSort, FaSortDown, FaSortUp, FaTimes } from 'react-icons/fa';
import {
  clearOpenName,
  setClearLookup,
  setOpenName,
  setSubmitClicked,
  setType
} from '@/lib/store/lookupSlice/lookupSlice';
import { FormLabel } from '../ui/form';
import IcClose from '@/public/image/x.svg';
import Image from 'next/image';
import { REQUIRED_FIELD } from '@/constants/validation';
import { setSelectLookup } from '@/lib/store/selectLookupSlice/selectLookupSlice';
import { IoMdClose, IoMdRefresh } from 'react-icons/io';
import InputDatePicker from './InputDatePicker';
import { formatCurrency } from '@/lib/utils';

interface LinkFilter {
  linkTo: string;
  linkValue: string | number | Array<string | number>;
}
interface LookUpProps {
  columns: {
    key: string;
    name: string;
    width?: number;
    isCurrency?: boolean;
  }[];
  endpoint?: string;
  label?: string;
  labelLookup?: string;
  singleColumn?: boolean;
  filterby?: Record<string, any>;

  pageSize?: number;
  postData?: string;
  dataToPost?: string | number;
  dataSortBy?: string;
  dataSortDirection?: string;
  extendSize?: string;
  lookupNama?: string;
  lookupValue?: (id: number | string | null) => void;
  showOnButton?: boolean;
  isSubmitClicked?: boolean;
  inputLookupValue?: string | number;
  allowedFilterShowAllFirst?: boolean;
  disabled?: boolean; // New prop for disabling the input/button
  selectedRequired?: boolean;
  required?: boolean;
  linkTo?: string;
  dateFromParam?: string; // default 'tglDari' jika tidak ada props
  dateToParam?: string; // default 'tglSampai' jika tidak ada props
  linkValue?: string | string[] | number[] | null;
  links?: LinkFilter[];
  onSelectRow?: (selectedRowValue?: any | undefined) => void; // Make selectedRowValue optional
  onClear?: () => void;
}
interface Filter {
  page: number;
  limit: number;
  filters: Record<string, string>;
  search: string;
  sortBy: string;
  sortDirection: string;
}
interface Row {
  id: string;
  [key: string]: any; // Add this line
}

export default function LookUpModal({
  columns: rawColumns,
  endpoint,
  extendSize,
  label,
  labelLookup,
  dataSortBy,
  dataSortDirection,
  lookupNama,
  required,
  dataToPost,
  selectedRequired = false,
  showOnButton = true,
  lookupValue,
  singleColumn = false,
  pageSize = 20,
  isSubmitClicked = false,
  dateFromParam = 'tglDari', // default 'tglDari' jika tidak ada props
  dateToParam = 'tglSampai', // default 'tglSampai' jika tidak ada props
  postData,
  disabled = false, // Default to false if not provided
  filterby,
  onSelectRow,
  onClear
}: LookUpProps) {
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedCol, setSelectedCol] = useState<number>(0);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const dispatch = useDispatch();
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [clickedOutside, setClickedOutside] = useState(false);
  const gridLookUpRef = useRef<HTMLDivElement | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [filtering, setFiltering] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [deleteClicked, setDeleteClicked] = useState(false);
  const [reload, setReload] = useState(false);
  const [tglDari, setTglDari] = useState<string>('');
  const [tglSampai, setTglSampai] = useState<string>('');
  const [showError, setShowError] = useState({
    label: label,
    status: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const columnInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>(
    {}
  );
  const type = useSelector(
    (state: RootState) => state.lookup.type[label || '']
  );
  const data = useSelector(
    (state: RootState) => state.lookup.data[label || '']
  );
  const isdefault = useSelector(
    (state: RootState) => state.lookup.isdefault[label || '']
  );

  const openName = useSelector((state: RootState) => state.lookup.openName);
  const clearLookup = useSelector(
    (state: RootState) => state.lookup.clearLookup
  );
  const submitClicked = useSelector(
    (state: RootState) => state.lookup.submitClicked
  );
  const [fetchedPages, setFetchedPages] = useState<Set<number>>(new Set([1]));
  const collapse = useSelector((state: RootState) => state.collapse.value);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<Filter>({
    page: 1,
    limit: 20,
    filters: {},
    search: '',
    sortBy: dataSortBy ? dataSortBy : '',
    sortDirection: dataSortDirection ? dataSortDirection : 'asc'
  });
  const [prevFilters, setPrevFilters] = useState<Filter>(filters);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  // Shallow compare sederhana untuk objek flat (filters, sort, dll)
  function shallowEqual(a: Record<string, any>, b: Record<string, any>) {
    if (a === b) return true;
    const ka = Object.keys(a),
      kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    for (const k of ka) if (a[k] !== b[k]) return false;
    return true;
  }

  const onReload = () => {
    setIsLoading(true);

    abortRef.current?.abort('Reload triggered');
    const controller = new AbortController();
    abortRef.current = controller;

    fetchRows(controller.signal)
      .then((newRows) => {
        setRows(newRows); // Update rows dengan hasil fetch terbaru
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false); // Jangan lupa set loading false meskipun gagal
      });
  };

  // Gabung params dari state & props
  const buildParams = useCallback(() => {
    const params: Record<string, any> = {
      page: currentPage,
      limit: filters.limit,
      search: filters.search || '',
      sortBy: filters.sortBy,
      sortDirection: filters.sortDirection
    };

    if (filters.filters) {
      for (const [k, v] of Object.entries(filters.filters)) params[k] = v;
    }
    if (filterby && !Array.isArray(filterby)) {
      // Pastikan filterby berfungsi dengan baik
      for (const [k, v] of Object.entries(filterby)) {
        params[k] = v; // menambahkan filterby ke params untuk API
      }
    }
    const effFrom = tglDari;
    const effTo = tglSampai;
    if (effFrom) params[dateFromParam] = effFrom; // kirim dengan nama field yang diinginkan
    if (effTo) params[dateToParam] = effTo; // kirim dengan nama field yang diinginkan
    return params;
  }, [
    currentPage,
    filters,
    filterby,
    dateFromParam,
    dateToParam,
    tglDari,
    tglSampai
  ]);

  // Mapping API → Row[]
  const mapApiToRows = useCallback(
    (payload: any[]): Row[] => {
      return payload.map((item: any) => {
        const row: Row = { id: item.id };
        if (
          item?.default &&
          !lookupNama &&
          item.default === 'YA' &&
          !deleteClicked &&
          !clicked
        ) {
          setInputValue(item.text);
          const value = item[dataToPost as string] || item.id;
          lookupValue?.(value);
          onSelectRow?.(value);
        }
        for (const [k, v] of Object.entries(item)) if (k !== 'id') row[k] = v;
        return row;
      });
    },
    [
      lookupNama,
      lookupValue,
      onSelectRow,
      setInputValue,
      deleteClicked,
      clicked
    ]
  );

  const handleDateChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setTglDari(newValue); // Set local state for date
  };
  const handleDateChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setTglSampai(newValue); // Set local state for date
  };

  const handleCalendarSelect1 = (value: Date | undefined) => {
    if (value) {
      setTglDari(String(value)); // Set local state for date
    } else {
      setTglDari(''); // Jika tidak ada tanggal yang dipilih, set menjadi kosong
    }
  };
  const handleCalendarSelect2 = (value: Date | undefined) => {
    if (value) {
      setTglSampai(String(value));
    } else {
      setTglSampai(''); // Jika tidak ada tanggal yang dipilih, set menjadi kosong
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const searchValue = e.target.value;
    setInputValue(searchValue);
    setCurrentPage(1);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      // Batalkan request yang sedang berjalan
      abortRef.current?.abort('New filter applied');

      const next = {
        ...filters,
        filters: {}, // optional reset kolom filter
        search: searchValue,
        page: 1
      };

      setFilters(next);
      dispatch(setOpenName(label || ''));
      setFiltering(true);

      // UX focus
      setTimeout(() => {
        setSelectedRow(0);
        gridRef?.current?.selectCell({ rowIdx: 0, idx: 0 });
      }, 250);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 350);
    }, 300);
  };

  const handleColumnFilterChange = (
    colKey: keyof Filter['filters'],
    value: string
  ) => {
    if (disabled) return; // Prevent filter change if disabled
    setCurrentPage(1);

    // Set initial filter value and reset pagination
    setInputValue('');
    setFilters((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        [colKey]: value
      },
      search: '', // Ensure search is cleared when column filter is applied
      page: 1
    }));
    setFiltering(true);

    // Handle the debounce logic for API or local filtering
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current); // Clear previous debounce timeout
    }

    debounceTimerRef.current = setTimeout(() => {
      if (type !== 'local' && endpoint) {
        setTimeout(() => {
          dispatch(setOpenName(label || '')); // Update Redux state
        }, 100);
      } else {
        // Apply local filtering
        const filteredRows =
          data?.filter((row: Row) =>
            String(row[colKey]).toLowerCase().includes(value.toLowerCase())
          ) || [];
        setRows(filteredRows); // Set filtered rows based on local data
      }
    }, 300); // Debounce delay of 300ms after the last keystroke
  };

  const gridRef = useRef<DataGridHandle | null>(null);
  function highlightText(
    text: string | number | null | undefined,
    search: string,
    columnFilter: string = ''
  ) {
    const textValue = text != null ? String(text) : '';
    if (!textValue) return '';

    // Priority: columnFilter over search
    const searchTerm = columnFilter?.trim() || search?.trim() || '';

    if (!searchTerm) {
      return textValue;
    }

    const escapeRegExp = (s: string) =>
      s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

    // Create regex for continuous string match
    const escapedTerm = escapeRegExp(searchTerm);
    const regex = new RegExp(`(${escapedTerm})`, 'gi');

    // Replace all occurrences
    const highlighted = textValue.replace(
      regex,
      (match) =>
        `<span style="background-color: yellow; font-size: 13px; font-weight: 500">${match}</span>`
    );

    return (
      <span
        className="text-sm"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    );
  }

  const handleButtonClick = () => {
    if (disabled) return; // Jangan lakukan apa-apa jika disabled

    // Jika label sama dengan openName dan lookup sudah terbuka, tutup lookup
    if (label === openName) {
      if (open) {
        setOpen(false); // Tutup lookup jika sudah terbuka
        dispatch(clearOpenName()); // Clear openName dari Redux
      } else {
        setOpen(true); // Buka lookup jika belum terbuka
      }
    } else {
      setOpen(true); // Buka lookup jika label berbeda dengan openName
      dispatch(setOpenName(label || '')); // Set openName dengan label yang diklik
    }

    setTimeout(
      () => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      },
      type !== 'local' ? 300 : 150
    );
  };

  const handleClearInput = () => {
    if (disabled) return; // Prevent input clear if disabled
    setFilters({ ...filters, search: '', filters: {} });
    setInputValue('');
    if (lookupValue) {
      lookupValue(null);
    }
    setDeleteClicked(true);
    dispatch(setSearchTerm(''));
    dispatch(clearOpenName()); // Clear openName ketika input dibersihkan
    setOpen(false);
    if (onClear) {
      onClear(); // Trigger the passed onClear function
    }
    onSelectRow?.(); // panggil tanpa argumen dengan aman
  };

  const handleSort = (column: string) => {
    const newSortOrder =
      filters.sortBy === column && filters.sortDirection === 'asc'
        ? 'desc'
        : 'asc';

    setFilters((prevFilters) => ({
      ...prevFilters,
      sortBy: column,
      sortDirection: newSortOrder,
      page: 1
    }));
    setTimeout(() => {
      gridRef?.current?.selectCell({ rowIdx: 0, idx: 1 });
    }, 200);

    setSelectedRow(0);
    setCurrentPage(1);
    setFetchedPages(new Set([1]));
    setRows([]);
  };

  const columns: readonly Column<Row>[] = useMemo(() => {
    return rawColumns.map((col, index) => ({
      ...col,
      key: col.key,

      headerCellClass: 'column-headers',
      // Set width to 100% if singleColumn is true, else use the default width
      width: singleColumn ? '100%' : col.width ?? 250, // Default width if not specified
      resizable: true,
      renderHeaderCell: () => (
        <div
          key={index}
          className="flex h-full cursor-pointer flex-col items-center gap-1"
        >
          <div
            className="headers-cell h-[50%]"
            onClick={() => handleSort(col.name)}
          >
            <p
              className={`text-sm uppercase ${
                filters.sortBy === col.name ? 'font-bold' : 'font-normal'
              }`}
            >
              {col.name}
            </p>
            <div className="ml-2">
              {filters.sortBy === col.name &&
              filters.sortDirection === 'asc' ? (
                <FaSortUp className="text-red-500" />
              ) : filters.sortBy === col.name &&
                filters.sortDirection === 'desc' ? (
                <FaSortDown className="text-red-500" />
              ) : (
                <FaSort className="text-zinc-400" />
              )}
            </div>
          </div>
          <div className="relative h-[50%] w-full px-1">
            <Input
              ref={(el) => {
                // Menyimpan ref input berdasarkan kolom key
                columnInputRefs.current[col.name] = el;
              }}
              type="text"
              className="filter-input z-[999999] h-8 w-full rounded-none"
              value={filters.filters[col.key] || ''}
              // onKeyDown={(e) => handleColumnInputKeydown(e, col.name)}
              onChange={(e) => {
                const value = e.target.value;
                handleColumnFilterChange(col.key, value);
              }}
            />
            {filters.filters[col.key] && (
              <button
                className="absolute right-2 top-2 text-xs text-gray-500"
                onClick={() => handleColumnFilterChange(col.key, '')}
                type="button"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>
      ),
      renderCell: (props: any) => {
        const columnFilter = filters.filters[props.column.key] || '';
        let cellValue = props.row[props.column.key as keyof Row] || '';
        // Jika kolom punya property isCurrency, format sebagai currency
        if (col.isCurrency) {
          cellValue = formatCurrency(cellValue);
        }
        return (
          <div
            className={`m-0 flex h-full cursor-pointer items-center p-0  text-[12px] ${
              col.isCurrency ? 'justify-end' : 'justify-start'
            }`}
          >
            {highlightText(cellValue, filters.search, columnFilter)}
          </div>
        );
      }
    }));
  }, [filters, rawColumns, currentPage, singleColumn]);

  const [columnsOrder, setColumnsOrder] = useState((): readonly number[] =>
    columns.map((_, index) => index)
  );

  function isAtBottom(event: React.UIEvent<HTMLDivElement>): boolean {
    const { currentTarget } = event;
    if (!currentTarget) return false;

    return (
      currentTarget.scrollTop + currentTarget.clientHeight >=
      currentTarget.scrollHeight - 2
    );
  }
  async function handleScroll(event: React.UIEvent<HTMLDivElement>) {
    if (isLoading || !hasMore || rows.length === 0) return;

    const findUnfetchedPage = (pageOffset: number) => {
      let page = currentPage + pageOffset;
      while (page > 0 && fetchedPages.has(page)) {
        page += pageOffset;
      }
      return page > 0 ? page : null;
    };

    if (isAtBottom(event)) {
      const nextPage = findUnfetchedPage(1);
      if (nextPage && nextPage <= totalPages && !fetchedPages.has(nextPage)) {
        console.log('masuk', nextPage);
        setCurrentPage(nextPage);
      }
    }
  }
  function handleCellDoubleClick(args: any) {
    const clickedRow = args.row;
    const rowIndex = rows.findIndex((r) => r.id === clickedRow.id);
    const classValue = clickedRow[postData as string];
    setClicked(true);
    setFilters({ ...filters, search: classValue || '' });
    setInputValue(classValue);

    dispatch(setLookUpValue(clickedRow || ''));
    dispatch(setSelectLookup({ key: label ?? '', data: clickedRow }));
    setFiltering(false);
    setOpen(false);
    if (rowIndex !== -1) {
      setSelectedRow(rowIndex);
    }
    const value = clickedRow[dataToPost as any];

    lookupValue?.(value);
    onSelectRow?.(value); // cukup satu kali, tanpa else
    dispatch(clearOpenName());
  }
  function handleCellClick(args: any) {
    const clickedRow = args.row;
    const rowIndex = rows.findIndex((r) => r.id === clickedRow.id);
    const classValue = clickedRow[postData as string];
    setSelectedRow(rowIndex);
  }
  document.querySelectorAll('.column-headers').forEach((element) => {
    element.classList.remove('c1kqdw7y7-0-0-beta-47');
  });
  const handleKeyDown = (
    args: CellKeyDownArgs<Row>,
    event: React.KeyboardEvent
  ) => {
    if (!openName) {
      return;
    }
    const visibleRowCount = 8;
    const firstDataRowIndex = 0;
    const clickedRow = args.row;
    const rowIndex = rows.findIndex((r) => r.id === clickedRow.id);
    const classValue = clickedRow[postData as string];

    if (event.key === 'ArrowDown') {
      setSelectedRow((prev) => {
        if (prev === null) return firstDataRowIndex;
        const nextRow = Math.min(prev + 1, rows.length - 1);
        return nextRow;
      });
    } else if (event.key === 'ArrowUp') {
      setSelectedRow((prev) => {
        if (prev === null) return firstDataRowIndex;
        const newRow = Math.max(prev - 1, firstDataRowIndex);
        return newRow;
      });
    } else if (event.key === 'ArrowRight') {
      setSelectedCol((prev) => {
        return Math.min(prev + 1, columns.length - 1);
      });
    } else if (event.key === 'ArrowLeft') {
      setSelectedCol((prev) => {
        return Math.max(prev - 1, 0);
      });
    } else if (event.key === 'PageDown') {
      setSelectedRow((prev) => {
        if (prev === null) return firstDataRowIndex;
        const nextRow = Math.min(prev + visibleRowCount - 1, rows.length - 1);
        return nextRow;
      });
    } else if (event.key === 'PageUp') {
      setSelectedRow((prev) => {
        if (prev === null) return firstDataRowIndex;
        const newRow = Math.max(prev - visibleRowCount + 1, firstDataRowIndex);
        return newRow;
      });
    } else if (event.key === 'Enter') {
      dispatch(clearOpenName());
      setInputValue(classValue);
      const value = dataToPost ? clickedRow[dataToPost] : clickedRow.id;
      lookupValue?.(value);
      onSelectRow?.(value); // cukup satu kali, tanpa else
      setOpen(false);
    }
  };

  function onColumnsReorder(sourceKey: string, targetKey: string) {
    setColumnsOrder((columnsOrder) => {
      const sourceColumnOrderIndex = columnsOrder.findIndex(
        (index) => columns[index].key === sourceKey
      );
      const targetColumnOrderIndex = columnsOrder.findIndex(
        (index) => columns[index].key === targetKey
      );
      const sourceColumnOrder = columnsOrder[sourceColumnOrderIndex];
      const newColumnsOrder = columnsOrder.toSpliced(sourceColumnOrderIndex, 1);
      newColumnsOrder.splice(targetColumnOrderIndex, 0, sourceColumnOrder);
      return newColumnsOrder;
    });
  }

  async function fetchRows(signal?: AbortSignal): Promise<Row[]> {
    try {
      const response = await api2.get(`/${endpoint}`, {
        params: buildParams(),
        signal
      });

      const { data, pagination } = response.data || {};
      if (pagination?.totalPages) setTotalPages(pagination.totalPages);

      const rows = Array.isArray(data) ? mapApiToRows(data) : [];
      return rows; // Return rows untuk digunakan di setRows
    } catch (error: any) {
      if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
        return [];
      }
      console.error('Failed to fetch rows', error);
      return [];
    }
  }

  function getRowClass(row: Row) {
    const rowIndex = rows.findIndex((r) => r.id === row.id);
    return rowIndex === selectedRow ? 'selected-row' : '';
  }

  function rowKeyGetter(row: any) {
    return row.id;
  }

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

  function LoadRowsRenderer() {
    return (
      <div>
        <ImSpinner2 className="animate-spin text-3xl text-primary" />
      </div>
    );
  }
  const handleInputKeydown = (event: any) => {
    if ((!open && !filters.filters) || !openName) {
      return;
    }
    const rowData = rows[selectedRow];
    const totalRows = rows.length; // Ensure the data contains all rows
    const visibleRowCount = 12; // You can adjust this value based on your visible row count

    if (event.key === 'Enter') {
      dispatch(clearOpenName());
      setInputValue(rowData[postData as string]);
      const value = dataToPost ? rowData[dataToPost] : rowData.id;
      lookupValue?.(value);
      onSelectRow?.(value); // cukup satu kali, tanpa else
      setOpen(false);
    }
    if (event.key === 'ArrowDown') {
      if (gridRef.current !== null) {
        // Only update selectedRow if we haven't reached the last row
        if (selectedRow < totalRows - 1) {
          setSelectedRow(selectedRow + 1);
          gridRef?.current?.selectCell({ rowIdx: selectedRow + 1, idx: 0 });
        }

        setTimeout(
          () => {
            if (inputRef.current) {
              inputRef.current.focus();
            }
          },
          type !== 'local' ? 300 : 150
        );
      }
    } else if (event.key === 'ArrowUp') {
      if (selectedRow === 0 && gridRef.current) {
        event.preventDefault();
      } else {
        setSelectedRow(selectedRow - 1);
        gridRef?.current?.selectCell({ rowIdx: selectedRow - 1, idx: 0 });

        setTimeout(
          () => {
            if (inputRef.current) {
              inputRef.current.focus();
            }
          },
          type !== 'local' ? 300 : 150
        );
      }
    } else if (event.key === 'PageDown') {
      setSelectedRow((prev) => {
        if (prev === null) return 0; // Start from the first row
        const nextRow = Math.min(prev + visibleRowCount, totalRows - 1);
        return nextRow;
      });
      const nextRow = Math.min(selectedRow + visibleRowCount, totalRows - 1);
      gridRef?.current?.selectCell({
        rowIdx: nextRow,
        idx: 0
      });
      // Ensure selectCell is updated after selectedRow change
      setTimeout(
        () => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        },
        type !== 'local' ? 300 : 150
      );
    } else if (event.key === 'PageUp') {
      setSelectedRow((prev) => {
        if (prev === null) return 0; // Start from the first row
        const newRow = Math.max(prev - visibleRowCount, 0);
        return newRow;
      });
      const newRow = Math.max(selectedRow - visibleRowCount, 0);
      gridRef?.current?.selectCell({
        rowIdx: newRow,
        idx: 0
      });
      // Ensure selectCell is updated after selectedRow change
      setTimeout(
        () => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        },
        type !== 'local' ? 300 : 150
      );
    }
  };
  useEffect(() => {
    const now = new Date();
    const fmt = (date: Date) =>
      `${String(date.getDate()).padStart(2, '0')}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}-${date.getFullYear()}`;

    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setTglDari(fmt(firstOfMonth));
    setTglSampai(fmt(lastOfMonth));
  }, [dispatch]);
  useEffect(() => {
    if (open) {
      setIsFirstLoad(true);
    }
  }, [open]);
  useEffect(() => {
    if (isFirstLoad && gridRef.current && rows.length > 0) {
      setSelectedRow(0);
      gridRef.current.selectCell({ rowIdx: 0, idx: 0 });
      setIsFirstLoad(false);
    }
  }, [rows, isFirstLoad]);
  const applyFilters = useCallback(
    (rows: Row[]) => {
      let filtered = rows;

      // filter khusus kolom pada columns lewat global search (filters.search)
      if (filters.search && filters.search.trim() !== '') {
        const validColumnKeys = columns.map((col) => col.key);
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter((row: Row) =>
          validColumnKeys.some((colKey) =>
            String(row[colKey] ?? '')
              .toLowerCase()
              .includes(searchLower)
          )
        );
      }

      // filter berdasarkan filters lainnya (per kolom)
      for (const [colKey, filterValue] of Object.entries(
        filters.filters || {}
      )) {
        filtered = filtered.filter((row: Row) =>
          String(row[colKey as keyof Row])
            .toLowerCase()
            .includes(String(filterValue).toLowerCase())
        );
      }
      // filterby (opsional)
      if (filterby && !Array.isArray(filterby)) {
        filtered = filtered.filter((row: Row) =>
          Object.entries(filterby).every(
            ([k, v]) => String(row[k]) === String(v)
          )
        );
      }
      return filtered;
    },
    [filterby, filters, columns]
  );

  useEffect(() => {
    if (type === 'local' || !endpoint) {
      // Mode local tetap seperti sebelumnya
      const filteredRows = data ? applyFilters(data) : [];

      // Check if we're not clearing input and lookupNama is undefined
      if (isdefault && !deleteClicked) {
        // Only set default value if inputValue is empty (cleared)
        if (isdefault === 'YA') {
          const defaultRow = filteredRows.find(
            (row: any) => row.default === 'YA'
          );
          console.log('defaultRow222', defaultRow);
          if (defaultRow && !clicked) {
            setInputValue(defaultRow?.text);
            if (lookupValue) {
              lookupValue(defaultRow[dataToPost as string] || defaultRow?.id);
            }
          }
        }
      }
      setRows(filteredRows);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    abortRef.current?.abort('Effect re-run');
    const controller = new AbortController();
    abortRef.current = controller;

    const myRequestId = ++requestIdRef.current;

    (async () => {
      try {
        const newRows = await fetchRows(controller.signal); // pakai currentPage di buildParams()

        if (myRequestId !== requestIdRef.current) return;
        setRows((prev) => {
          if (currentPage === 1) return newRows;

          // append + dedup by id
          const seen = new Set<number | string>();
          const merged = [...prev, ...newRows].filter((r) => {
            const k = r.id;
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
          });
          return merged;
        });

        // tandai halaman ini sudah diambil
        setFetchedPages((prev) => {
          const s = new Set(prev);
          s.add(currentPage);
          return s;
        });

        // update hasMore berdasar totalPages
        setHasMore(currentPage < totalPages);
      } catch (err) {
        if (myRequestId === requestIdRef.current) {
          console.error('Failed to fetch rows', err);
        }
      } finally {
        if (myRequestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    })();

    return () => controller.abort();
  }, [
    open,
    endpoint,
    type,
    currentPage,
    filters,
    totalPages,
    deleteClicked,
    clicked
  ]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectedRequired) {
        return;
      }

      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        gridLookUpRef.current &&
        !gridLookUpRef.current.contains(e.target as Node)
      ) {
        setClickedOutside(true);
        setFiltering(false);
        setOpen(false);
        dispatch(clearOpenName());
        if (
          (filters.search.trim() !== '' ||
            Object.keys(filters.filters).length > 0) &&
          rows.length > 0
        ) {
          setFilters({
            ...filters,
            search: rows[0][postData as string] || ''
          });
          const value = rows[0][dataToPost as string] || '';
          lookupValue?.(value);
          onSelectRow?.(value); // cukup satu kali, tanpa else
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [filters.search, filters.filters, rows, postData, selectedRequired]); // Tambahka
  useEffect(() => {
    // Check if search is not empty and if we're not clicking outside
    if (filters.search.trim() !== '' && !clickedOutside && filtering) {
      setOpen(true); // Open the lookup grid if there's search value and not clicking outside
      setSelectedRow(0); // Select the first row
    } else if (
      filters.search.trim() === '' &&
      !clickedOutside &&
      filtering &&
      filters.filters
    ) {
      // Keep the lookup open if search is empty but we're still filtering
      setOpen(true);
      setSelectedRow(0); // Select the first row
    } else {
      setOpen(false); // Close the lookup grid when no search and no filtering
    }

    // Reset clickedOutside after handling
    if (clickedOutside) {
      setClickedOutside(false);
    }
  }, [filters.search, clickedOutside, filtering]);

  useEffect(() => {
    if (lookupNama) {
      setInputValue(lookupNama); // Assuming "text" is the display column
    }
  }, [lookupNama]);
  useEffect(() => {
    if (clearLookup) {
      setInputValue(''); // Assuming "text" is the display column
      dispatch(setClearLookup(false)); // Reset clearLookup state in Redux
      setFilters({ ...filters, search: '', filters: {} });
    }
  }, [clearLookup, dispatch]);
  useEffect(() => {
    const preventScrollOnSpace = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault(); // Mencegah scroll pada tombol space
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
      }
    };

    // Menambahkan event listener saat komponen di-mount
    document.addEventListener('keydown', preventScrollOnSpace);

    // Menghapus event listener saat komponen di-unmount
    return () => {
      document.removeEventListener('keydown', preventScrollOnSpace);
    };
  }, []);

  useEffect(() => {
    // Update status open jika openName sama dengan label
    if (label === openName) {
      setOpen(true); // Jika label sama dengan openName, buka lookup
    } else {
      setOpen(false); // Jika tidak sama, tutup lookup
    }
  }, [openName, label]); // Efek dijalankan setiap kali openName atau label berubah

  useEffect(() => {
    const preventScrollOnSpace = (event: KeyboardEvent) => {
      if (inputRef.current) {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          setSelectedRow(0); // Set selected row to the first row
          gridRef?.current?.selectCell({ rowIdx: 0, idx: 0 }); // Select the first cell in the grid
        }
        return; // Prevent propagation to other grid key handlers
      }
      document.addEventListener('keydown', preventScrollOnSpace);
    };
  }, [inputRef]);
  useEffect(() => {
    // Cek apakah inputValue atau lookupNama kosong untuk label yang sama
    if (submitClicked && required) {
      if (
        showError.label?.toLowerCase() === label?.toLowerCase() &&
        (inputValue === '' || inputValue == null || inputValue === undefined)
      ) {
        setShowError({ label: label ?? '', status: true });
      } else {
        // Jika ada nilai, set error menjadi false
        setShowError({ label: label ?? '', status: false });
      }
    }
    dispatch(setSubmitClicked(false));
  }, [required, submitClicked, inputValue, lookupNama, label, dispatch]);

  useEffect(() => {
    if (
      (lookupNama !== undefined && String(label) === String(showError.label)) ||
      inputValue !== ''
    ) {
      setShowError({ label: label ?? '', status: false });
    }
  }, [lookupNama, inputValue, label, showError.label]);

  return (
    <>
      <div className="flex w-full flex-col">
        <div
          className="relative flex w-full flex-row items-center"
          ref={popoverRef}
        >
          <Input
            ref={inputRef}
            // autoFocus
            className={`w-full rounded-r-none text-sm text-zinc-900 lg:w-[100%] rounded-none${
              showOnButton ? 'rounded-r-none border-r-0' : ''
            } border border-zinc-300 pr-10 focus:border-[#adcdff]`}
            disabled={disabled}
            value={inputValue}
            onKeyDown={handleInputKeydown}
            onChange={(e) => {
              handleInputChange(e);
            }}
          />

          {(filters.search !== '' || inputValue !== '') && (
            <Button
              type="button"
              disabled={disabled}
              variant="ghost"
              className="absolute right-10 text-gray-500 hover:bg-transparent"
              onClick={handleClearInput}
            >
              <Image src={IcClose} width={15} height={15} alt="close" />
            </Button>
          )}

          {showOnButton && (
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-l-none border border-[#adcdff] bg-[#e0ecff] text-[#0e2d5f] hover:bg-[#7eafff] hover:text-[#0e2d5f]"
              onClick={handleButtonClick}
              disabled={disabled}
            >
              <TbLayoutNavbarFilled />
            </Button>
          )}
        </div>
        <p className="text-[0.8rem] text-destructive">
          {showError.status === true && label === showError.label
            ? `${label} ${REQUIRED_FIELD}`
            : null}
        </p>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTitle hidden={true}>Title</DialogTitle>

        <DialogContent className="flex h-full min-w-full flex-col overflow-hidden bg-black bg-opacity-50 p-10">
          <div className="flex items-center justify-between bg-[#e0ecff] px-2 py-2">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {labelLookup || label}
            </h2>
            <div
              className="cursor-pointer rounded-md border border-zinc-200 bg-red-500 p-0 hover:bg-red-400"
              onClick={() => {
                setOpen(false);
              }}
            >
              <IoMdClose className="h-5 w-5 font-bold text-white" />
            </div>
          </div>

          <div
            className={`${
              collapse === true ? 'w-full' : 'w-[100%]'
            } flex-grow overflow-hidden transition-all duration-300`}
          >
            <div className="h-full min-w-full border border-blue-500 bg-white p-6">
              <div className="rounded-sm border border-blue-500 p-4">
                <div className="flex w-full flex-row gap-4">
                  <div className="flex w-full flex-row items-center">
                    <FormLabel
                      required={true}
                      className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[30%]"
                    >
                      TGL DARI
                    </FormLabel>
                    <div className="flex flex-col lg:w-[70%]">
                      <InputDatePicker
                        value={tglDari}
                        showCalendar
                        onChange={handleDateChange1}
                        onSelect={handleCalendarSelect1}
                      />
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
                      <InputDatePicker
                        value={tglSampai}
                        showCalendar
                        onChange={handleDateChange2}
                        onSelect={handleCalendarSelect2}
                      />
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
              </div>
              <div className="my-4 h-[500px] w-full rounded-sm border border-blue-500">
                <div
                  className="flex h-[38px] w-full flex-row items-center rounded-t-sm border-b border-blue-500 px-2"
                  style={{
                    background:
                      'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 100%)'
                  }}
                >
                  <label htmlFor="" className="text-xs text-zinc-600">
                    SEARCH :
                  </label>
                  <div className="relative flex w-[200px] flex-row items-center">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => {
                        handleInputChange(e);
                      }}
                      className="m-2 h-[28px] w-[200px] rounded-sm bg-white text-black"
                      placeholder="Type to search..."
                    />
                    {(filters.search !== '' || inputValue !== '') && (
                      <Button
                        type="button"
                        variant="ghost"
                        className="absolute right-2 text-gray-500 hover:bg-transparent"
                        onClick={handleClearInput}
                      >
                        <Image
                          src={IcClose}
                          width={15}
                          height={15}
                          alt="close"
                        />
                      </Button>
                    )}
                  </div>
                </div>
                <DataGrid
                  ref={gridRef}
                  columns={columns}
                  rows={rows}
                  rowKeyGetter={rowKeyGetter}
                  onScroll={handleScroll}
                  rowClass={getRowClass}
                  onCellClick={handleCellClick}
                  onSelectedCellChange={(args) => {
                    handleCellClick({ row: args.row });
                  }}
                  onCellDoubleClick={handleCellDoubleClick}
                  rowHeight={30}
                  headerRowHeight={singleColumn ? 0 : 70}
                  className="rdg-light h-[450px]"
                  onColumnsReorder={onColumnsReorder}
                  onCellKeyDown={handleKeyDown}
                  renderers={{
                    noRowsFallback: <EmptyRowsRenderer />
                  }}
                />
                {isLoading ? (
                  <div
                    className="absolute bottom-0 flex w-full flex-row gap-2 py-1"
                    style={{
                      background:
                        'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 100%)'
                    }}
                  >
                    <LoadRowsRenderer />
                    <p className="text-sm text-zinc-600">Loading...</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className="m-0 flex h-fit items-end gap-2 bg-zinc-200 px-3 py-2">
            <Button
              type="button"
              variant="secondary"
              className="flex w-fit items-center gap-1 bg-zinc-500 text-sm text-white hover:bg-zinc-400"
              onClick={() => setOpen(false)}
            >
              <IoMdClose /> <p className="text-center text-white">Cancel</p>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
