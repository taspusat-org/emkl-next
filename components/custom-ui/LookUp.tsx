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

interface LinkFilter {
  linkTo: string;
  linkValue: string | number | Array<string | number>;
}
interface LookUpProps {
  columns: { key: string; name: string; width?: number }[];
  endpoint?: string;
  label?: string;
  labelLookup?: string;
  singleColumn?: boolean;
  filterby?: { key: string; name: string };
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
  selectedRequired = false,
  showOnButton = true,
  lookupValue,
  singleColumn = false,
  pageSize = 20,
  isSubmitClicked = false,
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
  const [popoverWidth, setPopoverWidth] = useState<number | string>('auto');
  const [clickedOutside, setClickedOutside] = useState(false);
  const gridLookUpRef = useRef<HTMLDivElement | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [filtering, setFiltering] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [deleteClicked, setDeleteClicked] = useState(false);
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
      for (const [k, v] of Object.entries(filterby)) params[k] = v;
    }
    return params;
  }, [currentPage, filters, filterby]);

  // Mapping API → Row[]
  const mapApiToRows = useCallback(
    (payload: any[]): Row[] => {
      return payload.map((item: any) => {
        const row: Row = { id: item.id };
        if (item?.default && !lookupNama && item.default === 'YA') {
          setInputValue(item.text);
          const value = item[dataToPost as string] || item.id;
          lookupValue?.(value);
          onSelectRow?.(value);
        }
        for (const [k, v] of Object.entries(item)) if (k !== 'id') row[k] = v;
        return row;
      });
    },
    [lookupNama, lookupValue, onSelectRow, setInputValue]
  );

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
        return (
          <div className="m-0 flex h-full cursor-pointer items-center p-0  text-[12px]">
            {highlightText(
              props.row[props.column.key as keyof Row] || '', // Get the text value for the current row and column
              filters.search, // Use the global search term
              columnFilter // Use the column-specific filter
            )}
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
    const value = clickedRow[dataToPost as any];

    lookupValue?.(value);
    onSelectRow?.(value); // cukup satu kali, tanpa else
    dispatch(clearOpenName());
  }
  document.querySelectorAll('.column-headers').forEach((element) => {
    element.classList.remove('c1kqdw7y7-0-0-beta-47');
  });
  const handleKeyDown = (
    args: CellKeyDownArgs<Row>,
    event: React.KeyboardEvent
  ) => {
    // Check if the input is focused
    // if (inputRef.current && inputRef.current === document.activeElement) {
    //   // If ArrowDown or ArrowUp is pressed, select rows but don't lose focus on the input
    //   if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    //     event.preventDefault(); // Prevent default scroll or focus behavior

    //     // Update the selected row based on ArrowDown/ArrowUp
    //     setSelectedRow((prev) => {
    //       const newSelectedRow =
    //         event.key === 'ArrowDown'
    //           ? Math.min(prev + 1, rows.length - 1)
    //           : Math.max(prev - 1, 0);

    //       // Select the row in the grid without losing focus
    //       gridRef?.current?.selectCell({ rowIdx: newSelectedRow, idx: 0 });

    //       return newSelectedRow;
    //     });

    //     // Ensure input remains focused, set timeout to prevent delay
    //     setTimeout(() => {
    //       if (inputRef.current) {
    //         inputRef.current.focus(); // Keep focus on the input field
    //       }
    //     }, 0);
    //   }
    //   return; // Prevent propagation of the key event to grid navigation
    // }

    // Handle other key events for grid navigation (when input is not focused)
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
      // setTimeout(
      //   () => {
      //     if (inputRef.current) {
      //       inputRef.current.focus();
      //     }
      //   },
      //   type !== 'local' ? 300 : 150
      // );
    } else if (event.key === 'ArrowUp') {
      setSelectedRow((prev) => {
        if (prev === null) return firstDataRowIndex;
        const newRow = Math.max(prev - 1, firstDataRowIndex);
        return newRow;
      });
      // setTimeout(
      //   () => {
      //     if (inputRef.current) {
      //       inputRef.current.focus();
      //     }
      //   },
      //   type !== 'local' ? 300 : 150
      // );
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

  // const handleColumnInputKeydown = (
  //   event: any,
  //   colKey: keyof Filter['filters']
  // ) => {
  //   if (!open) {
  //     return;
  //   }
  //   const rowData = rows[selectedRow];
  //   const totalRows = rows.length; // Ensure the data contains all rows
  //   const visibleRowCount = 12; // You can adjust this value based on your visible row count

  //   if (event.key === 'Enter') {
  //     dispatch(clearOpenName());
  //     setInputValue(rowData[postData as string]);
  //     if (lookupValue) {
  //       lookupValue(dataToPost ? rowData[dataToPost] : rowData.id); // Pass the clickedRow.id to the parent component's form
  //     }
  //     setOpen(false);
  //   }
  //   if (event.key === 'ArrowDown') {
  //     if (gridRef.current !== null) {
  //       // Only update selectedRow if we haven't reached the last row
  //       if (selectedRow < totalRows - 1) {
  //         setSelectedRow(selectedRow + 1);
  //         gridRef?.current?.selectCell({ rowIdx: selectedRow + 1, idx: 0 });
  //       }

  //       setTimeout(() => {
  //         if (columnInputRefs.current[colKey]) {
  //           columnInputRefs.current[colKey].focus();
  //         }
  //       }, 300); // Adjust timeout as needed
  //     }
  //   } else if (event.key === 'ArrowUp') {
  //     if (selectedRow === 0 && gridRef.current) {
  //       event.preventDefault();
  //     } else {
  //       setSelectedRow(selectedRow - 1);
  //       gridRef?.current?.selectCell({ rowIdx: selectedRow - 1, idx: 0 });

  //       setTimeout(
  //         () => {
  //           if (columnInputRefs.current[colKey]) {
  //             columnInputRefs.current[colKey].focus();
  //           }
  //         },
  //         type !== 'local' ? 300 : 150
  //       );
  //     }
  //   } else if (event.key === 'PageDown') {
  //     setSelectedRow((prev) => {
  //       if (prev === null) return 0; // Start from the first row
  //       const nextRow = Math.min(prev + visibleRowCount, totalRows - 1);
  //       return nextRow;
  //     });
  //     const nextRow = Math.min(selectedRow + visibleRowCount, totalRows - 1);
  //     gridRef?.current?.selectCell({
  //       rowIdx: nextRow,
  //       idx: 0
  //     });
  //     // Ensure selectCell is updated after selectedRow change
  //     setTimeout(
  //       () => {
  //         if (columnInputRefs.current[colKey]) {
  //           columnInputRefs.current[colKey].focus();
  //         }
  //       },
  //       type !== 'local' ? 300 : 150
  //     );
  //   } else if (event.key === 'PageUp') {
  //     setSelectedRow((prev) => {
  //       if (prev === null) return 0; // Start from the first row
  //       const newRow = Math.max(prev - visibleRowCount, 0);
  //       return newRow;
  //     });
  //     const newRow = Math.max(selectedRow - visibleRowCount, 0);
  //     gridRef?.current?.selectCell({
  //       rowIdx: newRow,
  //       idx: 0
  //     });
  //     // Ensure selectCell is updated after selectedRow change
  //     setTimeout(
  //       () => {
  //         if (columnInputRefs.current[colKey]) {
  //           columnInputRefs.current[colKey].focus();
  //         }
  //       },
  //       type !== 'local' ? 300 : 150
  //     );
  //   }
  // };
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

      // filterby array (local only)
      if (Array.isArray(filterby) && filterby.length) {
        filtered = filtered.filter((row: Row) =>
          filterby.every((f) =>
            Object.entries(f).every(([k, v]) => String(row[k]) === String(v))
          )
        );
      }

      // column filters
      for (const [colKey, filterValue] of Object.entries(
        filters.filters || {}
      )) {
        const fv = String(filterValue).toLowerCase();
        filtered = filtered.filter((row: Row) =>
          String(row[colKey as keyof Row])
            .toLowerCase()
            .includes(fv)
        );
      }

      // global search
      const q = (filters.search || '').toLowerCase();
      if (q) {
        filtered = filtered.filter((row: Row) =>
          Object.values(row).some((v) => String(v).toLowerCase().includes(q))
        );
      }

      return filtered;
    },
    [filterby, filters]
  );

  const [isFetching, setIsFetching] = useState(false); // Mengontrol fetching status
  const hasFetchedRef = useRef(false); // Menandakan apakah sudah pernah fetch

  useEffect(() => {
    // Jangan lakukan fetch jika lookup tidak terbuka

    // Reset hasFetched ketika filter berubah
    if (hasFetchedRef.current && !shallowEqual(filters, prevFilters)) {
      console.log('masul');
      hasFetchedRef.current = false;
    }
    console.log('hasFetchedRef.current', hasFetchedRef.current);
    if (!hasFetchedRef.current) {
      if (type !== 'local' && endpoint) {
        setIsLoading(true); // Mulai loading sebelum fetch
        abortRef.current?.abort('Effect re-run'); // Batalkan request sebelumnya
        const controller = new AbortController();
        abortRef.current = controller;

        const myRequestId = ++requestIdRef.current; // Track request ID

        (async () => {
          try {
            const newRows = await fetchRows(controller.signal); // Fetch data dari API

            // Hanya update rows jika request ID masih sesuai (menghindari double-fetch)
            if (myRequestId !== requestIdRef.current) return;
            setRows(applyFilters(newRows));
            setPrevFilters(filters); // Update prevFilters agar tidak terjadi loop
            setIsFirstLoad(false); // Tandai fetch pertama selesai
            hasFetchedRef.current = true; // Tandai fetch sudah dilakukan
          } catch (error) {
            console.error('Failed to fetch rows', error); // Log error jika terjadi masalah
          } finally {
            // Pastikan setIsLoading(false) hanya dipanggil setelah fetching selesai
            if (myRequestId === requestIdRef.current) {
              setIsLoading(false); // Akhiri loading
              setIsFetching(false); // Mengindikasikan bahwa fetch selesai
            }
          }
        })();

        return () => controller.abort(); // Cleanup: Batalkan fetch jika effect dihentikan
      } else {
        // Filter data lokal jika tidak menggunakan API
        const filteredRows = data ? applyFilters(data) : [];
        console.log('isDefault', isdefault);
        if (isdefault && !lookupNama) {
          if (isdefault === 'YA') {
            const defaultRow = filteredRows.find(
              (row: any) => row.default === 'YA'
            );
            if (defaultRow) {
              setInputValue(defaultRow?.text);
              if (lookupValue) {
                lookupValue(defaultRow?.id);
              }
            }
          }
        }

        setRows(filteredRows); // Set filtered rows
        setIsLoading(false); // Selesaikan loading
        hasFetchedRef.current = true; // Tandai fetch sudah selesai
      }
    }
  }, [
    open,
    openName,
    filters, // Memastikan effect dipicu ketika filters berubah
    currentPage,
    fetchedPages,
    type,
    endpoint,
    data,
    applyFilters,
    prevFilters,
    hasFetchedRef.current // Tidak gunakan state, cukup gunakan ref
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
  console.log(lookupNama, inputValue, 'lookupNama'); // Debugging line to check lookupNama value
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
        console.log(
          'showError.label',
          label,
          showError.label,
          inputValue,
          lookupNama
        );
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
    <Popover open={open} onOpenChange={() => ({})}>
      <PopoverTrigger asChild>
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
                // if (e.target.value.trim() !== '') {
                //   setOpen(true);
                // }
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
      </PopoverTrigger>
      <PopoverContent
        className="h-fit border border-blue-500 p-0 shadow-none backdrop-blur-none"
        side="bottom"
        align="start"
        sideOffset={-1} // Atur offset ke 0 agar tidak ada jarak
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
                      ? `h-[290px]`
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
                    rowHeight={30}
                    headerRowHeight={singleColumn ? 0 : 70}
                    className="rdg-light fill-grid"
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
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
