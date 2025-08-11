import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  setOpenName,
  setType
} from '@/lib/store/lookupSlice/lookupSlice';
import { FormLabel } from '../ui/form';
import IcClose from '@/public/image/x.svg';
import Image from 'next/image';
import { REQUIRED_FIELD } from '@/constants/validation';
import { setSelectLookup } from '@/lib/store/selectLookupSlice/selectLookupSlice';
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
  inputLookupValue,
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
  allowedFilterShowAllFirst = false,
  linkTo,
  linkValue,
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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return; // Prevent input change if disabled
    const searchValue = e.target.value;
    setInputValue(searchValue);

    // Debounce logic for filter update
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current); // Clear previous debounce timeout
    }

    debounceTimerRef.current = setTimeout(() => {
      if (type !== 'local' && endpoint) {
        // Handle the case for fetching from API
        setFilters((prev) => ({
          ...prev,
          filters: {}, // Clear previous filters (optional)
          search: searchValue, // Set the search term for API data
          page: 1
        }));
        dispatch(setOpenName(label || '')); // Update the open name in Redux
        setFiltering(true);
      } else {
        // Handle the case for local data
        setFilters((prev) => ({
          ...prev,
          search: searchValue, // Set search term for local data filtering
          filters: {}, // Clear filters if necessary
          page: 1 // Optionally reset pagination
        }));
        dispatch(setOpenName(label || '')); // Update the open name in Redux
        setFiltering(true);

        // Filter the local data based on the search term
        const filteredRows =
          data?.filter((row: Row) =>
            Object.values(row).some((value) =>
              String(value).toLowerCase().includes(searchValue.toLowerCase())
            )
          ) || [];
        setRows(filteredRows); // Set filtered rows based on local data
      }

      // Focus logic for better UX
      setTimeout(() => {
        setSelectedRow(0); // Select the first row
        gridRef?.current?.selectCell({ rowIdx: 0, idx: 0 }); // Select the first cell in the first row
      }, 250);

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 350);
    }, 300); // Delay for debounce (e.g., 300ms after the last keystroke)
  };

  const handleColumnFilterChange = (
    colKey: keyof Filter['filters'],
    value: string
  ) => {
    if (disabled) return; // Prevent filter change if disabled

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
      // Handle the case for fetching from API if 'json' type
      if (type === 'json' && endpoint) {
        setRows([]); // Optionally clear rows before making API request

        // Fetch data from API (you can add specific API call here)
        setTimeout(() => {
          dispatch(setOpenName(label || '')); // Update Redux state
        }, 100);
      } else {
        // Handle the case for local data filtering
        const filteredRows =
          data?.filter((row: Row) =>
            String(row[colKey]).toLowerCase().includes(value.toLowerCase())
          ) || [];

        setRows(filteredRows); // Set filtered rows based on local data
      }

      // Focus logic for better UX
      setTimeout(() => {
        setSelectedRow(0); // Select the first row
        gridRef?.current?.selectCell({ rowIdx: 0, idx: 0 }); // Select the first cell in the first row
      }, 250);
    }, 300); // Debounce delay of 300ms after the last keystroke
  };

  const gridRef = useRef<DataGridHandle | null>(null);
  function highlightText(
    text: string | number | null | undefined,
    search: string,
    columnFilter: string = ''
  ) {
    const textValue = text !== null && text !== undefined ? String(text) : ''; // Ensure 0 is not treated as falsy
    if (!textValue) return textValue; // If the text is empty, return it as is

    if (!search.trim() && !columnFilter.trim()) return textValue; // If no search or filter, return text as is

    const combinedSearch = search + columnFilter; // Combine search and column filter

    // Create a case-insensitive regex to match the search and filter terms
    const regex = new RegExp(`(${combinedSearch})`, 'gi');

    // Split the text into an array of segments, where each segment is either the match or the rest of the text
    const segments = textValue.split(regex);

    // Map over each segment and wrap the matched segments with a span for highlighting
    return (
      <span className="text-xs">
        {segments.map((segment, index) =>
          regex.test(segment) ? (
            <span
              key={index}
              style={{ backgroundColor: 'yellow', fontSize: '11px' }}
            >
              {segment}
            </span>
          ) : (
            segment
          )
        )}
      </span>
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
      type === 'json' ? 300 : 150
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
    if (lookupValue) {
      lookupValue(dataToPost ? clickedRow[dataToPost] : clickedRow.id); // Pass the clickedRow.id to the parent component's form
    }
    if (onSelectRow) {
      onSelectRow(dataToPost ? clickedRow[dataToPost] : clickedRow.id); // Pass the clickedRow.id to the parent component's form
    } else {
      // Optionally call onSelectRow without value if you need to trigger something else
      onSelectRow?.(undefined); // Can call it without value if needed
    }
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
      //   type === 'json' ? 300 : 150
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
      //   type === 'json' ? 300 : 150
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
      if (lookupValue) {
        lookupValue(dataToPost ? clickedRow[dataToPost] : clickedRow.id); // Pass the clickedRow.id to the parent component's form
      }
      if (onSelectRow) {
        onSelectRow(dataToPost ? clickedRow[dataToPost] : clickedRow.id); // Pass the clickedRow.id to the parent component's form
      } else {
        // Optionally call onSelectRow without value if you need to trigger something else
        onSelectRow?.(undefined); // Can call it without value if needed
      }
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

  async function fetchRows(): Promise<Row[]> {
    try {
      const params: any = {
        page: currentPage,
        limit: filters.limit,
        search: filters.search || '',
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection
      };

      // Menambahkan filter tambahan (misalnya grp) dalam format query string terpisah
      if (filters.filters) {
        Object.entries(filters.filters).forEach(([key, value]) => {
          params[key] = value;
        });
      }

      // Jika filterby ada, tambahkan key dan value ke dalam filters.filters
      if (filterby) {
        Object.entries(filterby).forEach(([key, value]) => {
          params[key] = value; // Menambahkan nilai filterby ke dalam params
        });
      }
      const response = await api2.get(`/${endpoint}`, { params });
      if (response.data.pagination.totalPages) {
        setTotalPages(response.data.pagination.totalPages);
      }
      return response.data.data.map((item: any) => {
        // Inisialisasi row dengan id yang diambil dari item
        const row: Row = { id: item.id }; // Menambahkan id yang wajib ada
        if (item?.default && !lookupNama) {
          if (item.default === 'YA') {
            setInputValue(item.text);
            if (lookupValue) {
              lookupValue(item.id);
            }
            if (onSelectRow) {
              onSelectRow(item.id); // Pass the clickedRow.id to the parent component's form
            } else {
              // Optionally call onSelectRow without value if you need to trigger something else
              onSelectRow?.(undefined); // Can call it without value if needed
            }
          }
        }
        for (const [key, value] of Object.entries(item)) {
          // Mengisi kolom lainnya
          if (key !== 'id') {
            row[key] = value;
          }
        }
        return row;
      });
    } catch (error) {
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
      if (lookupValue) {
        lookupValue(dataToPost ? rowData[dataToPost] : rowData.id); // Pass the clickedRow.id to the parent component's form
      }
      if (onSelectRow) {
        onSelectRow(dataToPost ? rowData[dataToPost] : rowData.id); // Pass the clickedRow.id to the parent component's form
      } else {
        // Optionally call onSelectRow without value if you need to trigger something else
        onSelectRow?.(undefined); // Can call it without value if needed
      }
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
          type === 'json' ? 300 : 150
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
          type === 'json' ? 300 : 150
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
        type === 'json' ? 300 : 150
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
        type === 'json' ? 300 : 150
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
  //         type === 'json' ? 300 : 150
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
  //       type === 'json' ? 300 : 150
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
  //       type === 'json' ? 300 : 150
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
  useEffect(() => {
    setIsLoading(true);
    if (type !== 'local' && endpoint) {
      async function fetchData() {
        try {
          // Fetch the data from the API
          const newRows = await fetchRows();

          setRows((prevRows) => {
            // Reset rows if any filter changes (including pagination to page 1)
            if (currentPage === 1 || filters !== prevFilters) {
              setCurrentPage(1); // Reset currentPage to 1
              setFetchedPages(new Set([1])); // Reset fetchedPages to [1]
              return newRows; // Use the fetched new rows directly
            }

            // Add new rows at the bottom for infinite scroll if the current page wasn't fetched before
            if (!fetchedPages.has(currentPage)) {
              return [...prevRows, ...newRows];
            }

            return prevRows;
          });
          setPrevFilters(filters); // Update the previous filters for comparison
          setIsFirstLoad(false); // Set the first load state to false
        } catch (error) {
          console.error('Failed to fetch rows', error);
          setRows([]); // Clear the rows if an error occurs
        } finally {
          setIsLoading(false); // Turn off the loading state
        }
      }

      fetchData();
    } else {
      let filteredRows = data ? data : null;
      if (linkTo && linkValue) {
        filteredRows = data?.filter(
          (row: Row) => String(row[linkTo]) === String(linkValue)
        );
      }
      filteredRows =
        filteredRows?.filter((row: Row) =>
          Object.values(row).some((value) =>
            String(value).toLowerCase().includes(filters.search.toLowerCase())
          )
        ) || [];

      if (isdefault && !lookupNama && !deleteClicked) {
        if (isdefault === 'YA') {
          const defaultRow = data.find((row: any) => row.default === 'YA');
          if (defaultRow && !clicked) {
            setInputValue(defaultRow.text);
          } else {
            const rowData = rows[selectedRow];
            setInputValue(rowData.text);
          }
          if (lookupValue) {
            lookupValue(defaultRow.id);
          }
          if (onSelectRow) {
            onSelectRow(defaultRow.id); // Pass the clickedRow.id to the parent component's form
          } else {
            // Optionally call onSelectRow without value if you need to trigger something else
            onSelectRow?.(undefined); // Can call it without value if needed
          }
        }
      }

      setRows(filteredRows);
      setIsLoading(false); // Set loading to false if it's local data
    }
    // Fetch data if the type is 'json' and endpoint is provided
  }, [filters, currentPage, type, data, linkTo, linkValue]);

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
          setInputValue(rows[0][postData as string] || '');
          if (lookupValue) {
            lookupValue(rows[0][dataToPost as string] || ''); // Pass the clickedRow.id to the parent component's form
          }
          if (onSelectRow) {
            onSelectRow(rows[0][dataToPost as string] || ''); // Pass the clickedRow.id to the parent component's form
          } else {
            // Optionally call onSelectRow without value if you need to trigger something else
            onSelectRow?.(undefined); // Can call it without value if needed
          }
        }
      }
      if (rows.length === 0) {
        setInputValue('');
        setFilters({ ...filters, search: '', filters: {} });
        if (lookupValue) {
          lookupValue('');
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
    if (isSubmitClicked && required) {
      if (
        (showError.label?.toLowerCase() == label?.toLowerCase() &&
          (inputValue == '' || inputValue == null)) ||
        (showError.label?.toLowerCase() == label?.toLowerCase() &&
          (lookupNama == '' || inputValue == undefined))
      ) {
        // Jika kosong, set error menjadi true
        setShowError({ label: label ?? '', status: true });
      } else {
        // Jika ada nilai, set error menjadi false
        setShowError({ label: label ?? '', status: false });
      }
    }
  }, [required, isSubmitClicked, inputValue, lookupNama, label]);

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
          <p className="text-xs text-destructive">
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
                  className={`${rows.length > 0 ? `h-[290px]` : 'h-[30px]'}`}
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
                    headerRowHeight={singleColumn || rows.length <= 0 ? 0 : 70}
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
