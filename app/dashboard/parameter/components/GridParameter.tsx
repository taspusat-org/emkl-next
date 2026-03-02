'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import 'react-data-grid/lib/styles.scss';
import DataGrid, {
  CellClickArgs,
  CellKeyDownArgs,
  Column,
  DataGridHandle
} from 'react-data-grid';

import { ImSpinner2 } from 'react-icons/im';
import ActionButton from '@/components/custom-ui/ActionButton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from 'react-query';
import { api, api2 } from '@/lib/utils/AxiosInstance';
import { toast } from '@/hooks/use-toast';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import {
  ParameterInput,
  parameterSchema
} from '@/lib/validations/parameter.schema';
import {
  useCreateParameter,
  useDeleteParameter,
  useGetAllParameter,
  useUpdateParameter
} from '@/lib/server/useParameter';
import { useDispatch } from 'react-redux';
import { setLookUpValue } from '@/lib/store/searchLookupSlice/searchLookupSlice';
import FormParameter from './FormParameter';
import { Input } from '@/components/ui/input';
import {
  FaFileExport,
  FaPrint,
  FaSort,
  FaSortDown,
  FaSortUp,
  FaTimes
} from 'react-icons/fa';
import {
  exportParameterBySelectFn,
  exportParameterFn,
  getParameterFn,
  reportParameterBySelectFn
} from '@/lib/apis/parameter.api';
import { setReportData } from '@/lib/store/reportSlice/reportSlice';
import { HiDocument } from 'react-icons/hi2';
import { useAlert } from '@/lib/store/client/useAlert';
import { Checkbox } from '@/components/ui/checkbox';
import { BsPrinterFill } from 'react-icons/bs';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import IcClose from '@/public/image/x.svg';
import DraggableColumn from '@/components/custom-ui/DraggableColumns';
import { highlightText } from '@/components/custom-ui/HighlightText';
import { useTheme } from 'next-themes';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  handleContextMenu,
  loadGridConfig,
  resetGridConfig,
  saveGridConfig
} from '@/lib/utils';
import { EmptyRowsRenderer } from '@/components/EmptyRows';
import { LoadRowsRenderer } from '@/components/LoadRows';

export interface Row {
  id: number; // ID unik (primary key)
  grp: string | null; // Grup, bisa null
  subgrp: string | null; // Sub Grup, bisa null
  kelompok: string | null; // Kelompok, bisa null
  text: string | null; // Nama Parameter, bisa null
  memo: Record<string, string> | null; // Memo sebagai JSON object
  type: number | null; // Tipe angka, bisa null
  default: string | null; // Nilai default, bisa null
  modifiedby: string | null; // Nama pengubah, bisa null
  info: string | null; // Informasi tambahan, bisa null
  created_at: Date; // Tanggal dibuat
  updated_at: Date; // Tanggal diperbarui
}
interface Filter {
  page: number;
  limit: number;
  search: string;
  filters: {
    grp: string;
    subgrp: string;
    text: string;
    created_at: string;
    updated_at: string;
  };
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

const GridParameter = () => {
  const { theme, resolvedTheme } = useTheme();
  const isDark = theme === 'dark' || resolvedTheme === 'dark';
  const [dataGridKey, setDataGridKey] = useState(0);
  const [isFilteringRows, setIsFilteringRows] = useState(false);
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [selectedCol, setSelectedCol] = useState<number>(0);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [popOver, setPopOver] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState(1);
  const [addMode, setAddMode] = useState<boolean>(false);
  const [isDataUpdated, setIsDataUpdated] = useState(false);

  const dispatch = useDispatch();
  const { mutate: createParameter, isLoading: isLoadingCreate } =
    useCreateParameter();
  const { mutate: updateParameter, isLoading: isLoadingUpdate } =
    useUpdateParameter();
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingManually, setIsFetchingManually] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);

  const { mutate: deleteParameter, isLoading: isLoadingDelete } =
    useDeleteParameter();
  const [viewMode, setViewMode] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [rows, setRows] = useState<Row[]>([]);
  const lookupvalue = useSelector((state: RootState) => state.search.value);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [columnsWidth, setColumnsWidth] = useState<{ [key: string]: number }>(
    {}
  );
  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const resizeDebounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [fetchedPages, setFetchedPages] = useState<Set<number>>(new Set([1]));
  const [deleteMode, setDeleteMode] = useState<boolean>(false);
  const [columnsOrder, setColumnsOrder] = useState<readonly number[]>([]);
  const [checkedRows, setCheckedRows] = useState<Set<number>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const { alert } = useAlert();
  const forms = useForm<ParameterInput>({
    resolver: zodResolver(parameterSchema), // Resolver validasi Zod
    mode: 'onSubmit', // Validasi saat submit
    defaultValues: {
      grp: '', // Default string kosong
      subgrp: '',
      kelompok: '',
      text: '',
      memo: {},
      type: '', // Gunakan undefined sebagai default
      default: '',
      info: ''
    }
  });
  const [filters, setFilters] = useState<Filter>({
    page: 1,
    limit: 20,
    filters: {
      grp: '',
      subgrp: '',
      text: '',
      created_at: '',
      updated_at: ''
    },
    search: '',
    sortBy: 'grp',
    sortDirection: 'asc'
  });
  const { data: allParameter, isLoading: isLoadingParameter } =
    useGetAllParameter({
      ...filters,
      page: currentPage
    });
  const inputColRefs = {
    grp: useRef<HTMLInputElement>(null),
    subgrp: useRef<HTMLInputElement>(null),
    text: useRef<HTMLInputElement>(null),
    created_at: useRef<HTMLInputElement>(null),
    updated_at: useRef<HTMLInputElement>(null)
  };
  const handleColumnFilterChange = (
    colKey: keyof Filter['filters'],
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        [colKey]: value
      },
      search: '',
      page: 1
    }));
    setCurrentPage(1);
    setFetchedPages(new Set([1]));
    setInputValue('');
    setCheckedRows(new Set());
    setIsAllSelected(false);
    setTimeout(() => {
      gridRef?.current?.selectCell({ rowIdx: 0, idx: 1 });
    }, 100);
    setTimeout(() => {
      const ref = inputColRefs[colKey]?.current;
      if (ref) {
        ref.focus();
      }
    }, 200);
    setSelectedRow(0);
  };

  const gridRef = useRef<DataGridHandle>(null);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setInputValue(searchValue);
    setCurrentPage(1);
    setFilters((prev) => ({
      ...prev,
      filters: {
        grp: '',
        subgrp: '',
        created_at: '',
        updated_at: '',
        text: ''
      },
      search: searchValue,
      page: 1
    }));
    setCheckedRows(new Set());
    setIsAllSelected(false);
    setTimeout(() => {
      gridRef?.current?.selectCell({ rowIdx: 0, idx: 1 });
    }, 200);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 300);

    setSelectedRow(0);
    setCurrentPage(1);
    setRows([]);
  };

  const handleClearInput = () => {
    setFilters((prev) => ({
      ...prev,
      filters: {
        ...prev.filters
      },
      search: '',
      page: 1
    }));
    setInputValue('');
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
      const allIds = rows.map((row) => row.id);
      setCheckedRows(new Set(allIds));
    }
    setIsAllSelected(!isAllSelected);
  };

  const handleFilterRows = (val: string) => {
    setIsFilteringRows(true);
    // setLocalSelectedValue(val);
    // onChange?.(val);
    setTimeout(() => {
      setIsFilteringRows(false);
    }, 1000);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      contextMenuRef.current &&
      !contextMenuRef.current.contains(event.target as Node)
    ) {
      setContextMenu(null);
    }
  };

  const columns = useMemo((): Column<Row>[] => {
    return [
      {
        key: 'nomor',
        name: 'NO',
        width: 50,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full flex-col items-center gap-1">
            <div className="headers-cell h-[50%] items-center justify-center text-center">
              <p className="text-sm font-normal">No.</p>
            </div>

            <div
              className="flex h-[50%] w-full cursor-pointer items-center justify-center"
              onClick={() => {
                setFilters({
                  ...filters,
                  search: '',
                  filters: {
                    grp: '',
                    subgrp: '',
                    text: '',
                    created_at: '',
                    updated_at: ''
                  }
                }),
                  setInputValue('');
                setTimeout(() => {
                  gridRef?.current?.selectCell({ rowIdx: 0, idx: 1 });
                }, 0);
              }}
            >
              <FaTimes className="bg-red-500 text-white" />
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const rowIndex = rows.findIndex(
            (row) => Number(row.id) === Number(props.row.id)
          );
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
        resizable: true,
        draggable: true,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onContextMenu={(event) =>
                setContextMenu(handleContextMenu(event))
              }
            ></div>
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
              checked={checkedRows.has(row.id)}
              onCheckedChange={() => handleRowSelect(row.id)}
              id={`row-checkbox-${row.id}`}
            />
          </div>
        )
      },
      {
        key: 'grp',
        name: 'GROUP',
        width: 150,
        resizable: true,
        draggable: true,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('grp')}
              onContextMenu={(event) =>
                setContextMenu(handleContextMenu(event))
              }
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'grp' ? 'font-bold' : 'font-normal'
                }`}
              >
                GROUP
              </p>
              <div className="ml-2">
                {filters.sortBy === 'grp' && filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'grp' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="font-bold" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>
            <div className="relative h-[50%] w-full px-1">
              <Input
                ref={inputColRefs.grp}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.grp || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleColumnFilterChange('grp', value);
                }}
              />
              {filters.filters.grp && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('grp', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.grp || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.grp || '', // Ganti dengan string kosong jika null
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'subgrp',
        name: 'SUB GROUP',
        width: 150,
        resizable: true,
        draggable: true,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('subgrp')}
              onContextMenu={(event) =>
                setContextMenu(handleContextMenu(event))
              }
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'subgrp' ? 'font-bold' : 'font-normal'
                }`}
              >
                SUB GROUP
              </p>
              <div className="ml-2">
                {filters.sortBy === 'subgrp' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'subgrp' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="font-bold" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>
            <div className="relative h-[50%] w-full px-1">
              <Input
                ref={inputColRefs.subgrp}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.subgrp || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleColumnFilterChange('subgrp', value);
                }}
              />
              {filters.filters.subgrp && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('subgrp', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.subgrp || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.subgrp || '', // Ganti dengan string kosong jika null
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'text',
        name: 'TEXT',
        width: 150,
        resizable: true,
        draggable: true,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('text')}
              onContextMenu={(event) =>
                setContextMenu(handleContextMenu(event))
              }
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'text' ? 'font-bold' : 'font-normal'
                }`}
              >
                text
              </p>
              <div className="ml-2">
                {filters.sortBy === 'text' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'text' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="font-bold" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>
            <div className="relative h-[50%] w-full px-1">
              <Input
                ref={inputColRefs.text}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.text || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleColumnFilterChange('text', value);
                }}
              />
              {filters.filters.text && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('text', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.text || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.text || '', // Ganti dengan string kosong jika null
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'created_at',
        name: 'Created At',
        resizable: true,
        draggable: true,
        headerCellClass: 'column-headers',
        width: 150,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('created_at')}
              onContextMenu={(event) =>
                setContextMenu(handleContextMenu(event))
              }
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'created_at' ? 'font-bold' : 'font-normal'
                }`}
              >
                Created At
              </p>
              <div className="ml-2">
                {filters.sortBy === 'created_at' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'created_at' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="font-bold" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>

            <div className="relative h-[50%] w-full px-1">
              <Input
                ref={inputColRefs.created_at}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.created_at || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleColumnFilterChange('created_at', value);
                }}
              />
              {filters.filters.created_at && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('created_at', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.created_at || '';
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.created_at || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'updated_at',
        name: 'Updated At',
        resizable: true,
        draggable: true,
        headerCellClass: 'column-headers',

        width: 150,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('updated_at')}
              onContextMenu={(event) =>
                setContextMenu(handleContextMenu(event))
              }
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'updated_at' ? 'font-bold' : 'font-normal'
                }`}
              >
                Updated At
              </p>
              <div className="ml-2">
                {filters.sortBy === 'updated_at' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'updated_at' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="font-bold" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>

            <div className="relative h-[50%] w-full px-1">
              <Input
                ref={inputColRefs.updated_at}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.updated_at || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleColumnFilterChange('updated_at', value);
                }}
              />
              {filters.filters.updated_at && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('updated_at', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.updated_at || '';
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.updated_at || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      }
    ];
  }, [filters, rows, checkedRows]);

  const orderedColumns = useMemo(() => {
    if (Array.isArray(columnsOrder) && columnsOrder.length > 0) {
      // filter key columns dengan key yg ada di columnsWidth
      const filteredColumns = columns.filter((col) =>
        Object.prototype.hasOwnProperty.call(columnsWidth, col.key)
      );
      // Mapping dan filter untuk menghindari undefined
      return columnsOrder
        .map((orderIndex) => filteredColumns[orderIndex])
        .filter((col) => col !== undefined);
    }
    return columns;
  }, [columns, columnsOrder]);

  const finalColumns = useMemo(() => {
    return orderedColumns.map((col) => ({
      ...col,
      width: columnsWidth[col.key] ?? col.width
    }));
  }, [orderedColumns, columnsWidth]);

  function isAtBottom(event: React.UIEvent<HTMLDivElement>): boolean {
    const { currentTarget } = event;
    if (!currentTarget) return false;

    return (
      currentTarget.scrollTop + currentTarget.clientHeight >=
      currentTarget.scrollHeight - 2
    );
  }

  function isAtTop({ currentTarget }: React.UIEvent<HTMLDivElement>): boolean {
    return currentTarget.scrollTop <= 10;
  }
  async function handleScroll(event: React.UIEvent<HTMLDivElement>) {
    if (isLoadingParameter || !hasMore || rows.length === 0) return;

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
        setIsAllSelected(false);
      }
    }

    if (isAtTop(event)) {
      const prevPage = findUnfetchedPage(-1);
      if (prevPage && !fetchedPages.has(prevPage)) {
        setCurrentPage(prevPage);
      }
    }
  }
  document.querySelectorAll('.column-headers').forEach((element) => {
    element.classList.remove('c1kqdw7y7-0-0-beta-47');
  });
  function handleCellClick(args: CellClickArgs<Row>) {
    const clickedRow = args.row;
    const rowIndex = rows.findIndex((r) => r.id === clickedRow.id);
    if (rowIndex !== -1) {
      setSelectedRow(rowIndex);
    }
  }
  async function handleKeyDown(
    args: CellKeyDownArgs<Row>,
    event: React.KeyboardEvent
  ) {
    const visibleRowCount = 10;
    const firstDataRowIndex = 0;
    const selectedRowId = rows[selectedRow]?.id;

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

        const nextRow = Math.min(prev + visibleRowCount - 2, rows.length - 1);
        return nextRow;
      });
    } else if (event.key === 'PageUp') {
      setSelectedRow((prev) => {
        if (prev === null) return firstDataRowIndex;

        const newRow = Math.max(prev - visibleRowCount + 2, firstDataRowIndex);
        return newRow;
      });
    } else if (event.key === ' ') {
      // Handle spacebar keydown to toggle row selection
      if (selectedRowId !== undefined) {
        handleRowSelect(selectedRowId); // Toggling the selection of the row
      }
    }
  }
  const onSuccess = async (indexOnPage: any, pageNumber: any) => {
    try {
      forms.reset();
      setPopOver(false);
      setIsFetchingManually(true);
      if (!deleteMode) {
        const response = await api2.get(`/redis/get/parameter-allItems`);

        if (JSON.stringify(response.data) !== JSON.stringify(rows)) {
          setRows(response.data);
          setIsDataUpdated(true);
          setCurrentPage(pageNumber);
          setFetchedPages(new Set([pageNumber]));
          setSelectedRow(indexOnPage);
          setTimeout(() => {
            gridRef?.current?.selectCell({
              rowIdx: indexOnPage,
              idx: 1
            });
          }, 150);
        }
      }
      setIsFetchingManually(false);
      setIsDataUpdated(false);
    } catch (error) {
      console.error('Error during onSuccess:', error);
      setIsFetchingManually(false);
      setIsDataUpdated(false);
    }
  };

  const onSubmit = async (values: ParameterInput) => {
    const selectedRowId = rows[selectedRow]?.id;
    if (deleteMode === true && editMode === false) {
      await deleteParameter(selectedRowId, {
        onSuccess: () => {
          setPopOver(false); // Close popover
          setRows((prevRows) =>
            prevRows.filter((row) => row.id !== selectedRowId)
          );
        }
      });
      return; // Pastikan untuk keluar setelah delete
    }
    if (editMode === false) {
      const newOrder = await createParameter(
        {
          ...values,
          ...filters // Kirim filter ke body/payload
        },
        {
          onSuccess: (data) => onSuccess(data.itemIndex, data.pageNumber)
        }
      );

      if (newOrder !== undefined && newOrder !== null) {
      }
      return;
    }
    if (selectedRowId && deleteMode === false) {
      await updateParameter(
        {
          id: selectedRowId as unknown as string,
          fields: { ...values, ...filters }
        },
        { onSuccess: (data) => onSuccess(data.itemIndex, data.pageNumber) }
      );
    }
  };

  const onColumnResize = (index: number, width: number) => {
    const columnKey = columns[columnsOrder[index]].key; // 1) Dapatkan key kolom yang di-resize

    const newWidthMap = { ...columnsWidth, [columnKey]: width }; // 2) Update state width seketika (biar kolom langsung responsif)
    setColumnsWidth(newWidthMap);

    if (resizeDebounceTimeout.current) {
      // 3) Bersihkan timeout sebelumnya agar tidak menumpuk
      clearTimeout(resizeDebounceTimeout.current);
    }

    // 4) Set ulang timer: hanya ketika 300ms sejak resize terakhir berlalu,
    //    saveGridConfig akan dipanggil
    resizeDebounceTimeout.current = setTimeout(() => {
      saveGridConfig(user.id, 'GridParameter', [...columnsOrder], newWidthMap);
    }, 300);
  };

  const onColumnsReorder = (sourceKey: string, targetKey: string) => {
    setColumnsOrder((prevOrder) => {
      const sourceIndex = prevOrder.findIndex(
        (index) => columns[index].key === sourceKey
      );
      const targetIndex = prevOrder.findIndex(
        (index) => columns[index].key === targetKey
      );

      const newOrder = [...prevOrder];
      newOrder.splice(targetIndex, 0, newOrder.splice(sourceIndex, 1)[0]);

      saveGridConfig(user.id, 'GridParameter', [...newOrder], columnsWidth);
      return newOrder;
    });
  };

  const handleEdit = () => {
    if (selectedRow !== null) {
      setPopOver(true); // Tampilkan modal atau popover
      setDeleteMode(false); // Nonaktifkan mode delete
      setAddMode(false); // Nonaktifkan mode delete
      setEditMode(true); // Aktifkan mode edit
    }
  };
  const handleDelete = () => {
    if (selectedRow !== null) {
      setPopOver(true);
      setEditMode(false);
      setAddMode(false); // Nonaktifkan mode delete
      setDeleteMode(true);
    }
  };
  const handleReport = async () => {
    const { page, limit, ...filtersWithoutLimit } = filters;
    const response = await getParameterFn(filtersWithoutLimit);
    if (response.data === null || response.data.length === 0) {
      alert({
        title: 'DATA TIDAK TERSEDIA!',
        variant: 'danger',
        submitText: 'ok'
      });
    } else {
      const reportRows = response.data.map((row) => ({
        ...row,
        judullaporan: 'Laporan Parameter',
        usercetak: user.username,
        tglcetak: new Date().toLocaleDateString(),
        judul: 'PT.TRANSPORINDO AGUNG SEJAHTERA'
      }));
      dispatch(setReportData(reportRows));
      window.open('/reports/parameter', '_blank');
    }
  };

  const handleReportBySelect = async () => {
    if (checkedRows.size === 0) {
      alert({
        title: 'PILIH DATA YANG INGIN DI CETAK!',
        variant: 'danger',
        submitText: 'OK'
      });
      return; // Stop execution if no rows are selected
    }

    const jsonCheckedRows = Array.from(checkedRows).map((id) => ({ id }));
    try {
      const response = await reportParameterBySelectFn(jsonCheckedRows);
      const reportRows = response.map((row: any) => ({
        ...row,
        judullaporan: 'Laporan Parameter',
        usercetak: user.username,
        tglcetak: new Date().toLocaleDateString(),
        judul: 'PT.TRANSPORINDO AGUNG SEJAHTERA'
      }));
      dispatch(setReportData(reportRows));
      window.open('/reports/parameter', '_blank');
    } catch (error) {
      console.error('Error generating report:', error);
      alert({
        title: 'Failed to generate the report. Please try again.',
        variant: 'danger',
        submitText: 'OK'
      });
    }
  };

  const handleView = () => {
    if (selectedRow !== null) {
      setPopOver(true);
      setDeleteMode(true);
      setAddMode(false); // Nonaktifkan mode delete
      setEditMode(false);
      setViewMode(true);
    }
  };
  const handleExport = async () => {
    try {
      const { page, limit, ...filtersWithoutLimit } = filters;

      const response = await exportParameterFn(filtersWithoutLimit); // Kirim data tanpa pagination

      // Buat link untuk mendownload file
      const link = document.createElement('a');
      const url = window.URL.createObjectURL(response);
      link.href = url;
      link.download = `laporan_parameter${Date.now()}.xlsx`; // Nama file yang diunduh
      link.click(); // Trigger download

      // Revoke URL setelah download
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting user data:', error);
    }
  };

  const handleExportBySelect = async () => {
    if (checkedRows.size === 0) {
      alert({
        title: 'PILIH DATA YANG INGIN DI CETAK!',
        variant: 'danger',
        submitText: 'OK'
      });
      return; // Stop execution if no rows are selected
    }

    // Mengubah checkedRows menjadi format JSON
    const jsonCheckedRows = Array.from(checkedRows).map((id) => ({ id }));
    try {
      const response = await exportParameterBySelectFn(jsonCheckedRows);

      // Buat link untuk mendownload file
      const link = document.createElement('a');
      const url = window.URL.createObjectURL(response);
      link.href = url;
      link.download = `laporan_parameter${Date.now()}.xlsx`; // Nama file yang diunduh
      link.click(); // Trigger download

      // Revoke URL setelah download
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting parameter data:', error);
      alert({
        title: 'Failed to generate the export. Please try again.',
        variant: 'danger',
        submitText: 'ok'
      });
    }
  };

  function getRowClass(row: Row) {
    const rowIndex = rows.findIndex((r) => r.id === row.id);
    return rowIndex === selectedRow ? 'selected-row' : '';
  }

  function rowKeyGetter(row: Row) {
    return row.id;
  }

  const handleClose = () => {
    setPopOver(false);
    setEditMode(false);
    setViewMode(false);
    setDeleteMode(false);
    forms.reset();
  };
  const handleAdd = async () => {
    try {
      setEditMode(false);
      setDeleteMode(false);
      setAddMode(true); // Nonaktifkan mode delete

      setPopOver(true);
      forms.reset();

      //   forms.reset();
    } catch (error) {
      console.error('Error syncing ACOS:', error);
    }
  };

  useEffect(() => {
    loadGridConfig(
      user.id,
      'GridParameter',
      columns,
      setColumnsOrder,
      setColumnsWidth
    );
  }, []);

  useEffect(() => {
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (
      selectedRow !== null &&
      rows.length > 0 &&
      addMode === false // Only fill the form if not in addMode
    ) {
      const rowData = rows[selectedRow];
      forms.setValue('grp', rowData.grp || ''); // Jika null, set ke string kosong
      forms.setValue('subgrp', rowData.subgrp || '');
      forms.setValue('kelompok', rowData.kelompok || '');
      forms.setValue('text', rowData.text || '');
      forms.setValue(
        'memo',
        rowData.memo ? JSON.parse(rowData.memo as unknown as string) : {}
      );

      forms.setValue('type', String(rowData.type)); // Null jika type tidak ada
      forms.setValue('default', rowData.default || '');
      forms.setValue('info', rowData.info || '');
      forms.setValue('statusaktif_text', rowData.text);
    } else if (addMode === true) {
      // If in addMode, ensure the form values are cleared
      forms.reset(); // Reset the form to keep it empty when in add mode
    }
  }, [forms, selectedRow, rows, addMode, editMode, deleteMode, viewMode]);
  useEffect(() => {
    if (!allParameter || isDataUpdated) return;

    const newRows = allParameter.data || [];

    setRows((prevRows) => {
      // Reset data jika filter berubah (halaman pertama)
      if (currentPage === 1) {
        return newRows;
      }

      // Tambahkan data baru ke bawah untuk infinite scroll
      if (!fetchedPages.has(currentPage)) {
        return [...prevRows, ...newRows];
      }

      return prevRows;
    });

    if (allParameter.pagination.totalPages) {
      setTotalPages(allParameter.pagination.totalPages);
    }

    setHasMore(newRows.length === filters.limit);
    setFetchedPages((prev) => new Set(prev).add(currentPage));
  }, [allParameter, currentPage, filters, isFetchingManually, isDataUpdated]);
  useEffect(() => {
    if (isFirstLoad && gridRef.current && rows.length > 0) {
      setSelectedRow(0);
      gridRef.current.selectCell({ rowIdx: 0, idx: 1 });
      setIsFirstLoad(false);
    }
  }, [rows, isFirstLoad]);
  useEffect(() => {
    if (lookupvalue) {
      forms.setValue('type', Number(lookupvalue.id));
    }
  }, [lookupvalue]);
  useEffect(() => {
    const headerCells = document.querySelectorAll('.rdg-header-row .rdg-cell');
    headerCells.forEach((cell) => {
      cell.setAttribute('tabindex', '-1');
    });
  }, []);
  useEffect(() => {
    const preventScrollOnSpace = (event: KeyboardEvent) => {
      // Cek apakah target yang sedang fokus adalah input atau textarea
      if (
        event.key === ' ' &&
        !(
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement
        )
      ) {
        event.preventDefault(); // Mencegah scroll pada tombol space jika bukan di input
      }
    };

    // Menambahkan event listener saat komponen di-mount
    document.addEventListener('keydown', preventScrollOnSpace);

    // Menghapus event listener saat komponen di-unmount
    return () => {
      document.removeEventListener('keydown', preventScrollOnSpace);
    };
  }, []);
  return (
    <div className={`flex h-[100%] w-full justify-center`}>
      <div className="flex h-[100%] w-full flex-col rounded-sm border border-border bg-background">
        <div className="flex h-[38px] w-full flex-row items-center justify-between rounded-t-sm border-b border-border bg-background-grid-header px-2">
          <div className="flex flex-row items-center">
            <label htmlFor="" className="text-xs">
              SEARCH :
            </label>
            <div className="relative flex w-[200px] flex-row items-center">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => {
                  handleInputChange(e);
                }}
                className="m-2 h-[28px] w-[200px] rounded-sm"
                placeholder="Type to search..."
              />
              {(filters.search !== '' || inputValue !== '') && (
                <Button
                  type="button"
                  variant="ghost"
                  className="absolute right-2 text-gray-500 hover:bg-transparent"
                  onClick={handleClearInput}
                >
                  <Image src={IcClose} width={15} height={15} alt="close" />
                </Button>
              )}
            </div>
          </div>
          <div className="flex flex-row items-center">
            <div>
              <Select
                defaultValue="ALL ROWS"
                onValueChange={handleFilterRows}
                disabled={isFilteringRows}
              >
                <SelectTrigger className="filter-select z-[999999] h-8 w-full cursor-pointer overflow-hidden rounded-sm border border-input-border bg-background-input p-2 text-xs font-thin">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectGroup>
                    <SelectItem
                      className="text=xs cursor-pointer"
                      value="ALL ROWS"
                    >
                      <p className="text-sm font-normal">ALL ROWS</p>
                    </SelectItem>
                    <SelectItem
                      className="text=xs cursor-pointer"
                      value="CHECKED ROWS"
                    >
                      <p className="text-sm font-normal">CHECKED ROWS</p>
                    </SelectItem>
                    <SelectItem
                      className="text=xs cursor-pointer"
                      value="UNCHECKED ROWS"
                    >
                      <p className="text-sm font-normal">UNCHECKED ROWS</p>
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <DraggableColumn
              defaultColumns={columns}
              saveColumns={finalColumns}
              userId={user.id}
              gridName="GridParameter"
              setColumnsOrder={setColumnsOrder}
              setColumnsWidth={setColumnsWidth}
              onReset={() => {
                setDataGridKey((prevKey) => prevKey + 1);
                gridRef?.current?.selectCell({ rowIdx: 0, idx: 0 });
              }}
            />
          </div>
        </div>
        <DataGrid
          key={dataGridKey}
          ref={gridRef}
          columns={finalColumns}
          rows={rows}
          rowKeyGetter={rowKeyGetter}
          onScroll={handleScroll}
          rowClass={getRowClass}
          onCellClick={handleCellClick}
          headerRowHeight={70}
          rowHeight={30}
          onSelectedCellChange={(args) => {
            handleCellClick({ row: args.row });
          }}
          className={`${isDark ? 'rdg-dark' : 'rdg-light'} fill-grid`}
          enableVirtualization={false}
          onColumnsReorder={onColumnsReorder}
          // onCellKeyDown={handleKeyDown}
          renderers={{
            noRowsFallback: <EmptyRowsRenderer />
          }}
        />
        <div className="flex flex-row justify-between border border-x-0 border-b-0 border-border bg-background-grid-header p-2">
          <ActionButton
            module="PARAMETER"
            onAdd={handleAdd}
            checkedRows={checkedRows}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onView={handleView}
            rowsLength={rows.length}
            totalItems={allParameter ? allParameter.pagination.totalItems : 0}
            dropdownMenus={[
              {
                label: 'Report',
                icon: <FaPrint />,
                className: 'bg-cyan-500 hover:bg-cyan-700',
                actions: [
                  {
                    label: 'REPORT ALL',
                    onClick: () => handleReport(),
                    className: 'bg-cyan-500 hover:bg-cyan-700'
                  },
                  {
                    label: 'REPORT BY SELECT',
                    onClick: () => handleReportBySelect(),
                    className: 'bg-cyan-500 hover:bg-cyan-700'
                  }
                ]
              },
              {
                label: 'Export',
                icon: <FaFileExport />,
                className: 'bg-green-600 hover:bg-green-700',
                actions: [
                  {
                    label: 'EXPORT ALL',
                    onClick: () => handleExport(),
                    className: 'bg-green-600 hover:bg-green-700'
                  },
                  {
                    label: 'EXPORT BY SELECT',
                    onClick: () => handleExportBySelect(),
                    className: 'bg-green-600 hover:bg-green-700'
                  }
                ]
              }
            ]}
          />
          {isLoadingParameter ? <LoadRowsRenderer /> : null}
          {contextMenu && (
            <div
              ref={contextMenuRef}
              className="bg-background-input"
              style={{
                position: 'fixed', // Fixed agar koordinat sesuai dengan viewport
                top: contextMenu.y, // Pastikan contextMenu.y berasal dari event.clientY
                left: contextMenu.x, // Pastikan contextMenu.x berasal dari event.clientX
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                padding: '8px',
                borderRadius: '4px',
                zIndex: 1000
              }}
            >
              <Button
                variant="default"
                onClick={() => {
                  resetGridConfig(
                    user.id,
                    'GridParameter',
                    columns,
                    setColumnsOrder,
                    setColumnsWidth
                  );
                  setContextMenu(null);
                  setDataGridKey((prevKey) => prevKey + 1);
                  gridRef?.current?.selectCell({ rowIdx: 0, idx: 0 });
                }}
              >
                Reset
              </Button>
            </div>
          )}
        </div>
      </div>
      <FormParameter
        popOver={popOver}
        handleClose={handleClose}
        setPopOver={setPopOver}
        forms={forms}
        viewMode={viewMode}
        deleteMode={deleteMode}
        onSubmit={forms.handleSubmit(onSubmit)}
        isLoadingCreate={isLoadingCreate || isLoadingUpdate || isLoadingDelete}
      />
    </div>
  );
};

export default GridParameter;
