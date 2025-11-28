'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import 'react-data-grid/lib/styles.scss';
import DataGrid, {
  CellClickArgs,
  CellKeyDownArgs,
  Column,
  DataGridHandle,
  renderHeaderCell
} from 'react-data-grid';
import {
  FaSort,
  FaSortUp,
  FaSortDown,
  FaTimes,
  FaPrint,
  FaFileExport
} from 'react-icons/fa';

import { ImSpinner2 } from 'react-icons/im';
import ActionButton from '@/components/custom-ui/ActionButton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { useDispatch } from 'react-redux';
import { setLookUpValue } from '@/lib/store/searchLookupSlice/searchLookupSlice';
import FormError from './FormError';
import { ErrorInput, errorSchema } from '@/lib/validations/error.validation';
import {
  useCreateError,
  useDeleteError,
  useGetAllError,
  useUpdateError
} from '@/lib/server/useError';

import { Input } from '@/components/ui/input';
import { api, api2 } from '@/lib/utils/AxiosInstance';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  exportErrorBySelectFn,
  exportErrorFn,
  getErrorFn,
  getErrorReportFn,
  reportErrorBySelectFn
} from '@/lib/apis/error.api';
import { setReportData } from '@/lib/store/reportSlice/reportSlice';
import { HiDocument } from 'react-icons/hi2';
import { useAlert } from '@/lib/store/client/useAlert';
import { Checkbox } from '@/components/ui/checkbox';
import { setRoleacl } from '@/lib/store/roleaclSlice/roleaclSlice';
import { IRole } from '@/lib/types/role.type';
import Image from 'next/image';
import IcClose from '@/public/image/x.svg';
import { Button } from '@/components/ui/button';

export interface Row {
  id: number;
  statusaktif: number;
  kode: string;
  ket: string;
  modifiedby: string;
}

interface Filter {
  page: number;
  limit: number;
  search: string;
  filters: {
    kode: string;
    text: string;
    ket: string;
    modifiedby: string;
    created_at: string; // Filter berdasarkan method
    updated_at: string; // Filter berdasarkan method
  };
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}
interface GridConfig {
  columnsOrder: number[];
  columnsWidth: { [key: string]: number };
}
const GridError = () => {
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [viewMode, setViewMode] = useState<boolean>(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [popOver, setPopOver] = useState<boolean>(false);
  const dispatch = useDispatch();
  const { mutate: createError, isLoading: isLoadingCreate } = useCreateError();
  const { mutate: updateError, isLoading: isLoadingUpdate } = useUpdateError();
  const [addMode, setAddMode] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingManually, setIsFetchingManually] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const { mutateAsync: deleteError, isLoading: isLoadingDelete } =
    useDeleteError();
  const resizeDebounceTimeout = useRef<NodeJS.Timeout | null>(null); // Timer debounce untuk resize
  const [columnsOrder, setColumnsOrder] = useState<readonly number[]>([]);
  const [columnsWidth, setColumnsWidth] = useState<{ [key: string]: number }>(
    {}
  );
  const [dataGridKey, setDataGridKey] = useState(0);

  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDataUpdated, setIsDataUpdated] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [fetchedPages, setFetchedPages] = useState<Set<number>>(new Set([1]));
  const [deleteMode, setDeleteMode] = useState<boolean>(false);
  const [checkedRows, setCheckedRows] = useState<Set<number>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const { alert } = useAlert();
  const forms = useForm<ErrorInput>({
    resolver: zodResolver(errorSchema),
    mode: 'onSubmit',
    defaultValues: {
      kode: '',
      ket: '',
      statusaktif: 1
    }
  });

  const [filters, setFilters] = useState<Filter>({
    page: 1,
    limit: 30,
    filters: {
      kode: '',
      text: '',
      ket: '',
      modifiedby: '',
      created_at: '',
      updated_at: ''
    },
    search: '',
    sortBy: 'kode',
    sortDirection: 'asc'
  });
  const [prevFilters, setPrevFilters] = useState<Filter>(filters);
  const { data: allerror, isLoading: isLoadingError } = useGetAllError({
    ...filters,
    page: currentPage
  });

  const inputColRefs = {
    kode: useRef<HTMLInputElement>(null),
    ket: useRef<HTMLInputElement>(null),
    text: useRef<HTMLInputElement>(null),
    modifiedby: useRef<HTMLInputElement>(null),
    created_at: useRef<HTMLInputElement>(null),
    updated_at: useRef<HTMLInputElement>(null)
  };
  const handleColumnFilterChange = (
    colKey: keyof Filter['filters'],
    value: string
  ) => {
    setRows([]);
    setFilters((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        [colKey]: value
      },
      search: '',
      page: 1
    }));
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
  function highlightText(
    text: string | number | null | undefined,
    search: string,
    columnFilter: string = ''
  ) {
    const textValue = text !== null && text !== undefined ? String(text) : ''; // Pastikan 0 tidak dianggap falsy
    if (!textValue) return '';

    if (!search.trim() && !columnFilter.trim()) return textValue;

    const combinedSearch = search + columnFilter;

    // Regex untuk mencari setiap huruf dari combinedSearch dan mengganti dengan elemen <span> dengan background yellow dan font-size 12px
    const regex = new RegExp(`(${combinedSearch})`, 'gi');

    // Ganti semua kecocokan dengan elemen JSX
    const highlightedText = textValue.replace(
      regex,
      (match) =>
        `<span style="background-color: yellow; font-size: 13px">${match}</span>`
    );

    return (
      <span
        className="text-sm"
        dangerouslySetInnerHTML={{ __html: highlightedText }}
      />
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRows([]);
    const searchValue = e.target.value;
    setInputValue(searchValue);
    setCurrentPage(1);
    setFilters((prev) => ({
      ...prev,
      filters: {
        kode: '',
        text: 'AKTIF',
        ket: '',
        modifiedby: '',
        created_at: '',
        updated_at: ''
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
    setRows([]);
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
  const columns = useMemo((): Column<Row>[] => {
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
              <p className="text-sm font-normal">No.</p>
            </div>

            <div
              className="flex h-[50%] w-full cursor-pointer items-center justify-center"
              onClick={() => {
                setFilters({
                  ...filters,
                  search: '',
                  filters: {
                    kode: '',
                    ket: '',
                    modifiedby: '',
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
        key: 'kode',
        name: 'KODE',
        width: 150,
        resizable: true,
        draggable: true,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('kode')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'kode' ? 'font-bold' : 'font-normal'
                }`}
              >
                KODE
              </p>
              <div className="ml-2">
                {filters.sortBy === 'kode' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'kode' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="font-bold" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>
            <div className="relative h-[50%] w-full px-1">
              <Input
                ref={inputColRefs.kode}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.kode || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleColumnFilterChange('kode', value);
                }}
              />
              {filters.filters.kode && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('kode', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.kode || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.kode || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'ket',
        name: 'KET',
        width: 300,
        resizable: true,
        draggable: true,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('ket')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'ket' ? 'font-bold' : 'font-normal'
                }`}
              >
                KET
              </p>
              <div className="ml-2">
                {filters.sortBy === 'ket' && filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'ket' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="font-bold" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>

            <div className="relative h-[50%] w-full px-1">
              <Input
                ref={inputColRefs.ket}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.ket || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleColumnFilterChange('ket', value);
                }}
              />
              {filters.filters.ket && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('ket', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.ket || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {highlightText(props.row.ket || '', filters.search, columnFilter)}
            </div>
          );
        }
      },
      {
        key: 'statusaktif',
        name: 'STATUS AKTIF',
        resizable: true,
        draggable: true,
        width: 150,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onContextMenu={handleContextMenu}
            >
              <p className="text-sm font-normal">Status Aktif</p>
            </div>
            <div className="relative h-[50%] w-full px-1">
              <Select
                defaultValue=""
                onValueChange={(value: any) => {
                  handleColumnFilterChange('text', value);
                }}
              >
                <SelectTrigger className="filter-select z-[999999] mr-1 h-8 w-full cursor-pointer rounded-none border border-gray-300 p-1 text-xs font-thin">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem className="text=xs cursor-pointer" value="">
                      <p className="text-sm font-normal">all</p>
                    </SelectItem>
                    <SelectItem
                      className="text=xs cursor-pointer"
                      value="AKTIF"
                    >
                      <p className="text-sm font-normal">AKTIF</p>
                    </SelectItem>
                    <SelectItem
                      className="text=xs cursor-pointer"
                      value="TIDAK AKTIF"
                    >
                      <p className="text-sm font-normal">TIDAK AKTIF</p>
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const memoData = props.row.memo ? JSON.parse(props.row.memo) : null;

          if (memoData) {
            return (
              <div className="flex h-full w-full items-center justify-center py-1">
                <div
                  className="m-0 flex h-fit w-fit cursor-pointer items-center justify-center p-0"
                  style={{
                    backgroundColor: memoData.WARNA,
                    color: memoData.WARNATULISAN,
                    padding: '2px 6px',
                    borderRadius: '2px',
                    textAlign: 'left',
                    fontWeight: '600'
                  }}
                >
                  <p style={{ fontSize: '13px' }}>{memoData.SINGKATAN}</p>
                </div>
              </div>
            );
          }

          return <div className="text-xs text-gray-500">N/A</div>; // Tampilkan 'N/A' jika memo tidak tersedia
        }
      },
      {
        key: 'modifiedby',
        name: 'MODIFIED BY',
        width: 200,
        resizable: true,
        draggable: true,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('modifiedby')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'modifiedby' ? 'font-bold' : 'font-normal'
                }`}
              >
                Modified By
              </p>
              <div className="ml-2">
                {filters.sortBy === 'modifiedby' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'modifiedby' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="font-bold" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>

            <div className="relative h-[50%] w-full px-1">
              <Input
                ref={inputColRefs.modifiedby}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.modifiedby || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleColumnFilterChange('modifiedby', value);
                }}
              />
              {filters.filters.modifiedby && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('modifiedby', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.modifiedby || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.modifiedby || '',
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
        width: 200,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('created_at')}
              onContextMenu={handleContextMenu}
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

        width: 200,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('updated_at')}
              onContextMenu={handleContextMenu}
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

  const onColumnResize = (index: number, width: number) => {
    // 1) Dapatkan key kolom yang di-resize
    const columnKey = columns[columnsOrder[index]].key;

    // 2) Update state width seketika (biar kolom langsung responsif)
    const newWidthMap = { ...columnsWidth, [columnKey]: width };
    setColumnsWidth(newWidthMap);

    // 3) Bersihkan timeout sebelumnya agar tidak menumpuk
    if (resizeDebounceTimeout.current) {
      clearTimeout(resizeDebounceTimeout.current);
    }

    // 4) Set ulang timer: hanya ketika 300ms sejak resize terakhir berlalu,
    //    saveGridConfig akan dipanggil
    resizeDebounceTimeout.current = setTimeout(() => {
      saveGridConfig(user.id, 'GridError', [...columnsOrder], newWidthMap);
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

      saveGridConfig(user.id, 'GridError', [...newOrder], columnsWidth);
      return newOrder;
    });
  };

  function getRowTop(rowIdx: any) {
    // Menghitung posisi top berdasarkan rowIdx, ini harus disesuaikan dengan layout Anda
    const rowHeight = 50; // Misalkan tinggi setiap baris adalah 50px
    return rowIdx * rowHeight;
  }

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
    // Hanya mengembalikan jika ada error, tidak ada data lebih, atau rows kosong
    if (
      isLoadingError ||
      (isAtBottom(event) && !hasMore) ||
      rows.length === 0 ||
      isFetching
    )
      return;

    const findUnfetchedPage = (pageOffset: number) => {
      let page = currentPage + pageOffset;
      while (page > 0 && fetchedPages.has(page)) {
        page += pageOffset;
      }
      return page > 0 ? page : null;
    };

    // Handle scroll ke bawah (isAtBottom)
    if (isAtBottom(event)) {
      const nextPage = findUnfetchedPage(1);
      if (nextPage && nextPage <= totalPages && !fetchedPages.has(nextPage)) {
        setCurrentPage(nextPage);
        setIsAllSelected(false);
      }
    }

    // Handle scroll ke atas (isAtTop), hanya jika currentPage adalah 1
    if (isAtTop(event) && currentPage !== 1) {
      const prevPage = findUnfetchedPage(-1);
      if (prevPage && !fetchedPages.has(prevPage)) {
        // Tandai sedang fetching
        setIsFetching(true);

        try {
          // Mengambil data untuk halaman sebelumnya dan menambahkan ke awal rows
          const newData = await fetchDataForPage(prevPage, filters);
          setRows((prevRows) => {
            const existingIds = new Set(prevRows.map((row) => row.id));
            const filteredNewRows = newData.filter(
              (newRow) => !existingIds.has(newRow.id)
            );
            return [...filteredNewRows, ...prevRows]; // Add newRows at the top
          });
          setFetchedPages((prev) => new Set(prev).add(prevPage));

          // Update currentPage untuk merefleksikan halaman terendah yang telah diambil
          setCurrentPage(prevPage);
          if (!fetchedPages.has(1) && gridRef.current) {
            const scrollToRowIndex = Math.min(50, rows.length);
            gridRef.current.scrollToCell({
              rowIdx: scrollToRowIndex
            });
            setSelectedRow((prevSelectedRow) => {
              const newSelectedRow = Math.max(prevSelectedRow + 50, 0);
              return newSelectedRow;
            });
          }
        } catch (error) {
          console.error('Error fetching previous page:', error);
        } finally {
          // Set isFetching ke false setelah fetching selesai
          setIsFetching(false);
        }
      }
    }
  }

  function handleCellClick(args: CellClickArgs<Row>) {
    const clickedRow = args.row;
    const rowIndex = rows.findIndex((r) => r.id === clickedRow.id);
    if (rowIndex !== -1) {
      setSelectedRow(rowIndex);
    }
  }
  document.querySelectorAll('.column-headers').forEach((element) => {
    element.classList.remove('c1kqdw7y7-0-0-beta-47');
  });
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
  const fetchDataForPage = async (page: number, filters: Filter) => {
    try {
      // Menyiapkan filter dengan parameter yang sesuai untuk dipakai oleh getMenuFn
      const response = await getErrorFn({
        page: page,
        limit: filters.limit,
        search: filters.search || '',
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection,
        filters: filters.filters // Jika ada filter tambahan
      });

      const data = response.data; // Mengambil data dari response

      return data; // Mengembalikan data
    } catch (error) {
      console.error('Error fetching data:', error);
      return []; // Jika ada error, kembalikan array kosong
    }
  };

  const onSuccess = async (indexOnPage: any, pageNumber: any) => {
    try {
      forms.reset();
      setPopOver(false);
      setIsFetchingManually(true);
      if (!deleteMode) {
        const response = await api2.get(`/redis/get/error-allItems`);

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

  const onSubmit = async (values: ErrorInput) => {
    const selectedRowId = rows[selectedRow]?.id;
    if (deleteMode === true && editMode === false) {
      await deleteError(selectedRowId, {
        onSuccess: () => {
          setPopOver(false);
          setRows((prevRows) =>
            prevRows.filter((row) => row.id !== selectedRowId)
          );
        }
      });
      return;
    }
    if (editMode === false && deleteMode === false) {
      const newOrder = createError(
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
      await updateError(
        {
          id: selectedRowId as unknown as string,
          fields: { ...values, ...filters }
        },
        { onSuccess: (data) => onSuccess(data.itemIndex, data.pageNumber) }
      );
    }
  };

  const handleEdit = () => {
    if (selectedRow !== null) {
      setPopOver(true);
      setDeleteMode(false);
      setAddMode(false);
      setEditMode(true);
    }
  };

  const handleExport = async () => {
    try {
      const { page, limit, ...filtersWithoutLimit } = filters;

      const response = await exportErrorFn(filtersWithoutLimit); // Kirim data tanpa pagination

      // Buat link untuk mendownload file
      const link = document.createElement('a');
      const url = window.URL.createObjectURL(response);
      link.href = url;
      link.download = `laporan_error${Date.now()}.xlsx`; // Nama file yang diunduh
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
      const response = await exportErrorBySelectFn(jsonCheckedRows);

      // Buat link untuk mendownload file
      const link = document.createElement('a');
      const url = window.URL.createObjectURL(response);
      link.href = url;
      link.download = `laporan_error${Date.now()}.xlsx`; // Nama file yang diunduh
      link.click(); // Trigger download

      // Revoke URL setelah download
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting user data:', error);
      alert({
        title: 'Failed to generate the export. Please try again.',
        variant: 'danger',
        submitText: 'ok'
      });
    }
  };

  const handleView = () => {
    if (selectedRow !== null) {
      setPopOver(true);
      setDeleteMode(true);
      setAddMode(false);
      setEditMode(false);
      setViewMode(true);
    }
  };
  const handleDelete = () => {
    if (selectedRow !== null) {
      setPopOver(true);
      setEditMode(false);
      setAddMode(false);
      setDeleteMode(true);
    }
  };
  const handleReport = async () => {
    const { page, limit, ...filtersWithoutLimit } = filters;
    const response = await getErrorFn(filtersWithoutLimit);

    if (response.data === null || response.data.length === 0) {
      alert({
        title: 'DATA TIDAK TERSEDIA!',
        variant: 'danger',
        submitText: 'ok'
      });
    } else {
      const reportRows = response.data.map((row) => ({
        ...row,
        judullaporan: 'Laporan Error',
        usercetak: user.username,
        tglcetak: new Date().toLocaleDateString(),
        judul: 'PT.TRANSPORINDO AGUNG SEJAHTERA'
      }));
      dispatch(setReportData(reportRows));
      window.open('/reports/error', '_blank');
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
      const response = await reportErrorBySelectFn(jsonCheckedRows);
      const reportRows = response.map((row: any) => ({
        ...row,
        judullaporan: 'Laporan Error',
        usercetak: user.username,
        tglcetak: new Date().toLocaleDateString(),
        judul: 'PT.TRANSPORINDO AGUNG SEJAHTERA'
      }));
      dispatch(setReportData(reportRows));
      window.open('/reports/error', '_blank');
    } catch (error) {
      console.error('Error generating report:', error);
      alert({
        title: 'Failed to generate the report. Please try again.',
        variant: 'danger',
        submitText: 'OK'
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
  const handleClose = () => {
    setPopOver(false);
    forms.reset();
    setEditMode(false);
    setDeleteMode(false);
    setAddMode(false);
  };
  const handleAdd = async () => {
    try {
      setEditMode(false);
      setDeleteMode(false);
      setAddMode(true);
      setPopOver(true);
      forms.reset();
    } catch (error) {
      console.error('Error syncing ACOS:', error);
    }
  };

  const saveGridConfig = async (
    userId: string, // userId sebagai identifier
    gridName: string,
    columnsOrder: number[],
    columnsWidth: { [key: string]: number }
  ) => {
    try {
      const response = await fetch('/api/savegrid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          gridName,
          config: { columnsOrder, columnsWidth }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save grid configuration');
      }
    } catch (error) {
      console.error('Failed to save grid configuration:', error);
    }
  };
  const resetGridConfig = () => {
    // Nilai default untuk columnsOrder dan columnsWidth
    const defaultColumnsOrder = columns.map((_, index) => index);
    const defaultColumnsWidth = columns.reduce(
      (acc, column) => {
        acc[column.key] = typeof column.width === 'number' ? column.width : 0;
        return acc;
      },
      {} as { [key: string]: number }
    );

    // Set state kembali ke nilai default
    setColumnsOrder(defaultColumnsOrder);
    setColumnsWidth(defaultColumnsWidth);
    setContextMenu(null);
    setDataGridKey((prevKey) => prevKey + 1);

    gridRef?.current?.selectCell({ rowIdx: 0, idx: 0 });

    // Simpan konfigurasi reset ke server (atau backend)
    if (user.id) {
      saveGridConfig(
        user.id,
        'GridError',
        defaultColumnsOrder,
        defaultColumnsWidth
      );
    }
  };

  const loadGridConfig = async (userId: string, gridName: string) => {
    try {
      const response = await fetch(
        `/api/loadgrid?userId=${userId}&gridName=${gridName}`
      );
      if (!response.ok) {
        throw new Error('Failed to load grid configuration');
      }

      const { columnsOrder, columnsWidth }: GridConfig = await response.json();

      setColumnsOrder(
        columnsOrder && columnsOrder.length
          ? columnsOrder
          : columns.map((_, index) => index)
      );
      setColumnsWidth(
        columnsWidth && Object.keys(columnsWidth).length
          ? columnsWidth
          : columns.reduce(
              (acc, column) => ({
                ...acc,
                [column.key]: columnsWidth[column.key] || column.width // Use width from columnsWidth or fallback to default column width
              }),
              {}
            )
      );
    } catch (error) {
      console.error('Failed to load grid configuration:', error);

      // If configuration is not available or error occurs, fallback to original column widths
      setColumnsOrder(columns.map((_, index) => index));

      setColumnsWidth(
        columns.reduce(
          (acc, column) => {
            // Use the original column width instead of '1fr' when configuration is missing or error occurs
            acc[column.key] =
              typeof column.width === 'number' ? column.width : 0; // Ensure width is a number or default to 0
            return acc;
          },
          {} as { [key: string]: number }
        )
      );
    }
  };
  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY });
  };
  const handleClickOutside = (event: MouseEvent) => {
    if (
      contextMenuRef.current &&
      !contextMenuRef.current.contains(event.target as Node)
    ) {
      setContextMenu(null);
    }
  };

  const orderedColumns = useMemo(() => {
    if (Array.isArray(columnsOrder) && columnsOrder.length > 0) {
      // Mapping dan filter untuk menghindari undefined
      return columnsOrder
        .map((orderIndex) => columns[orderIndex])
        .filter((col) => col !== undefined);
    }
    return columns;
  }, [columns, columnsOrder]);

  // Update properti width pada setiap kolom berdasarkan state columnsWidth
  const finalColumns = useMemo(() => {
    return orderedColumns.map((col) => ({
      ...col,
      width: columnsWidth[col.key] ?? col.width
    }));
  }, [orderedColumns, columnsWidth]);

  useEffect(() => {
    loadGridConfig(user.id, 'GridError');
  }, []);
  useEffect(() => {
    if (
      selectedRow !== null &&
      rows.length > 0 &&
      addMode === false // Only fill the form if not in addMode
    ) {
      const rowData = rows[selectedRow];
      forms.setValue('kode', rowData.kode || '');
      forms.setValue('ket', rowData.ket || '');
      forms.setValue('statusaktif', rowData.statusaktif || 1);
    } else if (addMode === true) {
      // If in addMode, ensure the form values are cleared
      forms.reset(); // Reset the form to keep it empty when in add mode
    }
  }, [forms, selectedRow, rows, addMode, editMode, deleteMode, viewMode]);
  useEffect(() => {
    if (!allerror || isDataUpdated) return;

    const newRows = allerror.data || [];

    setRows((prevRows) => {
      // Jika terjadi perubahan filter atau halaman pertama, reset seluruh rows
      if (currentPage === 1 || filters !== prevFilters) {
        setCurrentPage(1); // Reset currentPage to 1
        setFetchedPages(new Set([1])); // Reset fetchedPages to [1]
        return newRows; // Use the fetched new rows directly
      }
      // Jika currentPage belum pernah diambil, tentukan apakah perlu prepend atau append
      if (!fetchedPages.has(currentPage)) {
        return [...prevRows, ...newRows];
      }
      return prevRows;
    });

    if (allerror.pagination.totalPages) {
      setTotalPages(allerror.pagination.totalPages);
    }

    setHasMore(newRows.length === filters.limit);
    setFetchedPages((prev) => new Set(prev).add(currentPage));
    setPrevFilters(filters);
  }, [allerror, currentPage, filters, isFetchingManually, isDataUpdated]);

  useEffect(() => {
    if (isFirstLoad && gridRef.current && rows.length > 0) {
      setSelectedRow(0);
      gridRef.current.selectCell({ rowIdx: 0, idx: 1 });
      setIsFirstLoad(false);
    }
  }, [rows, isFirstLoad]);
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
      <div className="flex h-[100%]  w-full flex-col rounded-sm border border-blue-500 bg-white">
        <div
          className="flex h-[38px] w-full flex-row items-center rounded-t-sm border-b border-blue-500 px-2"
          style={{
            background: 'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 100%)'
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
                <Image src={IcClose} width={15} height={15} alt="close" />
              </Button>
            )}
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
          rowHeight={30}
          headerRowHeight={70}
          className="rdg-light fill-grid"
          onColumnResize={onColumnResize}
          onColumnsReorder={onColumnsReorder}
          onCellKeyDown={handleKeyDown}
          renderers={{
            noRowsFallback: <EmptyRowsRenderer />
          }}
        />

        <div
          className="flex flex-row justify-between border border-x-0 border-b-0 border-blue-500 p-2"
          style={{
            background: 'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 100%)'
          }}
        >
          <ActionButton
            onAdd={handleAdd}
            checkedRows={checkedRows}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onView={handleView}
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
          {isLoadingError ? <LoadRowsRenderer /> : null}
        </div>
      </div>
      <FormError
        popOver={popOver}
        handleClose={handleClose}
        setPopOver={setPopOver}
        forms={forms}
        deleteMode={deleteMode}
        viewMode={viewMode}
        onSubmit={forms.handleSubmit(onSubmit)}
        isLoadingCreate={isLoadingCreate}
        isLoadingUpdate={isLoadingUpdate}
        isLoadingDelete={isLoadingDelete}
      />
    </div>
  );
};

export default GridError;
