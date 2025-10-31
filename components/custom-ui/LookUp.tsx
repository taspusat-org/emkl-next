import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useLayoutEffect
} from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { TbLayoutNavbarFilled } from 'react-icons/tb';
import { IoClose } from 'react-icons/io5';
import { useDispatch } from 'react-redux';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form';
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
import {
  FaChevronDown,
  FaSort,
  FaSortDown,
  FaSortUp,
  FaTimes
} from 'react-icons/fa';
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
import { formatCurrency } from '@/lib/utils';
import { debounce } from 'lodash';
import FilterInput from './FilterInput';

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
  clearDisabled?: boolean; // New prop for disabling the input/button
  selectedRequired?: boolean;
  name?: string;
  forms?: any;
  required?: boolean;
  onSelectRow?: (selectedRowValue?: any | undefined) => void; // Make selectedRowValue optional
  onClear?: () => void;
  autoSearch?: boolean; // Tambahkan ini
  isExactMatch?: boolean; // Tambahkan ini
  showClearButton?: boolean; // Tambahkan ini
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

export default function LookUp({
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
  name,
  forms,
  selectedRequired = false,
  showOnButton = true,
  lookupValue,
  singleColumn = false,
  pageSize = 20,
  isSubmitClicked = false,
  postData,
  disabled = false, // Default to false if not provided
  clearDisabled = false, // Default to false if not provided
  filterby,
  onSelectRow,
  onClear,
  autoSearch = true,
  isExactMatch = false,
  showClearButton = true
}: LookUpProps) {
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedCol, setSelectedCol] = useState<number>(0);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [onPaste, setOnPaste] = useState<boolean>(false);
  const dispatch = useDispatch();
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [popoverWidth, setPopoverWidth] = useState<number | string>('auto');
  const [clickedOutside, setClickedOutside] = useState(false);
  const gridLookUpRef = useRef<HTMLDivElement | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [filtering, setFiltering] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [deleteClicked, setDeleteClicked] = useState(false);
  const isUserTypingRef = useRef(false);
  const prevLookupNamaRef = useRef<string | undefined>(undefined);
  const hasInitializedRef = useRef(false);
  const [showError, setShowError] = useState({
    label: label,
    status: false,
    message: ''
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
  const focus = useSelector((state: RootState) => state.lookup.focus);
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

  const initializeColumnFilters = useCallback(() => {
    const initialFilters: Record<string, string> = {};
    rawColumns.forEach((col) => {
      initialFilters[col.key] = '';
    });
    return initialFilters;
  }, [rawColumns]);

  // Gabung params dari state & props
  const buildParams = useCallback(
    (overrideSearch?: string) => {
      const searchValue =
        overrideSearch !== undefined ? overrideSearch : filters.search;

      const params: Record<string, any> = {
        page: currentPage,
        limit: filters.limit,
        search: searchValue, // ← Gunakan override atau filters.search
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection
      };

      if (open) {
        params['search'] = searchValue; // like search saat modal terbuka
      } else {
        if (!autoSearch && isExactMatch) {
          params['exactMatch'] = searchValue; // exact search
        } else {
          params['search'] = searchValue; // like search
        }
      }

      // Selalu kirim semua column filters (termasuk yang kosong)
      if (filters.filters) {
        rawColumns.forEach((col) => {
          params[col.key] = filters.filters[col.key] || '';
        });
      } else {
        rawColumns.forEach((col) => {
          params[col.key] = '';
        });
      }

      // Tambahkan filterby jika ada
      if (filterby && !Array.isArray(filterby)) {
        for (const [k, v] of Object.entries(filterby)) {
          params[k] = v;
        }
      }

      return params;
    },
    [currentPage, filters, filterby, rawColumns, autoSearch, open, isExactMatch]
  );
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
          const value = dataToPost ? item[dataToPost as string] : item.id;
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || onPaste) return;
    setOnPaste(false);

    const searchValue = e.target.value;

    // Set flag bahwa user sedang mengetik
    isUserTypingRef.current = true;

    // Update input value immediately
    setInputValue(searchValue);

    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        filters: initializeColumnFilters(),
        search: searchValue,
        page: 1
      }));
      setFiltering(true);
      setRows([]);
      setCurrentPage(1);
      setFetchedPages(new Set([1]));

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }, 500);
  };
  // Modifikasi handleColumnFilterChange untuk mempertahankan search global
  const handleColumnFilterChange = (
    colKey: keyof Filter['filters'],
    value: string
  ) => {
    if (disabled) return;
    setCurrentPage(1);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setFilters((prev) => {
        // Inisialisasi dengan semua column filters kosong jika belum ada
        const currentFilters = prev.filters || initializeColumnFilters();

        return {
          ...prev,
          filters: {
            ...currentFilters,
            [colKey]: value // Update column filter yang spesifik
          },
          // Pertahankan search global yang sudah ada
          search: prev.search || '',
          page: 1
        };
      });
      setFiltering(true);
    }, 500);
  };
  const debouncedFilterUpdate = useRef(
    debounce((colKey: string, value: string) => {
      setInputValue('');
      setFilters((prev) => ({
        ...prev,
        search: '',
        filters: { ...prev.filters, [colKey]: value },
        page: 1
      }));
      setCurrentPage(1);
    }, 500) // Bisa dikurangi jadi 250-300ms
  ).current;

  const handleFilterInputChange = useCallback(
    (colKey: string, value: string) => {
      debouncedFilterUpdate(colKey, value);
    },
    []
  );
  const handleClearFilter = useCallback((colKey: string) => {
    debouncedFilterUpdate.cancel(); // Cancel pending updates
    setFilters((prev) => ({
      ...prev,
      filters: { ...prev.filters, [colKey]: '' },
      page: 1
    }));
    setRows([]);
    setCurrentPage(1);
  }, []);
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
  const handlePaste = (event: string) => {
    setOnPaste(true);
    if (disabled) return;
    try {
      const pasted = event.trim();
      // Misal kolom display dengan key 'text', sesuaikac;n dengan kolom utama di aplikasi Anda
      const match = rows.find(
        (row) =>
          String(row[postData as string]).toUpperCase() === pasted.toUpperCase()
      );
      setInputValue(pasted.toUpperCase());
      if (match) {
        lookupValue?.(dataToPost ? match[dataToPost as string] : match.id);
        onSelectRow?.(match);
        setShowError({ label: label ?? '', status: false, message: '' });

        setOpen(false);
      } else {
        setShowError({
          label: label ?? '',
          status: true,
          message: 'DATA TIDAK DITEMUKAN'
        });

        // Bisa juga tampilkan pesan custom pada UI
      }
      setTimeout(() => {
        setOnPaste(false);
      }, 100);
    } catch (error) {}
  };
  const handleButtonClick = () => {
    setOnPaste(false);
    if (disabled) return; // Jangan lakukan apa-apa jika disabled

    // Jika label sama dengan openName dan lookup sudah terbuka, tutup lookup
    if (label === openName) {
      if (open) {
        setCurrentPage(1);
        setFetchedPages(new Set());
        setRows([]);
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
    setOnPaste(false);
    if (disabled && !clearDisabled) return; // Prevent input clear if disabled
    setFilters({ ...filters, search: '', filters: {} });
    setInputValue('');
    if (lookupValue) {
      lookupValue(null);
    }
    setShowError({ label: label ?? '', status: false, message: '' });

    setDeleteClicked(true);
    dispatch(setSelectLookup({ key: label ?? '', data: {} }));
    dispatch(setSearchTerm(''));
    dispatch(clearOpenName()); // Clear openName ketika input dibersihkan
    setOpen(false);
    if (onClear) {
      onClear(); // Trigger the passed onClear function
    }
  };

  const handleSort = (column: string) => {
    if (type === 'local' || !endpoint) {
      // Local sorting logic
      const currentSortBy = filters.sortBy;
      const currentSortDirection = filters.sortDirection;
      // Determine new sort direction
      let newSortDirection: 'asc' | 'desc' = 'asc';
      if (currentSortBy === column && currentSortDirection === 'asc') {
        newSortDirection = 'desc';
      }

      // Update filters
      setFilters((prevFilters) => ({
        ...prevFilters,
        sortBy: column,
        sortDirection: newSortDirection,
        page: 1
      }));

      // Sort the current rows locally
      const sortedRows = [...rows].sort((a, b) => {
        // Assuming rows are objects with the column as a key
        // Adjust the comparison based on your data structure (e.g., handle numbers, strings, dates)
        let aValue = a[column];
        let bValue = b[column];

        // Handle null/undefined values
        if (aValue == null) aValue = '';
        if (bValue == null) bValue = '';

        // Convert to strings for comparison if needed (or handle specific types)
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        } else if (typeof aValue !== typeof bValue) {
          // Ensure comparable types (e.g., convert numbers to strings if mixed)
          aValue = String(aValue);
          bValue = String(bValue);
        }

        if (aValue < bValue) {
          return newSortDirection === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return newSortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
      // For local sorting, also handle pagination reset if applicable
      setCurrentPage(1);
      setSelectedRow(0);
      setTimeout(() => {
        gridRef?.current?.selectCell({ rowIdx: 0, idx: 0 });
      }, 200);

      setRows(sortedRows);
      setIsLoading(false);
      return;
    } else {
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
        gridRef?.current?.selectCell({ rowIdx: 0, idx: 0 });
      }, 200);

      setSelectedRow(0);
      setCurrentPage(1);
      setFetchedPages(new Set([1]));
      setRows([]);
    }
  };

  const inputStopPropagation = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };
  const columns: readonly Column<Row>[] = useMemo(() => {
    return rawColumns.map((col, index) => ({
      ...col,
      key: col.key,

      headerCellClass: 'column-headers',
      // Set width to 100% jika singleColumn true, jika tidak pakai default width
      width: singleColumn ? '100%' : col.width ?? 250, // Default width jika tidak ada
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
            <FilterInput
              colKey={col.name}
              value={filters.filters[col.name] || ''}
              onChange={(value) => handleFilterInputChange(col.name, value)}
              autoFocus={false}
              tabIndex={-1}
              onClick={(e: React.MouseEvent<HTMLInputElement>) =>
                e.stopPropagation()
              }
              onClear={() => handleClearFilter(col.name)}
              inputRef={(el) => {
                columnInputRefs.current[col.name] = el;
              }}
            />
            {/* <Input
              ref={(el) => {
                // Menyimpan ref input berdasarkan kolom key
                columnInputRefs.current[col.name] = el;
              }}
              autoFocus={false}
              onKeyDown={(e) => handleInputColumnKeydown(e, col.name)}
              type="text"
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
              className="filter-input z-[999999] h-8 w-full rounded-none"
              value={filters.filters[col.key] || ''}
              // onKeyDown={(e) => handleColumnInputKeydown(e, col.name)}
              onChange={(e) => {
                const value = e.target.value;
                handleFilterInputChange(col.key, value);
              }}
            />
            {filters.filters[col.key] && (
              <button
                className="absolute right-2 top-2 text-xs text-gray-500"
                onClick={() => handleClearFilter(col.key)}
                type="button"
              >
                <FaTimes />
              </button>
            )} */}
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

  function isAtTop({ currentTarget }: React.UIEvent<HTMLDivElement>): boolean {
    return currentTarget.scrollTop <= 10;
  }
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
        setCurrentPage(nextPage);
      }
    }
  }
  function handleCellClick(args: any) {
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
    const value = dataToPost ? clickedRow[dataToPost as string] : clickedRow.id;
    lookupValue?.(value);
    onSelectRow?.(clickedRow); // cukup satu kali, tanpa else
    dispatch(clearOpenName());
  }
  function onSelectedCellChange(args: { row: Row }) {
    const clickedRow = args.row;
    const rowIndex = rows.findIndex((r) => r.id === clickedRow.id);
    if (rowIndex !== -1) {
      setSelectedRow(rowIndex);
    }
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

  async function fetchRows(
    signal?: AbortSignal,
    overrideSearch?: string
  ): Promise<Row[]> {
    try {
      const response = await api2.get(`/${endpoint}`, {
        params: buildParams(overrideSearch), // ← Pass override ke buildParams
        signal
      });
      const { data, pagination } = response.data.data
        ? response.data
        : response || {};
      if (pagination?.totalPages) setTotalPages(pagination.totalPages);
      return Array.isArray(data) ? mapApiToRows(data) : [];
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
      <div className="flex h-full w-full items-center px-2">
        <p className="text-sm text-zinc-500">No results found</p>
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

  const selectFirstRow = async () => {
    const newRows = await fetchRows(undefined, inputValue); // ← Pass inputValue sebagai override!

    if (newRows.length > 0) {
      const firstRow = newRows[0];
      const classValue = firstRow[postData as string];
      setInputValue(classValue);
      setClicked(true);
      dispatch(setSelectLookup({ key: label ?? '', data: firstRow }));
      const value = firstRow[dataToPost as any];
      lookupValue?.(value);
      onSelectRow?.(firstRow);

      // Update filters.search juga agar sync
      setFilters((prev) => ({
        ...prev,
        search: inputValue
      }));

      setTimeout(() => setClicked(false), 1000);
    } else {
      setShowError({
        label: label ?? '',
        status: true,
        message: 'DATA TIDAK DITEMUKAN'
      });
    }
  };
  const handleInputKeydown = (event: any) => {
    if (!autoSearch && !open && event.key === 'Enter') {
      event.preventDefault();
      selectFirstRow();
      return;
    }

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
      onSelectRow?.(rowData); // cukup satu kali, tanpa else
      setOpen(false);
    }
    if (event.key === 'ArrowDown') {
      if (gridRef.current !== null) {
        // Only update selectedRow if we haven't reached the last row
        if (selectedRow < totalRows - 1) {
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

  const handleInputColumnKeydown = (event: any, colKey: string) => {
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
      onSelectRow?.(rowData); // cukup satu kali, tanpa else
      setOpen(false);
    }
    if (event.key === 'ArrowDown') {
      if (gridRef.current !== null) {
        // Only update selectedRow if we haven't reached the last row
        if (selectedRow < totalRows - 1) {
          gridRef?.current?.selectCell({ rowIdx: selectedRow + 1, idx: 0 });
        }

        setTimeout(
          () => {
            if (columnInputRefs.current[colKey]) {
              columnInputRefs.current[colKey].focus();
            }
          },
          type !== 'local' ? 300 : 150
        );
      }
    } else if (event.key === 'ArrowUp') {
      if (selectedRow === 0 && gridRef.current) {
        event.preventDefault();
        setTimeout(
          () => {
            if (columnInputRefs.current[colKey]) {
              columnInputRefs.current[colKey].focus();
            }
          },
          type !== 'local' ? 300 : 150
        );
      } else {
        gridRef?.current?.selectCell({ rowIdx: selectedRow - 1, idx: 0 });

        setTimeout(
          () => {
            if (columnInputRefs.current[colKey]) {
              columnInputRefs.current[colKey].focus();
            }
          },
          type !== 'local' ? 300 : 150
        );
      }
    } else if (event.key === 'PageDown') {
      const nextRow = Math.min(selectedRow + visibleRowCount, totalRows - 1);
      gridRef?.current?.selectCell({
        rowIdx: nextRow,
        idx: 0
      });
      // Ensure selectCell is updated after selectedRow change
      setTimeout(
        () => {
          if (columnInputRefs.current[colKey]) {
            columnInputRefs.current[colKey].focus();
          }
        },
        type !== 'local' ? 300 : 150
      );
    } else if (event.key === 'PageUp') {
      const newRow = Math.max(selectedRow - visibleRowCount, 0);
      gridRef?.current?.selectCell({
        rowIdx: newRow,
        idx: 0
      });
      // Ensure selectCell is updated after selectedRow change
      setTimeout(
        () => {
          if (columnInputRefs.current[colKey]) {
            columnInputRefs.current[colKey].focus();
          }
        },
        type !== 'local' ? 300 : 150
      );
    }
  };
  useEffect(() => {
    if (open) {
      setIsFirstLoad(true);
    }
  }, [open]);
  // useEffect(() => {
  //   if (isFirstLoad && gridRef.current && rows.length > 0) {
  //     setSelectedRow(0);
  //     gridRef.current.selectCell({ rowIdx: 0, idx: 0 });
  //     setIsFirstLoad(false);
  //   }
  // }, [rows, isFirstLoad]);
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
      if (isdefault && !deleteClicked && !lookupNama) {
        // Only set default value if inputValue is empty (cleared)
        if (isdefault === 'YA') {
          const defaultRow = filteredRows.find(
            (row: any) => row.default === 'YA'
          );
          if (defaultRow && !clicked) {
            setInputValue(defaultRow?.text);
            if (lookupValue) {
              lookupValue(
                dataToPost ? defaultRow[dataToPost as string] : defaultRow?.id
              );
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
        const shouldFetch = autoSearch || open;
        if (shouldFetch) {
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
        } else {
          return;
        }
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
    clicked,
    lookupNama,
    autoSearch
  ]);

  useEffect(() => {
    const handleResize = () => {
      if (inputRef.current) {
        setPopoverWidth(inputRef.current.offsetWidth);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);

    if (inputRef.current) {
      resizeObserver.observe(inputRef.current);
    }

    return () => {
      if (inputRef.current) {
        resizeObserver.unobserve(inputRef.current);
      }
    };
  }, []);
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
          rows.length > 0 &&
          !lookupNama
        ) {
          setFilters({
            ...filters,
            search: rows[0][postData as string] || ''
          });
          setInputValue(rows[0][postData as string] || '');
          const value = dataToPost ? rows[0][dataToPost as string] : rows[0].id;
          lookupValue?.(value);
          onSelectRow?.(value); // cukup satu kali, tanpa else
        }
        if (inputValue && rows.length === 0) {
          setShowError({
            label: label ?? '',
            status: true,
            message: 'DATA TIDAK DITEMUKAN'
          });
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [filters.search, filters.filters, rows, postData, selectedRequired]); // Tambahka
  useEffect(() => {
    // PERUBAHAN: Tambahkan kondisi autoSearch
    if (autoSearch) {
      // Behavior lama: buka modal otomatis saat ada search
      if (
        filters.search.trim() !== '' &&
        !clickedOutside &&
        filtering &&
        !deleteClicked
      ) {
        setOpen(true);
        setSelectedRow(0);
      } else if (
        filters.search.trim() === '' &&
        !clickedOutside &&
        filtering &&
        filters.filters &&
        !deleteClicked
      ) {
        setOpen(true);
        setSelectedRow(0);
      } else {
        setOpen(false);
      }
    }
    // Jika autoSearch false, modal hanya dibuka manual via button

    if (clickedOutside) {
      setClickedOutside(false);
    }
  }, [filters.search, clickedOutside, filtering, autoSearch]);

  useEffect(() => {
    let newWidth = inputRef.current?.offsetWidth || 'auto';
    if (extendSize) {
      const extendedWidth = parseInt(extendSize, 10);
      if (!isNaN(extendedWidth)) {
        newWidth = parseInt(newWidth as string, 10) + extendedWidth + 'px';
      }
    }
    setPopoverWidth(newWidth);
  }, [extendSize]);
  useEffect(() => {
    // Hanya jalankan sekali saat mount dan lookupNama ada
    if (!hasInitializedRef.current && lookupNama) {
      setInputValue(lookupNama);

      // Cari row yang sesuai (jika rows sudah ada)
      const foundRow = rows.find(
        (row) => String(row[postData as string]) === String(lookupNama)
      );

      if (foundRow) {
        onSelectRow?.(foundRow);
        lookupValue?.(
          dataToPost ? foundRow[dataToPost as string] : foundRow?.id
        );
      }

      hasInitializedRef.current = true;
      prevLookupNamaRef.current = lookupNama;
    }
  }, [lookupNama, rows]); // rows added untuk handle case dimana lookupNama ada tapi rows belum loaded

  // Effect 2: Handle perubahan lookupNama setelah initialized
  useEffect(() => {
    // Skip jika belum initialized atau user sedang mengetik
    if (!hasInitializedRef.current || isUserTypingRef.current) {
      return;
    }

    // Deteksi perubahan nilai
    const hasValueChanged = prevLookupNamaRef.current !== lookupNama;

    if (!hasValueChanged) {
      return;
    }

    // Update value
    if (lookupNama && !deleteClicked && !clicked) {
      setInputValue(lookupNama);

      const foundRow = rows.find(
        (row) => String(row[postData as string]) === String(lookupNama)
      );

      if (foundRow) {
        onSelectRow?.(foundRow);
        lookupValue?.(
          dataToPost ? foundRow[dataToPost as string] : foundRow?.id
        );
      }
    } else if (!lookupNama && !deleteClicked && !clicked) {
      // Clear input jika lookupNama di-clear dari luar
      setInputValue('');
      setFilters((prev) => ({ ...prev, search: '', filters: {} }));
    }

    // Update ref
    prevLookupNamaRef.current = lookupNama;
  }, [lookupNama, rows, deleteClicked, clicked]);

  // Effect 3: Reset typing flag
  useEffect(() => {
    // Reset flag setelah lookupNama berubah
    isUserTypingRef.current = false;
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
    if (label === openName && !onPaste) {
      setOpen(true); // Jika label sama dengan openName, buka lookup
    } else {
      setOpen(false); // Jika tidak sama, tutup lookup
      setCurrentPage(1);
      setFetchedPages(new Set());
    }
  }, [openName, label, onPaste]); // Efek dijalankan setiap kali openName atau label berubah

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
        setShowError({
          label: label ?? '',
          status: true,
          message: `${label} ${REQUIRED_FIELD}`
        });
      } else {
        setShowError({ label: label ?? '', status: false, message: '' });
      }
    }
    dispatch(setSubmitClicked(false));
  }, [required, submitClicked, inputValue, lookupNama, label, dispatch]);

  useEffect(() => {
    // Jika sedang onPaste, jangan lakukan apapun
    if (onPaste) return;

    // Jika inputValue tidak kosong, set showError ke false
    if (inputValue !== '') {
      setShowError({ label: label ?? '', status: false, message: '' });
    }
    // Jika lookupNama tidak undefined dan label sama dengan showError.label, set showError ke false
    else if (
      lookupNama !== undefined &&
      String(label) === String(showError.label)
    ) {
      setShowError({ label: label ?? '', status: false, message: '' });
    }
    // Perubahan: Hapus onPaste dari dependency agar efek ini tidak berjalan saat onPaste berubah
  }, [lookupNama, inputValue, label, showError.label]);
  useEffect(() => {
    if (focus === name && submitClicked) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [focus, name, inputRef, submitClicked]);
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);
  return (
    <Popover open={open} onOpenChange={() => {}}>
      <PopoverTrigger asChild>
        <div className="flex w-full flex-col">
          {forms ? (
            <FormField
              name={String(name) ?? ''}
              control={forms?.control}
              render={({ field }) => (
                <FormItem className="flex w-full flex-col justify-between ">
                  <FormControl>
                    <div
                      className="relative flex w-full flex-row items-center"
                      ref={popoverRef}
                    >
                      <Input
                        {...field}
                        ref={inputRef}
                        autoFocus
                        onPaste={(e) =>
                          handlePaste(e.clipboardData.getData('text'))
                        }
                        className={`w-full rounded-r-none text-sm text-zinc-900 lg:w-[100%] rounded-none${
                          showOnButton ? 'rounded-r-none border-r-0' : ''
                        } border border-zinc-300 pr-10 focus:border-[#adcdff]`}
                        disabled={disabled}
                        value={inputValue}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={handleInputKeydown}
                        onChange={(e) => {
                          handleInputChange(e);
                        }}
                      />

                      {(filters.search !== '' || inputValue !== '') &&
                      showClearButton ? (
                        <Button
                          type="button"
                          disabled={disabled && !clearDisabled ? true : false}
                          variant="ghost"
                          className="absolute right-10 text-gray-500 hover:bg-transparent"
                          onClick={handleClearInput}
                        >
                          <Image
                            src={IcClose}
                            width={15}
                            height={15}
                            alt="close"
                          />
                        </Button>
                      ) : null}

                      {showOnButton && (
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9 rounded-l-none border border-[#adcdff] bg-[#e0ecff] text-[#0e2d5f] hover:bg-[#7eafff] hover:text-[#0e2d5f]"
                          onClick={handleButtonClick}
                          disabled={disabled}
                        >
                          <FaChevronDown />
                        </Button>
                      )}
                    </div>
                  </FormControl>
                  {name && forms && !inputValue ? <FormMessage /> : null}
                </FormItem>
              )}
            />
          ) : (
            // Jika forms/control tidak ada, render input manual
            <div className="flex w-full flex-col justify-between ">
              <div
                className="relative flex w-full flex-row items-center"
                ref={popoverRef}
              >
                <Input
                  ref={inputRef}
                  // autoFocus
                  onPaste={(e) => handlePaste(e.clipboardData.getData('text'))}
                  className={`w-full rounded-r-none text-sm text-zinc-900 lg:w-[100%] rounded-none${
                    showOnButton ? 'rounded-r-none border-r-0' : ''
                  } border border-zinc-300 pr-10 focus:border-[#adcdff]`}
                  disabled={disabled}
                  value={inputValue}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDownCapture={(e) => {
                    // Tangkap event di capture phase (sebelum bubbling)
                    if (
                      e.key === 'ArrowLeft' ||
                      e.key === 'ArrowRight' ||
                      e.key === 'Home' ||
                      e.key === 'End'
                    ) {
                      e.stopPropagation();
                    }
                  }}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    handleInputKeydown(e);
                  }}
                  onChange={(e) => {
                    handleInputChange(e);
                  }}
                  name={String(name) ?? ''}
                />

                {(filters.search !== '' || inputValue !== '') &&
                showClearButton ? (
                  <Button
                    type="button"
                    disabled={disabled && !clearDisabled ? true : false}
                    variant="ghost"
                    className="absolute right-10 text-gray-500 hover:bg-transparent"
                    onClick={handleClearInput}
                  >
                    <Image src={IcClose} width={15} height={15} alt="close" />
                  </Button>
                ) : null}

                {showOnButton && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 rounded-l-none border border-[#adcdff] bg-[#e0ecff] text-[#0e2d5f] hover:bg-[#7eafff] hover:text-[#0e2d5f]"
                    onClick={handleButtonClick}
                    disabled={disabled}
                  >
                    <FaChevronDown />
                  </Button>
                )}
              </div>
              <p className="text-[0.8rem] text-destructive">
                {showError.status === true && label === showError.label
                  ? showError.message
                  : null}
              </p>
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        // ref={contentRef}
        id="popover-content"
        className="h-fit border border-blue-500 p-0 shadow-none backdrop-blur-none"
        side="bottom"
        align="start"
        sideOffset={-1} // Atur offset ke 0 agar tidak ada jarak
        avoidCollisions={true}
        style={{ width: popoverWidth }}
        onEscapeKeyDown={() => setOpen(false)}
      >
        {open && (
          <div ref={gridLookUpRef} className="w-full">
            <div
              className={`${
                collapse === true ? 'w-full' : 'w-[100%]'
              } flex-grow overflow-hidden transition-all duration-300`}
            >
              <div className="min-w-full rounded-lg bg-white">
                <div
                  className="flex h-[25px] w-full flex-row items-center border border-x-0 border-t-0 border-blue-500 px-2 py-2"
                  style={{
                    background:
                      'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 100%)'
                  }}
                >
                  <p className="text-[12px]">{labelLookup}</p>
                </div>
                <div
                  className={`${
                    rows.length > 0
                      ? rows.length < 10
                        ? 'h-fit'
                        : 'h-[290px]'
                      : singleColumn && rows.length <= 0
                      ? 'h-[30px]'
                      : 'h-[100px]'
                  }`}
                >
                  <DataGrid
                    ref={gridRef}
                    columns={columns}
                    rows={rows}
                    rowKeyGetter={rowKeyGetter}
                    onScroll={handleScroll}
                    rowClass={getRowClass}
                    onCellClick={handleCellClick}
                    onSelectedCellChange={(args) => {
                      onSelectedCellChange({ row: args.row });
                    }}
                    rowHeight={30}
                    headerRowHeight={singleColumn ? 0 : 70}
                    className={`rdg-light ${
                      rows.length > 0
                        ? rows.length < 10
                          ? 'h-fit'
                          : 'h-[290px]'
                        : singleColumn && rows.length <= 0
                        ? 'h-[30px]'
                        : 'h-[100px]'
                    } ${rows.length < 10 ? 'overflow-hidden' : ''}`}
                    // className="rdg-light fill-grid overflow-hidden"
                    onColumnsReorder={onColumnsReorder}
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
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
