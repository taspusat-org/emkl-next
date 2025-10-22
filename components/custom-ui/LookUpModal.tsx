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
  clearOpenNameModal,
  setClearLookup,
  setOpenNameModal,
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
import { Checkbox } from '../ui/checkbox';

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
  hideInput?: boolean;
  dateFromParam?: string; // default 'tglDari' jika tidak ada props
  dateToParam?: string; // default 'tglSampai' jika tidak ada props
  onSelectRow?: (selectedRowValue?: any | undefined) => void; // Make selectedRowValue optional
  onClear?: () => void;
  onSelectMultipleRows?: (selectedRows: Row[]) => void;
  enableMultiSelect?: boolean;
  notIn?: Record<string, any>;
  filterOnEnter?: boolean;
  autoSearch?: boolean; // Tambahkan ini
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
  onClear,
  hideInput = false,
  onSelectMultipleRows,
  enableMultiSelect = false,
  notIn,
  autoSearch = true
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
  const [checkedRows, setCheckedRows] = useState<Set<number>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const openNameModal = useSelector(
    (state: RootState) => state.lookup.openNameModal
  );
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
  const buildParams = useCallback(() => {
    const params: Record<string, any> = {
      page: currentPage,
      limit: filters.limit,
      sortBy: filters.sortBy,
      sortDirection: filters.sortDirection
    };

    // PERUBAHAN: Jika modal terbuka, selalu gunakan search (like), jika tertutup ikuti autoSearch
    if (open) {
      params['search'] = filters.search || ''; // like search saat modal terbuka
    } else {
      if (!autoSearch) {
        params['exactMatch'] = filters.search || ''; // exact search
      } else {
        params['search'] = filters.search || ''; // like search
      }
    }

    if (filters.filters) {
      for (const [k, v] of Object.entries(filters.filters)) params[k] = v;
    }
    if (filterby && !Array.isArray(filterby)) {
      for (const [k, v] of Object.entries(filterby)) {
        params[k] = v;
      }
    }

    if (notIn && typeof notIn === 'object') {
      const hasValidValues = Object.values(notIn).some(
        (val) => Array.isArray(val) && val.length > 0
      );

      if (hasValidValues) {
        params['notIn'] = JSON.stringify(notIn);
      }
    } else if (typeof notIn === 'string' && (notIn as string).trim() !== '') {
      params['notIn'] = notIn;
    }

    const effFrom = tglDari;
    const effTo = tglSampai;
    if (effFrom) params[dateFromParam] = effFrom;
    if (effTo) params[dateToParam] = effTo;
    return params;
  }, [
    currentPage,
    filters,
    filterby,
    dateFromParam,
    dateToParam,
    tglDari,
    tglSampai,
    notIn,
    autoSearch,
    open // Tambahkan dependency open
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

  // Fungsi untuk select baris pertama saat Enter di input (jika autoSearch false)
  const selectFirstRow = async () => {
    const newRows = await fetchRows();
    if (newRows.length > 0) {
      const firstRow = newRows[0];
      const classValue = firstRow[postData as string];

      setInputValue(classValue);
      setClicked(true); // TAMBAHKAN: Set clicked true
      dispatch(setSelectLookup({ key: label ?? '', data: firstRow }));

      const value = firstRow[dataToPost as any];
      lookupValue?.(value);
      onSelectRow?.(firstRow);
    } else {
      console.log('masuk322');
      setShowError({
        label: label ?? '',
        status: true,
        message: 'DATA TIDAK DITEMUKAN'
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const searchValue = e.target.value;
    setInputValue(searchValue);
    setCurrentPage(1);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      abortRef.current?.abort('New filter applied');
      const next = {
        ...filters,
        filters: {},
        search: searchValue,
        page: 1
      };
      setFilters(next);

      // PERUBAHAN: Jika autoSearch true ATAU modal terbuka, trigger filtering
      if (autoSearch || open) {
        dispatch(setOpenNameModal(label || ''));
        setFiltering(true);
      }

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
          dispatch(setOpenNameModal(label || '')); // Update Redux state
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

    // Jika label sama dengan openNameModal dan lookup sudah terbuka, tutup lookup
    if (label === openNameModal) {
      if (open) {
        setOpen(false); // Tutup lookup jika sudah terbuka
        dispatch(clearOpenNameModal()); // Clear openNameModal dari Redux
      } else {
        setOpen(true); // Buka lookup jika belum terbuka
      }
    } else {
      setOpen(true); // Buka lookup jika label berbeda dengan openNameModal
      dispatch(setOpenNameModal(label || '')); // Set openNameModal dengan label yang diklik
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
    setShowError({ label: label ?? '', status: false, message: '' });

    dispatch(setSearchTerm(''));
    if (onClear) {
      onClear(); // Trigger the passed onClear function
    }
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
      const allIds = rows.map((row) => Number(row.id));
      setCheckedRows(new Set(allIds));
    }
    setIsAllSelected(!isAllSelected);
  };
  const handleSubmitSelected = () => {
    const selectedRowsData = rows.filter((row) =>
      checkedRows.has(Number(row.id))
    );

    if (selectedRowsData.length === 0) {
      alert('Pilih minimal 1 baris!');
      return;
    }

    // Call the multi-select callback with selected rows
    if (onSelectMultipleRows) {
      onSelectMultipleRows(selectedRowsData);
    }

    // Reset selections and close modal
    setCheckedRows(new Set());
    setIsAllSelected(false);
    setOpen(false);
    setInputValue('');
  };

  const columns: readonly Column<Row>[] = useMemo(() => {
    const dataColumns = rawColumns.map((col, index) => ({
      ...col,
      key: col.key,
      headerCellClass: 'column-headers',
      width: singleColumn ? '100%' : col.width ?? 250,
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
                columnInputRefs.current[col.name] = el;
              }}
              type="text"
              className="filter-input z-[999999] h-8 w-full rounded-none"
              value={filters.filters[col.key] || ''}
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

        return (
          <div className="m-0 flex h-full cursor-pointer items-center p-0 text-[12px]">
            {highlightText(cellValue, filters.search, columnFilter)}
          </div>
        );
      }
    }));

    // Add checkbox column if multi-select is enabled
    if (enableMultiSelect) {
      const selectColumn: Column<Row> = {
        key: 'select',
        name: '',
        width: 50,
        resizable: true,
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
        renderCell: ({ row }: { row: Row }) => (
          <div className="flex h-full items-center justify-center">
            <Checkbox
              checked={checkedRows.has(Number(row.id))}
              onCheckedChange={() => handleRowSelect(Number(row.id))}
              id={`row-checkbox-${row.id}`}
            />
          </div>
        )
      };

      return [selectColumn, ...dataColumns];
    }

    return dataColumns;
  }, [
    filters,
    rawColumns,
    singleColumn,
    enableMultiSelect,
    isAllSelected,
    checkedRows,
    rows
  ]);
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
    onSelectRow?.(clickedRow); // cukup satu kali, tanpa else
    dispatch(clearOpenNameModal());
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
    if (!openNameModal) {
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
      dispatch(clearOpenNameModal());
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
    if (!autoSearch && !open && event.key === 'Enter') {
      event.preventDefault();
      selectFirstRow();
      return;
    }

    if ((!open && !filters.filters) || !openNameModal) {
      return;
    }
    const rowData = rows[selectedRow];
    const totalRows = rows.length; // Ensure the data contains all rows
    const visibleRowCount = 12; // You can adjust this value based on your visible row count

    if (event.key === 'Enter') {
      dispatch(clearOpenNameModal());
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
      if (notIn) {
        try {
          const notInObj =
            typeof notIn === 'string' ? JSON.parse(notIn) : notIn;
          if (notInObj && typeof notInObj === 'object') {
            for (const [key, values] of Object.entries(notInObj)) {
              if (Array.isArray(values)) {
                filtered = filtered.filter((row: Row) => {
                  const rowValue = String(row[key]);
                  return !values.some((v) => String(v) === rowValue);
                });
              }
            }
          }
        } catch (error) {
          console.error('Error parsing notIn parameter:', error);
        }
      }
      return filtered;
    },
    [filterby, filters, columns, notIn]
  );

  useEffect(() => {
    if (type === 'local' || !endpoint) {
      const filteredRows = data ? applyFilters(data) : [];

      if (isdefault && !deleteClicked) {
        if (isdefault === 'YA') {
          const defaultRow = filteredRows.find(
            (row: any) => row.default === 'YA'
          );
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
        // PERUBAHAN: Fetch jika (autoSearch true ATAU modal terbuka) DAN ada search term
        const shouldFetch = autoSearch || open;

        if (shouldFetch) {
          const newRows = await fetchRows(controller.signal);

          if (myRequestId !== requestIdRef.current) return;
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
        } else {
          return;
        }

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
  }, [open, endpoint, type, currentPage, filters, totalPages, autoSearch]);

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
        dispatch(clearOpenNameModal());
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
  }, [
    filters.search,
    filters.filters,
    rows,
    postData,
    selectedRequired,
    autoSearch
  ]); // Tambahka
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
    if (lookupNama) {
      setInputValue(lookupNama); // Assuming "text" is the display column
    } else {
      setInputValue('');
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
    // Update status open jika openNameModal sama dengan label
    if (label === openNameModal) {
      setOpen(true); // Jika label sama dengan openNameModal, buka lookup
    } else {
      setOpen(false); // Jika tidak sama, tutup lookup
    }
  }, [openNameModal, label]); // Efek dijalankan setiap kali openNameModal atau label berubah

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
        console.log('masuk676');
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
    if (
      (lookupNama !== undefined && String(label) === String(showError.label)) ||
      inputValue !== ''
    ) {
      setShowError({ label: label ?? '', status: false, message: '' });
    }
  }, [lookupNama, inputValue, label, showError.label]);
  useEffect(() => {
    // Reset clicked state saat inputValue berubah (user mulai ketik lagi)
    if (inputValue !== '' && clicked) {
      setClicked(false);
    }

    // Reset deleteClicked juga jika perlu
    if (inputValue !== '' && deleteClicked) {
      setDeleteClicked(false);
    }
  }, [inputValue, clicked, deleteClicked]);
  return (
    <>
      <div className="flex w-full flex-col">
        {!hideInput && (
          <>
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
                onClick={(e) => e.stopPropagation()}
                value={inputValue}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  handleInputKeydown(e);
                }}
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
                ? showError.message
                : null}
            </p>
          </>
        )}
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
                dispatch(clearOpenNameModal()); // Clear openNameModal ketika input dibersihkan
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
                    className="flex w-full flex-row gap-2 py-1"
                    style={{
                      background:
                        'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 100%)'
                    }}
                  >
                    <LoadRowsRenderer />
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
              onClick={() => {
                setOpen(false);
                dispatch(clearOpenNameModal()); // Clear openNameModal ketika input dibersihkan
              }}
            >
              <IoMdClose /> <p className="text-center text-white">Cancel</p>
            </Button>
            {enableMultiSelect && (
              <Button
                type="button"
                variant="default"
                className="flex items-center gap-1"
                onClick={handleSubmitSelected}
                disabled={checkedRows.size === 0}
              >
                ✓ Pilih ({checkedRows.size})
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
