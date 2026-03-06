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
  setType,
  addErrorLookup,
  removeErrorLookup,
  clearErrorLookups,
  addPendingLookup,
  removePendingLookup
} from '@/lib/store/lookupSlice/lookupSlice';
import { FormLabel } from '../ui/form';
import IcClose from '@/public/image/x.svg';
import Image from 'next/image';
import { REQUIRED_FIELD } from '@/constants/validation';
import { setSelectLookup } from '@/lib/store/selectLookupSlice/selectLookupSlice';
import { formatCurrency } from '@/lib/utils';
import { debounce } from 'lodash';
import FilterInput from './FilterInput';
import { useTheme } from 'next-themes';
import { highlightText } from './HighlightText';

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
  disabled?: boolean;
  clearDisabled?: boolean;
  selectedRequired?: boolean;
  name?: string;
  forms?: any;
  required?: boolean;
  onSelectRow?: (selectedRowValue?: any | undefined) => void;
  onClear?: () => void;
  autoSearch?: boolean;
  isExactMatch?: boolean;
  showClearButton?: boolean;
  forInput?: boolean;
  hideFilter?: boolean;
  focusOnError?: boolean;
  errorMessage?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
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
  [key: string]: any;
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
  disabled = false,
  clearDisabled = false,
  filterby,
  onSelectRow,
  onClear,
  autoSearch = true,
  isExactMatch = false,
  showClearButton = true,
  forInput = false,
  hideFilter = false,
  focusOnError = false,
  errorMessage,
  side = 'bottom'
}: LookUpProps) {
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isEnterLoading, setIsEnterLoading] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [onPaste, setOnPaste] = useState<boolean>(false);
  const dispatch = useDispatch();
  const [hasMore, setHasMore] = useState(true);
  const [popoverWidth, setPopoverWidth] = useState<number | string>('auto');
  const [clickedOutside, setClickedOutside] = useState(false);
  const gridLookUpRef = useRef<HTMLDivElement | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [filtering, setFiltering] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [deleteClicked, setDeleteClicked] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const isUserTypingRef = useRef(false);
  const prevLookupNamaRef = useRef<string | undefined>(undefined);
  const hasInitializedRef = useRef(false);
  const renderOrderRef = useRef<number>(0);
  const [showError, setShowError] = useState({
    label: label,
    status: false,
    message: ''
  });
  const [suppressErrorMessage, setSuppressErrorMessage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef<number>(0);

  const selectFirstRowControllerRef = useRef<AbortController | null>(null);
  const selectFirstRowRequestIdRef = useRef<number>(0);

  const instanceIdRef = useRef<string>(
    `${label}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );

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
  const errorLookups = useSelector(
    (state: RootState) => state.lookup.errorLookups
  );
  const { theme, resolvedTheme } = useTheme();

  const isDark = theme === 'dark' || resolvedTheme === 'dark';

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
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isTypingRef = useRef(false);
  const shouldFetchWithoutFilterRef = useRef(false);
  const pasteErrorRef = useRef(false);

  const getAbortController = () => {
    return abortControllerRef.current;
  };

  const setAbortController = (controller: AbortController | null) => {
    abortControllerRef.current = controller;
  };

  const getRequestId = () => {
    return requestIdRef.current;
  };

  const incrementRequestId = () => {
    requestIdRef.current += 1;
    return requestIdRef.current;
  };

  const columnFiltersString = useMemo(
    () => JSON.stringify(filters.filters),
    [filters.filters]
  );

  const initializeColumnFilters = useCallback(() => {
    const initialFilters: Record<string, string> = {};
    rawColumns.forEach((col) => {
      initialFilters[col.key] = '';
    });
    return initialFilters;
  }, [rawColumns]);
  const buildParams = useCallback(
    (overrideSearch?: string, skipFilters: boolean = false) => {
      const searchValue =
        overrideSearch !== undefined ? overrideSearch : filters.search;

      const params: Record<string, any> = {
        page: currentPage,
        limit: filters.limit,
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection
      };

      // Jika skipFilters = true, maka JANGAN kirim search & column filters
      if (!skipFilters) {
        // Kirim search params
        if (searchValue && searchValue.trim() !== '') {
          if (isExactMatch) {
            params['exactMatch'] = searchValue;
          } else {
            params['search'] = searchValue;
          }
        }

        // Kirim column filters
        rawColumns.forEach((col) => {
          const filterValue = filters.filters[col.name] || '';
          if (filterValue) {
            params[col.key] = filterValue;
          }
        });
      }

      // filterby selalu dikirim (ini adalah filter tetap dari props)
      if (filterby && !Array.isArray(filterby)) {
        for (const [k, v] of Object.entries(filterby)) {
          params[k] = v;
        }
      }

      return params;
    },
    [currentPage, filters, filterby, rawColumns, isExactMatch]
  );

  const mapApiToRows = useCallback(
    (payload: any[]): Row[] => {
      return payload.map((item: any) => {
        const row: Row = { id: item.id };

        // PERBAIKAN: Pindahkan logika default ke luar map dan simplifikasi kondisi
        for (const [k, v] of Object.entries(item)) if (k !== 'id') row[k] = v;
        return row;
      });
    },
    [dataToPost]
  );
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onPaste) {
      setOnPaste(false);
      return;
    }
    if (disabled) return;

    const searchValue = e.target.value;

    if (!open && searchValue.trim() !== '') {
      setOpen(true);
      dispatch(setOpenName(label || ''));
    }

    // Reset paste error saat user mulai mengetik
    pasteErrorRef.current = false;

    // Set flag bahwa user sedang mengetik
    isUserTypingRef.current = true;
    isTypingRef.current = true;
    setHasUserInteracted(true);

    if (searchValue.trim() !== '') {
      shouldFetchWithoutFilterRef.current = false;
    }

    // Update input value immediately untuk responsive UI
    setInputValue(searchValue);

    // Set rows kosong immediately saat user mengetik
    setRows([]);

    // Clear error saat user mulai mengetik
    setShowError({ label: label ?? '', status: false, message: '' });
    dispatch(removeErrorLookup(label || ''));
    setSuppressErrorMessage(true);

    // Track pending state
    if (searchValue.trim() !== '' && required) {
      dispatch(addPendingLookup(label || ''));
    }

    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set debounce timer - tunggu user selesai mengetik
    debounceTimerRef.current = setTimeout(() => {
      // Set flag bahwa user selesai mengetik
      isTypingRef.current = false;

      // Update filters dengan search value
      setFilters((prev) => ({
        ...prev,
        filters: initializeColumnFilters(),
        search: searchValue,
        page: 1
      }));

      setFiltering(true);
      setCurrentPage(1);
      setFetchedPages(new Set([1]));
    }, 500); // 500ms debounce
  };

  const clearAllColumnFilters = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      filters: initializeColumnFilters()
    }));
  }, [initializeColumnFilters]);

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
    }, 500)
  ).current;

  const handleFilterInputChange = useCallback(
    (colKey: string, value: string) => {
      // Set rows kosong saat filter column berubah
      setRows([]);
      // Reset flag shouldFetchWithoutFilter
      shouldFetchWithoutFilterRef.current = false;
      debouncedFilterUpdate(colKey, value);
    },
    [debouncedFilterUpdate]
  );

  const handleClearFilter = useCallback((colKey: string) => {
    debouncedFilterUpdate.cancel();
    setFilters((prev) => ({
      ...prev,
      filters: { ...prev.filters, [colKey]: '' },
      page: 1
    }));
    setRows([]);
    setCurrentPage(1);
    shouldFetchWithoutFilterRef.current = false;
  }, []);

  const gridRef = useRef<DataGridHandle | null>(null);

  const handlePaste = (event: string) => {
    setOnPaste(true);
    if (disabled) return;
    try {
      const pasted = event.trim();

      if (forInput) {
        setInputValue(pasted);
        lookupValue?.(pasted);
        dispatch(setSelectLookup({ key: label ?? '', data: { text: pasted } }));
        setShowError({ label: label ?? '', status: false, message: '' });
        clearAllColumnFilters();
        dispatch(clearOpenName());
        setOpen(false);
        setTimeout(() => {
          setOnPaste(false);
        }, 100);
        return;
      }

      // Untuk API type, gunakan selectFirstRow agar request ke API dengan filter
      if (type !== 'local' && endpoint) {
        setInputValue(pasted.toUpperCase());
        setShowError({ label: label ?? '', status: false, message: '' });
        pasteErrorRef.current = false;
        // Tutup popover agar main useEffect tidak ikut fetch (mencegah double request)
        setOpen(false);
        dispatch(clearOpenName());
        setTimeout(() => {
          setOnPaste(false);
        }, 100);
        selectFirstRow(pasted, false, true);
        return;
      }

      // Untuk local type, cari di full data (bukan rows yang sudah terfilter)
      const searchSource = type === 'local' && data ? (data as Row[]) : rows;
      const match = searchSource.find(
        (row) =>
          String(row[postData as string]).toUpperCase() === pasted.toUpperCase()
      );
      setInputValue(pasted.toUpperCase());
      if (match) {
        pasteErrorRef.current = false;
        lookupValue?.(dataToPost ? match[dataToPost as string] : match.id);
        onSelectRow?.(match);
        setShowError({ label: label ?? '', status: false, message: '' });
        clearAllColumnFilters();
        dispatch(clearOpenName());
        setOpen(false);
      } else {
        pasteErrorRef.current = true;
        setShowError({
          label: label ?? '',
          status: true,
          message: 'DATA TIDAK DITEMUKAN'
        });
        clearAllColumnFilters();
        setOpen(false);
        dispatch(clearOpenName());
      }
      setTimeout(() => {
        setOnPaste(false);
      }, 100);
    } catch (error) {}
  };

  const handleButtonClick = () => {
    setOnPaste(false);
    if (disabled) return;

    if (label === openName) {
      if (open) {
        setCurrentPage(1);
        setFetchedPages(new Set());
        setRows([]);
        clearAllColumnFilters();
        setOpen(false);
        dispatch(clearOpenName());
        shouldFetchWithoutFilterRef.current = false;
      } else {
        // PERBAIKAN: Saat popover dibuka dan ada inputValue, set flag untuk fetch tanpa filter
        if (inputValue && inputValue.trim() !== '') {
          shouldFetchWithoutFilterRef.current = true;
        }
        setOpen(true);
        dispatch(setOpenName(label || ''));
        setShowError({ label: label ?? '', status: false, message: '' });
      }
    } else {
      // PERBAIKAN: Saat popover dibuka dan ada inputValue, set flag untuk fetch tanpa filter
      if (inputValue && inputValue.trim() !== '') {
        shouldFetchWithoutFilterRef.current = true;
      }
      setOpen(true);
      dispatch(setOpenName(label || ''));
      setShowError({ label: label ?? '', status: false, message: '' });
    }
  };

  const handleClearInput = () => {
    setOnPaste(false);
    if (disabled && !clearDisabled) return;
    setFilters({ ...filters, search: '', filters: {} });
    setInputValue('');
    if (lookupValue) {
      lookupValue(null);
    }
    setShowError({ label: label ?? '', status: false, message: '' });

    setDeleteClicked(true);
    setHasUserInteracted(true);
    isUserTypingRef.current = false;
    isTypingRef.current = false;
    shouldFetchWithoutFilterRef.current = false; // TAMBAHKAN INI
    setFiltering(false);
    dispatch(setSelectLookup({ key: label ?? '', data: {} }));
    dispatch(setSearchTerm(''));
    dispatch(clearOpenName());
    clearAllColumnFilters();
    dispatch(removePendingLookup(label || ''));
    setOpen(false);

    setTimeout(() => {
      setDeleteClicked(false);
    }, 100);

    if (onClear) {
      onClear();
    }
  };

  const handleSort = (column: string) => {
    if (hideFilter) return;
    shouldFetchWithoutFilterRef.current = false;

    if (type === 'local' || !endpoint) {
      const currentSortBy = filters.sortBy;
      const currentSortDirection = filters.sortDirection;
      let newSortDirection: 'asc' | 'desc' = 'asc';
      if (currentSortBy === column && currentSortDirection === 'asc') {
        newSortDirection = 'desc';
      }

      setFilters((prevFilters) => ({
        ...prevFilters,
        sortBy: column,
        sortDirection: newSortDirection,
        page: 1
      }));

      const sortedRows = [...rows].sort((a, b) => {
        let aValue = a[column];
        let bValue = b[column];

        if (aValue == null) aValue = '';
        if (bValue == null) bValue = '';

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        } else if (typeof aValue !== typeof bValue) {
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
      name: col.name,

      headerCellClass: 'column-headers',
      width: singleColumn ? '100%' : col.width ?? 250,
      resizable: true,
      renderHeaderCell: () => (
        <div
          key={index}
          className="flex h-full cursor-pointer flex-col items-center gap-1"
        >
          <div
            className={`headers-cell ${hideFilter ? 'h-[100%]' : 'h-[50%]'}`}
            onClick={() => handleSort(col.name)}
          >
            <p
              className={`text-sm uppercase ${
                filters.sortBy === col.name ? 'font-bold' : 'font-normal'
              }`}
            >
              {col.name}
            </p>
            {hideFilter ? null : (
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
            )}
          </div>
          {hideFilter ? null : (
            <div className="relative h-[50%] w-full px-1">
              <FilterInput
                colKey={col.name}
                value={filters.filters[col.name] || ''}
                onChange={(value) => handleFilterInputChange(col.name, value)}
                tabIndex={-1}
                onClick={(e: React.MouseEvent<HTMLInputElement>) =>
                  e.stopPropagation()
                }
                onClear={() => handleClearFilter(col.name)}
                inputRef={(el) => {
                  columnInputRefs.current[col.name] = el;
                }}
              />
            </div>
          )}
        </div>
      ),
      renderCell: (props: any) => {
        const columnFilter = filters.filters[col.name] || '';
        let cellValue = props.row[props.column.key as keyof Row] || '';
        if (col.isCurrency) {
          cellValue = formatCurrency(cellValue);
        }
        return (
          <div
            className={`m-0 flex h-full items-center p-0  text-[12px] ${
              col.isCurrency ? 'justify-end' : 'justify-start'
            } ${forInput ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
            style={
              forInput
                ? { pointerEvents: 'none', whiteSpace: 'pre-wrap' }
                : { whiteSpace: 'pre-wrap' }
            }
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
    if (forInput) return;

    const rowIndex = rows.findIndex((r) => r.id === clickedRow.id);
    if (rowIndex !== -1) {
      setSelectedRow(rowIndex);
    }

    selectRowAndClose(clickedRow);
  }

  function onSelectedCellChange(args: { row: Row }) {
    if (forInput) return;
    const clickedRow = args.row;
    const rowIndex = rows.findIndex((r) => r.id === clickedRow.id);
    if (rowIndex !== -1) {
      setSelectedRow(rowIndex);
    }
  }

  document.querySelectorAll('.column-headers').forEach((element) => {
    element.classList.remove('c1kqdw7y7-0-0-beta-47');
  });

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

  // ============================================================================
  // PERBAIKAN: fetchRows dengan parameter skipFilters
  // ============================================================================
  async function fetchRows(
    signal?: AbortSignal,
    overrideSearch?: string,
    skipFilters: boolean = false
  ): Promise<Row[]> {
    const instanceId = instanceIdRef.current;
    try {
      const response = await api2.get(`/${endpoint}`, {
        params: buildParams(overrideSearch, skipFilters),
        signal: signal
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
      console.error(`[${label}] Failed to fetch rows:`, error);
      return [];
    }
  }

  function getRowClass(row: Row) {
    const rowIndex = rows.findIndex((r) => r.id === row.id);
    if (forInput) return 'disabled-row';
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

  const selectRowAndClose = useCallback(
    (rowData: Row) => {
      if (!rowData) {
        setShowError({
          label: label ?? '',
          status: true,
          message: 'DATA TIDAK DITEMUKAN'
        });
        return;
      }

      const classValue = rowData[postData as string];
      const value = dataToPost ? rowData[dataToPost as string] : rowData.id;

      setInputValue(classValue);
      setClicked(true);
      setHasUserInteracted(true);

      // Clear any existing error when a row is selected
      setShowError({ label: label ?? '', status: false, message: '' });
      dispatch(removeErrorLookup(label || ''));
      setSuppressErrorMessage(true);

      setFilters((prev) => ({ ...prev, search: classValue || '' }));

      dispatch(setLookUpValue(rowData as any));
      dispatch(setSelectLookup({ key: label ?? '', data: rowData }));
      dispatch(removePendingLookup(label || ''));
      dispatch(clearOpenName());

      lookupValue?.(value);
      onSelectRow?.(rowData);

      setFiltering(false);
      setOpen(false);
      clearAllColumnFilters();
      // JANGAN reset shouldFetchWithoutFilterRef di sini
      // Biarkan flag tetap true agar saat dibuka lagi masih fetch tanpa filter
      setTimeout(() => setClicked(false), 100);
    },
    [label, postData, dataToPost, dispatch, lookupValue, onSelectRow]
  );

  const selectFirstRow = async (
    searchValue?: string,
    fromEnterKey: boolean = false,
    exactMatch: boolean = false
  ) => {
    const instanceId = instanceIdRef.current;
    const valueToSearch = searchValue ?? inputValue;

    if (fromEnterKey) {
      setIsEnterLoading(true);
    }

    try {
      let newRows: Row[] = [];

      // Jika type local, ambil dari data lokal
      if (type === 'local' || !endpoint) {
        const allRows = data ? [...data] : [];

        // Filter berdasarkan search value
        if (valueToSearch && valueToSearch.trim() !== '') {
          const searchLower = valueToSearch.toLowerCase();
          const validColumnKeys = columns.map((col) => col.key);

          newRows = allRows.filter((row: Row) =>
            validColumnKeys.some((colKey) =>
              String(row[colKey] ?? '')
                .toLowerCase()
                .includes(searchLower)
            )
          );
        } else {
          newRows = allRows;
        }

        // Apply filterby jika ada
        if (filterby && !Array.isArray(filterby)) {
          newRows = newRows.filter((row: Row) =>
            Object.entries(filterby).every(
              ([k, v]) => String(row[k]) === String(v)
            )
          );
        }
      } else {
        // Jika type API, gunakan fetchRows
        const previousController = selectFirstRowControllerRef.current;
        if (previousController) {
          previousController.abort(
            `New selectFirstRow for instance: ${instanceId}`
          );
        }

        const controller = new AbortController();
        selectFirstRowControllerRef.current = controller;

        selectFirstRowRequestIdRef.current += 1;
        const myRequestId = selectFirstRowRequestIdRef.current;

        newRows = await fetchRows(controller.signal, valueToSearch, false);

        if (myRequestId !== selectFirstRowRequestIdRef.current) {
          if (fromEnterKey) {
            setIsEnterLoading(false);
          }
          return;
        }
      }
      if (newRows.length > 0) {
        // Jika exactMatch=true, harus ada baris yang nilai postData-nya sama persis
        const targetRow = exactMatch
          ? newRows.find(
              (row) =>
                String(row[postData as string]).toUpperCase() ===
                valueToSearch.toUpperCase()
            )
          : newRows[0];

        if (!targetRow) {
          // exact match tidak ditemukan
          dispatch(removePendingLookup(label || ''));
          pasteErrorRef.current = true;
          setShowError({
            label: label ?? '',
            status: true,
            message: 'DATA TIDAK DITEMUKAN'
          });
          if (focusOnError) {
            dispatch(
              addErrorLookup({
                label: label || '',
                order: renderOrderRef.current
              })
            );
          }
        } else {
          const classValue = targetRow[postData as string];
          setInputValue(classValue);
          setClicked(true);
          dispatch(setSelectLookup({ key: label ?? '', data: targetRow }));
          dispatch(removePendingLookup(label || ''));
          const value = targetRow[dataToPost as any];
          lookupValue?.(value);
          onSelectRow?.(targetRow);

          setFilters((prev) => ({
            ...prev,
            search: valueToSearch
          }));

          setTimeout(() => setClicked(false), 1000);

          if (fromEnterKey) {
            setTimeout(() => {
              setOpen(false);
              dispatch(clearOpenName());
            }, 1000);
          }
        }
      } else {
        dispatch(removePendingLookup(label || ''));
        setShowError({
          label: label ?? '',
          status: true,
          message: 'DATA TIDAK DITEMUKAN'
        });

        // TAMBAHAN: Tambahkan ke error lookups jika focusOnError aktif
        if (focusOnError) {
          dispatch(
            addErrorLookup({
              label: label || '',
              order: renderOrderRef.current
            })
          );
        }

        if (fromEnterKey) {
          setOpen(false);
          dispatch(clearOpenName());
        }
      }
    } catch (err: any) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
        if (fromEnterKey) {
          setIsEnterLoading(false);
        }
        return;
      }

      dispatch(removePendingLookup(label || ''));
      console.error(`[${label}] selectFirstRow error:`, err);
      setShowError({
        label: label ?? '',
        status: true,
        message: 'GAGAL MENGAMBIL DATA'
      });

      // TAMBAHAN: Tambahkan ke error lookups jika focusOnError aktif
      if (focusOnError) {
        dispatch(
          addErrorLookup({ label: label || '', order: renderOrderRef.current })
        );
      }

      if (fromEnterKey) {
        setOpen(false);
        dispatch(clearOpenName());
      }
    } finally {
      if (fromEnterKey) {
        setIsEnterLoading(false);
      }
    }
  };

  const handleInputKeydown = async (event: any) => {
    if (forInput) {
      if (event.key === 'Enter') {
        clearAllColumnFilters();
        dispatch(clearOpenName());
        lookupValue?.(inputValue);
        dispatch(
          setSelectLookup({ key: label ?? '', data: { text: inputValue } })
        );
        setOpen(false);
      }
      return;
    }

    if (!autoSearch && !open && event.key === 'Enter') {
      event.preventDefault();
      selectFirstRow(inputValue);
      return;
    }

    if ((!open && !filters.filters) || !openName) {
      return;
    }

    const totalRows = rows.length;
    const visibleRowCount = 12;

    const safeSelectedRow = Math.min(Math.max(0, selectedRow), totalRows - 1);
    const rowData = rows[safeSelectedRow];

    if (event.key === 'Enter') {
      event.preventDefault();
      if (isEnterLoading) {
        return;
      }

      if (open && inputValue.trim() !== '' && totalRows === 0) {
        await selectFirstRow(inputValue, true);

        return;

        // if (!isLoading) {
        //   setShowError({
        //     label: label ?? '',
        //     status: true,
        //     message: 'DATA TIDAK DITEMUKAN'
        //   });
        //   dispatch(removePendingLookup(label || ''));
        //   clearAllColumnFilters();
        //   setOpen(false);
        //   dispatch(clearOpenName());
        //   return;
        // }
      }

      if (rowData && totalRows > 0) {
        selectRowAndClose(rowData);
        return;
      }

      if (!rowData && inputValue.trim() !== '') {
        setShowError({
          label: label ?? '',
          status: true,
          message: 'DATA TIDAK DITEMUKAN'
        });
        dispatch(removePendingLookup(label || ''));
        clearAllColumnFilters();
        setOpen(false);
        dispatch(clearOpenName());
        return;
      }
    }

    if (event.key === 'ArrowDown') {
      if (gridRef.current !== null) {
        if (selectedRow < totalRows - 1) {
          gridRef?.current?.selectCell({ rowIdx: selectedRow + 1, idx: 0 });
        }
      }
    } else if (event.key === 'ArrowUp') {
      if (selectedRow === 0 && gridRef.current) {
        event.preventDefault();
      } else {
        gridRef?.current?.selectCell({ rowIdx: selectedRow - 1, idx: 0 });
      }
    } else if (event.key === 'PageDown') {
      const nextRow = Math.min(selectedRow + visibleRowCount, totalRows - 1);
      gridRef?.current?.selectCell({
        rowIdx: nextRow,
        idx: 0
      });
    } else if (event.key === 'PageUp') {
      const newRow = Math.max(selectedRow - visibleRowCount, 0);
      gridRef?.current?.selectCell({
        rowIdx: newRow,
        idx: 0
      });
    }
  };

  useEffect(() => {
    if (open) {
      setIsFirstLoad(true);
      setSelectedRow(0);
      setTimeout(() => {
        isUserTypingRef.current = false;
        isTypingRef.current = false;
      }, 150);
    }
  }, [open]);

  useEffect(() => {
    if (isFirstLoad && gridRef.current && rows.length > 0 && open) {
      setIsFirstLoad(false);
    }
  }, [rows, isFirstLoad, open]);

  const handleClickInput = (event: React.MouseEvent) => {
    event.stopPropagation();

    if (selectedRequired) {
      return;
    }

    if (!open) {
      // PERBAIKAN: Saat popover dibuka dan ada inputValue, set flag untuk fetch tanpa filter
      if (inputValue && inputValue.trim() !== '') {
        shouldFetchWithoutFilterRef.current = true;
      }
      setOpen(true);
      dispatch(setOpenName(label || ''));
      setShowError({ label: label ?? '', status: false, message: '' });
    } else if (open && filters.search.trim() !== '' && rows.length > 0) {
      if (forInput) {
        setOpen(false);
        clearAllColumnFilters();
        dispatch(setOpenName(label || ''));
        dispatch(clearOpenName());
        return;
      }
      setFilters({
        ...filters,
        search: rows[0][postData as string] || ''
      });
      setInputValue(rows[0][postData as string] || '');
      const value = dataToPost ? rows[0][dataToPost as string] : rows[0].id;
      lookupValue?.(value);
      onSelectRow?.(rows[0]);
      dispatch(clearOpenName());
    } else if (open && singleColumn) {
      setOpen(false);
      clearAllColumnFilters();
      dispatch(clearOpenName());
    }
  };

  const applyFilters = useCallback(
    (rows: Row[]) => {
      let filtered = rows;

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

      const nameToKeyMap = rawColumns.reduce(
        (acc, col) => {
          acc[col.name] = col.key;
          return acc;
        },
        {} as Record<string, string>
      );

      for (const [colName, filterValue] of Object.entries(
        filters.filters || {}
      )) {
        if (!filterValue || filterValue.trim() === '') continue;

        const colKey = nameToKeyMap[colName] || colName;
        filtered = filtered.filter((row: Row) =>
          String(row[colKey as keyof Row] ?? '')
            .toLowerCase()
            .includes(String(filterValue).toLowerCase())
        );
      }

      if (filterby && !Array.isArray(filterby)) {
        filtered = filtered.filter((row: Row) =>
          Object.entries(filterby).every(
            ([k, v]) => String(row[k]) === String(v)
          )
        );
      }

      return filtered;
    },
    [filterby, filters, columns, rawColumns]
  );
  useEffect(() => {
    if (type === 'local' || !endpoint) {
      const filteredRows = data ? applyFilters(data) : [];

      if (isdefault && !hasUserInteracted && !lookupNama && !inputValue) {
        if (isdefault === 'YA') {
          const defaultRow = filteredRows.find(
            (row: any) => row.default === 'YA'
          );
          if (defaultRow) {
            setInputValue(defaultRow?.text);
            if (lookupValue) {
              lookupValue(
                dataToPost ? defaultRow[dataToPost as string] : defaultRow?.id
              );
            }
            onSelectRow?.(defaultRow);
          }
        }
      }

      setRows(filteredRows);
      setIsLoading(false);
      return;
    }

    // PERBAIKAN: Jangan fetch jika sedang mengetik (tunggu debounce selesai)
    if (isTypingRef.current) {
      return;
    }
    const shouldFetchForDefault =
      !hasUserInteracted && !inputValue && !lookupNama && rows.length === 0;

    if (!open && !shouldFetchForDefault) {
      setIsLoading(false);
      return;
    }

    // API mode
    const instanceId = instanceIdRef.current;
    setIsLoading(true);

    const previousController = getAbortController();
    if (previousController) {
      previousController.abort(`New request for instance: ${instanceId}`);
    }

    const controller = new AbortController();
    setAbortController(controller);

    const myRequestId = incrementRequestId();

    // PERBAIKAN: Tentukan apakah harus skip filter
    const shouldSkip =
      shouldFetchWithoutFilterRef.current || shouldFetchForDefault;

    (async () => {
      try {
        const newRows = await fetchRows(
          controller.signal,
          undefined,
          shouldSkip
        );

        if (myRequestId !== getRequestId()) return;

        setRows((prev) => {
          if (currentPage === 1) return newRows;

          const seen = new Set<number | string>();
          const merged = [...prev, ...newRows].filter((r) => {
            const k = r.id;
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
          });
          return merged;
        });

        setFetchedPages((prev) => {
          const s = new Set(prev);
          s.add(currentPage);
          return s;
        });

        setHasMore(currentPage < totalPages);
      } catch (err: any) {
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
          return;
        }
        if (myRequestId === getRequestId()) {
          console.error(`[${instanceId}] Failed to fetch rows:`, err);
        }
      } finally {
        if (myRequestId === getRequestId()) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      // Tidak abort di cleanup untuk mencegah cancel premature
    };
  }, [
    open,
    endpoint,
    type,
    currentPage,
    filters.search,
    filters.sortBy,
    filters.sortDirection,
    columnFiltersString,
    totalPages,
    data,
    applyFilters,
    hasUserInteracted,
    inputValue,
    lookupNama,
    rows.length
  ]);
  // Tambahkan useEffect ini setelah useEffect yang ada
  useEffect(() => {
    // Handle default value untuk type API
    if (
      type !== 'local' &&
      endpoint &&
      !hasUserInteracted &&
      !inputValue &&
      !lookupNama &&
      rows.length > 0
    ) {
      const defaultRow = rows.find((row: any) => row.default === 'YA');
      if (defaultRow) {
        const value = dataToPost
          ? defaultRow[dataToPost as string]
          : defaultRow.id;
        const classValue = defaultRow[postData as string];

        setInputValue(classValue);
        lookupValue?.(value);
        onSelectRow?.(defaultRow);
        dispatch(setSelectLookup({ key: label ?? '', data: defaultRow }));
      }
    }
  }, [
    type,
    endpoint,
    rows,
    hasUserInteracted,
    inputValue,
    lookupNama,
    dataToPost,
    postData,
    lookupValue,
    onSelectRow,
    dispatch,
    label
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

      const isOutside =
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        gridLookUpRef.current &&
        !gridLookUpRef.current.contains(e.target as Node);

      if (!isOutside) {
        return;
      }

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      if (forInput) {
        setClickedOutside(true);
        setOpen(false);
        dispatch(clearOpenName());
        dispatch(removePendingLookup(label || ''));
        setFiltering(false);
        shouldFetchWithoutFilterRef.current = false;
        return;
      }

      setClickedOutside(true);
      setOpen(false);
      clearAllColumnFilters();
      dispatch(clearOpenName());
      setFiltering(false);
      shouldFetchWithoutFilterRef.current = false;

      const currentInputValue = inputValue;

      // PERBAIKAN: Selalu panggil selectFirstRow jika ada inputValue
      if (currentInputValue && currentInputValue.trim() !== '') {
        // selectFirstRow akan handle error jika data tidak ditemukan
        selectFirstRow(currentInputValue);
      } else {
        // Jika tidak ada inputValue, hapus pending lookup
        dispatch(removePendingLookup(label || ''));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [
    inputValue,
    rows,
    postData,
    dataToPost,
    selectedRequired,
    forInput,
    lookupValue,
    onSelectRow,
    label,
    dispatch,
    selectFirstRow // TAMBAHKAN dependency
  ]);

  useEffect(() => {
    if (
      autoSearch &&
      !onPaste &&
      !deleteClicked &&
      !clicked &&
      !clickedOutside &&
      label === openName
    ) {
      if (filters.search.trim() !== '' && filtering) {
        setOpen(true);
        setSelectedRow(0);
        setClickedOutside(false);
      } else if (
        Object.values(filters.filters || {}).some(
          (v) => v && v.trim() !== ''
        ) &&
        filtering
      ) {
        setOpen(true);
        setSelectedRow(0);
        setClickedOutside(false);
      }
    }

    if (clickedOutside) {
      setTimeout(() => setClickedOutside(false), 100);
    }
  }, [
    filters.search,
    columnFiltersString,
    filtering,
    autoSearch,
    onPaste,
    deleteClicked,
    clicked,
    clickedOutside,
    openName,
    label
  ]);

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
    if (!hasInitializedRef.current && lookupNama) {
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

      hasInitializedRef.current = true;
      prevLookupNamaRef.current = lookupNama;
    }
  }, [lookupNama, rows]);

  useEffect(() => {
    if (!hasInitializedRef.current || isUserTypingRef.current) {
      return;
    }

    const hasValueChanged = prevLookupNamaRef.current !== lookupNama;

    if (!hasValueChanged) {
      return;
    }

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
      setInputValue('');
      setFilters((prev) => ({ ...prev, search: '', filters: {} }));
    }

    prevLookupNamaRef.current = lookupNama;
  }, [lookupNama, rows, deleteClicked, clicked]);

  useEffect(() => {
    isUserTypingRef.current = false;
  }, [lookupNama]);

  useEffect(() => {
    if (clearLookup) {
      setInputValue('');
      dispatch(setClearLookup(false));
      setFilters({ ...filters, search: '', filters: {} });
      shouldFetchWithoutFilterRef.current = false;
    }
  }, [clearLookup, dispatch]);

  useEffect(() => {
    const preventScrollOnSpace = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
      }
    };

    document.addEventListener('keydown', preventScrollOnSpace);

    return () => {
      document.removeEventListener('keydown', preventScrollOnSpace);
    };
  }, []);

  useEffect(() => {
    const handleGlobalEnter = async (event: KeyboardEvent) => {
      if (label !== openName) return;

      if (event.key !== 'Enter') return;

      if (isEnterLoading) return;

      if (forInput) return;

      if (open && rows.length > 0) {
        event.preventDefault();
        const safeSelectedRow = Math.min(
          Math.max(0, selectedRow),
          rows.length - 1
        );
        const rowData = rows[safeSelectedRow];
        if (rowData) {
          selectRowAndClose(rowData);
          return;
        }
      }

      if (inputValue.trim() !== '') {
        event.preventDefault();
        if (open && rows.length === 0 && !isLoading) {
          setShowError({
            label: label ?? '',
            status: true,
            message: 'DATA TIDAK DITEMUKAN'
          });
          dispatch(removePendingLookup(label || ''));
          setOpen(false);
          dispatch(clearOpenName());
          return;
        }

        await selectFirstRow(inputValue, true);
        return;
      }
    };

    document.addEventListener('keydown', handleGlobalEnter);

    return () => {
      document.removeEventListener('keydown', handleGlobalEnter);
    };
  }, [
    label,
    openName,
    open,
    rows,
    selectedRow,
    inputValue,
    forInput,
    isEnterLoading,
    isLoading,
    selectRowAndClose,
    dispatch,
    setShowError
  ]);

  useEffect(() => {
    if (label === openName && !onPaste) {
      setOpen(true);
    }
  }, [openName, label, onPaste]);

  const prevOpenRef = useRef<boolean>(open);
  useEffect(() => {
    if (prevOpenRef.current && !open && forInput) {
      lookupValue?.(inputValue);
      dispatch(
        setSelectLookup({ key: label ?? '', data: { text: inputValue } })
      );
    }
    prevOpenRef.current = open;
  }, [open, forInput, inputValue, lookupValue, dispatch, label]);

  useEffect(() => {
    const preventScrollOnSpace = (event: KeyboardEvent) => {
      if (inputRef.current) {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          setSelectedRow(0);
          gridRef?.current?.selectCell({ rowIdx: 0, idx: 0 });
        }
        return;
      }
      document.addEventListener('keydown', preventScrollOnSpace);
    };
  }, [inputRef]);

  useEffect(() => {
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
    if (onPaste) return;
    if (pasteErrorRef.current) return;

    if (inputValue !== '') {
      setShowError({ label: label ?? '', status: false, message: '' });
    } else if (
      lookupNama !== undefined &&
      String(label) === String(showError.label)
    ) {
      setShowError({ label: label ?? '', status: false, message: '' });
    }
  }, [lookupNama, inputValue, label, showError.label]);

  useEffect(() => {
    if (focus === name && submitClicked) {
    }
  }, [focus, name, inputRef, submitClicked]);

  useEffect(() => {
    if (focusOnError && required) {
      const order = Date.now() + Math.random();
      renderOrderRef.current = order;
    }
  }, []);

  useEffect(() => {
    if (focusOnError && showError.status && showError.label === label) {
      dispatch(
        addErrorLookup({ label: label || '', order: renderOrderRef.current })
      );
    } else if (!showError.status) {
      dispatch(removeErrorLookup(label || ''));
    }
  }, [focusOnError, showError.status, showError.label, label, dispatch]);

  useEffect(() => {
    if (focusOnError && errorLookups.length > 0) {
      const firstError = errorLookups[0];
      if (firstError.label === label) {
        setTimeout(() => {
          inputRef.current?.select();
        }, 100);
      }
    }
  }, [focusOnError, errorLookups, label]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

      const controller = getAbortController();
      if (controller) {
        controller.abort(`Component unmount: ${label}`);
        setAbortController(null);
      }
    };
  }, []);

  useEffect(() => {
    if (forms?.formState.errors) {
      setShowError({
        label: label ?? '',
        status: false,
        message: ''
      });
    }
  }, [forms?.formState.errors, label, name]);

  // Reset suppressErrorMessage when a new errorMessage arrives from parent
  useEffect(() => {
    if (errorMessage) {
      setSuppressErrorMessage(false);
    }
  }, [errorMessage]);

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
                        onPaste={(e) =>
                          handlePaste(e.clipboardData.getData('text'))
                        }
                        className={`w-full rounded-r-none text-sm text-input-text lg:w-[100%] rounded-none${
                          showOnButton && !forInput
                            ? 'rounded-r-none border-r-0'
                            : ''
                        } border border-input-border pr-10 focus:border-input-border-focus`}
                        disabled={disabled}
                        value={inputValue}
                        onClick={(e) => handleClickInput(e as any)}
                        onKeyDown={handleInputKeydown}
                        onChange={(e) => {
                          handleInputChange(e);
                        }}
                      />

                      {!forInput && showClearButton ? (
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

                      {showOnButton && !forInput ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9 rounded-l-none border border-[#adcdff] bg-[#e0ecff] text-[#0e2d5f] hover:bg-[#7eafff] hover:text-[#0e2d5f]"
                          onClick={handleButtonClick}
                          disabled={disabled}
                        >
                          <FaChevronDown />
                        </Button>
                      ) : null}
                    </div>
                  </FormControl>
                  {showError.status === true && label === showError.label ? (
                    <p className="text-[0.8rem] text-destructive">
                      {showError.message}
                    </p>
                  ) : null}
                </FormItem>
              )}
            />
          ) : (
            <div className="flex w-full flex-col justify-between ">
              <div
                className="relative flex w-full flex-row items-center"
                ref={popoverRef}
              >
                <Input
                  ref={inputRef}
                  onPaste={(e) => handlePaste(e.clipboardData.getData('text'))}
                  className={`w-full rounded-r-none text-sm text-input-text lg:w-[100%] rounded-none${
                    showOnButton && !forInput ? 'rounded-r-none border-r-0' : ''
                  } border border-input-border pr-10 focus:border-input-border-focus`}
                  disabled={disabled}
                  value={inputValue}
                  onClick={(e) => handleClickInput(e as any)}
                  onKeyDownCapture={(e) => {
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

                {!forInput && showClearButton ? (
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

                {showOnButton && !forInput ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 rounded-l-none border border-[#adcdff] bg-[#e0ecff] text-[#0e2d5f] hover:bg-[#7eafff] hover:text-[#0e2d5f]"
                    onClick={handleButtonClick}
                    disabled={disabled}
                  >
                    <FaChevronDown />
                  </Button>
                ) : null}
              </div>
              <p className="text-[0.8rem] text-destructive">
                {!suppressErrorMessage && errorMessage
                  ? errorMessage
                  : showError.status === true && label === showError.label
                  ? showError.message
                  : null}
              </p>
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        id="popover-content"
        className="h-fit border border-border p-0 shadow-none backdrop-blur-none"
        side={side}
        align="start"
        sideOffset={side === 'top' ? 4 : -2}
        avoidCollisions={side === 'top'}
        style={{ width: popoverWidth }}
        onEscapeKeyDown={() => {
          if (!isEnterLoading) {
            setOpen(false);
          }
        }}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {open && (
          <div ref={gridLookUpRef} className="w-full">
            <div
              className={`${
                collapse === true ? 'w-full' : 'w-[100%]'
              } flex-grow overflow-hidden transition-all duration-300`}
            >
              <div className="min-w-full rounded-lg bg-background">
                <div className="flex h-[25px] w-full flex-row items-center border border-x-0 border-t-0 border-border bg-background-grid-header px-2 py-2">
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
                    onSelectedCellChange={(args: any) => {
                      onSelectedCellChange({ row: args.row });
                    }}
                    rowHeight={30}
                    headerRowHeight={singleColumn ? 0 : hideFilter ? 30 : 70}
                    className={`${isDark ? 'rdg-dark' : 'rdg-light'} ${
                      rows.length > 0
                        ? rows.length < 10
                          ? 'h-fit'
                          : 'h-[290px]'
                        : singleColumn && rows.length <= 0
                        ? 'h-[30px]'
                        : 'h-[100px]'
                    } ${rows.length < 10 ? 'overflow-hidden' : ''}`}
                    onColumnsReorder={onColumnsReorder}
                    renderers={{
                      noRowsFallback: <EmptyRowsRenderer />
                    }}
                  />
                  {isLoading ? (
                    <div className="absolute bottom-0 flex w-full flex-row gap-2 bg-background-grid-header py-1">
                      <LoadRowsRenderer />
                      <p className="text-primary-text text-sm">Loading...</p>
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
