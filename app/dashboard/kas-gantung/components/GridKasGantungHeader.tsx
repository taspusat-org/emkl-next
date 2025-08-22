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
import { MenuInput, menuSchema } from '@/lib/validations/menu.validation';
import { useDeleteMenu, useUpdateMenu } from '@/lib/server/useMenu';
import { syncAcosFn } from '@/lib/apis/acos.api';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import {
  FaFileExport,
  FaPlus,
  FaPrint,
  FaSort,
  FaSortDown,
  FaSortUp,
  FaTimes
} from 'react-icons/fa';
import { Input } from '@/components/ui/input';
import { api, api2 } from '@/lib/utils/AxiosInstance';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  exportMenuBySelectFn,
  exportMenuFn,
  getMenuFn,
  reportMenuBySelectFn
} from '@/lib/apis/menu.api';
import { HiDocument } from 'react-icons/hi2';
import { setReportData } from '@/lib/store/reportSlice/reportSlice';
import { useDispatch } from 'react-redux';
import { Checkbox } from '@/components/ui/checkbox';
import { useAlert } from '@/lib/store/client/useAlert';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import IcClose from '@/public/image/x.svg';
import ReportDesignerMenu from '@/app/reports/menu/page';
import {
  useCreatePengembalianKasGantung,
  useGetPengembalianKasGantung
} from '@/lib/server/usePengembalianKasGantung';
import {
  PengembalianKasGantungHeaderInput,
  pengembalianKasGantungHeaderSchema
} from '@/lib/validations/pengembaliankasgantung.validation';
import {
  getPengembalianKasGantungHeaderFn,
  getPengembalianKasGantungReportFn
} from '@/lib/apis/pengembaliankasgantung.api';
import {
  setProcessed,
  setProcessing
} from '@/lib/store/loadingSlice/loadingSlice';
import { setHeaderData } from '@/lib/store/headerSlice/headerSlice';
import FormKasGantung from './FormKasGantung';
import {
  filterKasGantung,
  KasGantungHeader
} from '@/lib/types/kasgantungheader.type';
import {
  KasGantungHeaderInput,
  kasgantungHeaderSchema
} from '@/lib/validations/kasgantung.validation';
import {
  useCreateKasGantung,
  useDeleteKasGantung,
  useGetKasGantungHeader,
  useUpdatePengembalianKasGantung
} from '@/lib/server/useKasGantung';
import { clearOpenName } from '@/lib/store/lookupSlice/lookupSlice';
import { checkBeforeDeleteFn } from '@/lib/apis/global.api';
import { checkValidationKasGantungFn } from '@/lib/apis/kasgantungheader.api';

interface Filter {
  page: number;
  limit: number;
  search: string;
  filters: typeof filterKasGantung;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

interface GridConfig {
  columnsOrder: number[];
  columnsWidth: { [key: string]: number };
}
const GridKasGantungHeader = () => {
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [selectedCol, setSelectedCol] = useState<number>(0);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const [totalPages, setTotalPages] = useState(1);
  const [popOver, setPopOver] = useState<boolean>(false);
  const { mutateAsync: createKasGantung, isLoading: isLoadingCreate } =
    useCreateKasGantung();
  const { mutateAsync: updateKasGantung, isLoading: isLoadingUpdate } =
    useUpdatePengembalianKasGantung();
  const [currentPage, setCurrentPage] = useState(1);
  const [inputValue, setInputValue] = useState<string>('');
  const [hasMore, setHasMore] = useState(true);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { mutateAsync: deleteKasGantung, isLoading: isLoadingDelete } =
    useDeleteKasGantung();
  const [columnsOrder, setColumnsOrder] = useState<readonly number[]>([]);
  const [columnsWidth, setColumnsWidth] = useState<{ [key: string]: number }>(
    {}
  );

  const [mode, setMode] = useState<string>('');

  const [dataGridKey, setDataGridKey] = useState(0);

  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [fetchedPages, setFetchedPages] = useState<Set<number>>(new Set([1]));
  const queryClient = useQueryClient();
  const [isFetchingManually, setIsFetchingManually] = useState(false);
  const [rows, setRows] = useState<KasGantungHeader[]>([]);
  const [isDataUpdated, setIsDataUpdated] = useState(false);
  const resizeDebounceTimeout = useRef<NodeJS.Timeout | null>(null); // Timer debounce untuk resize
  const prevPageRef = useRef(currentPage);
  const dispatch = useDispatch();
  const [checkedRows, setCheckedRows] = useState<Set<number>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const { alert } = useAlert();
  const { user, cabang_id, token } = useSelector(
    (state: RootState) => state.auth
  );
  const forms = useForm<KasGantungHeaderInput>({
    resolver: zodResolver(kasgantungHeaderSchema),
    mode: 'onSubmit',
    defaultValues: {
      nobukti: '',
      tglbukti: '',
      keterangan: null,
      bank_id: null,
      pengeluaran_nobukti: '',
      coakaskeluar: '',
      relasi_id: null,
      details: []
    }
  });
  const gridRef = useRef<DataGridHandle>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const colTimersRef = useRef<
    Map<keyof Filter['filters'], ReturnType<typeof setTimeout>>
  >(new Map());
  const router = useRouter();
  const { selectedDate, selectedDate2, onReload } = useSelector(
    (state: RootState) => state.filter
  );
  const [filters, setFilters] = useState<Filter>({
    page: 1,
    limit: 30,
    filters: {
      ...filterKasGantung,
      tglDari: selectedDate,
      tglSampai: selectedDate2
    },
    search: '',
    sortBy: 'nobukti',
    sortDirection: 'asc'
  });

  const [prevFilters, setPrevFilters] = useState<Filter>(filters);

  const {
    data: allData,
    isLoading: isLoadingData,
    refetch
  } = useGetKasGantungHeader({
    ...filters,
    page: currentPage
  });
  const inputColRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleColumnFilterChange = (
    colKey: keyof Filter['filters'],
    value: string
  ) => {
    // UI instan (tidak memicu request)
    const originalIndex = columns.findIndex((col) => col.key === colKey);
    const displayIndex =
      columnsOrder.length > 0
        ? columnsOrder.findIndex((idx) => idx === originalIndex)
        : originalIndex;

    setInputValue('');
    setSelectedRow(0);

    setTimeout(() => {
      gridRef?.current?.selectCell({ rowIdx: 0, idx: displayIndex });
    }, 100);

    setTimeout(() => {
      const ref = inputColRefs.current[colKey];
      ref?.focus();
    }, 200);

    // DEBOUNCE PER-KOLOM
    // - batalkan timer lama untuk kolom ini saja
    const timers = colTimersRef.current;
    const prevTimer = timers.get(colKey);
    if (prevTimer) clearTimeout(prevTimer);

    const t = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        filters: { ...prev.filters, [colKey]: value },
        search: '',
        page: 1
      }));
      setCheckedRows(new Set());
      setIsAllSelected(false);
      setRows([]);
      setCurrentPage(1);

      timers.delete(colKey); // bereskan map
    }, 300);

    timers.set(colKey, t);
  };

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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setInputValue(searchValue);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setCurrentPage(1);
      setFilters((prev) => ({
        ...prev,
        filters: filterKasGantung,
        search: searchValue,
        page: 1
      }));
      setCheckedRows(new Set());
      setIsAllSelected(false);
      setTimeout(() => {
        gridRef?.current?.selectCell({ rowIdx: 0, idx: 1 });
      }, 100);

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 200);
      setSelectedRow(0);
      setCurrentPage(1);
      setRows([]);
    }, 300);
  };
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      colTimersRef.current.forEach((t) => clearTimeout(t));
      colTimersRef.current.clear();
    };
  }, []);
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
              <p className="text-sm font-normal">No.</p>
            </div>

            <div
              className="flex h-[50%] w-full cursor-pointer items-center justify-center"
              onClick={() => {
                setFilters({
                  ...filters,
                  search: '',
                  filters: filterKasGantung
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
        renderCell: ({ row }: { row: KasGantungHeader }) => (
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
        key: 'nobukti',
        name: 'Nomor Bukti',
        resizable: true,
        draggable: true,
        width: 300,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('nobukti')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'nobukti' ? 'text-red-500' : 'font-normal'
                }`}
              >
                Nomor Bukti
              </p>
              <div className="ml-2">
                {filters.sortBy === 'nobukti' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'nobukti' &&
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
                  inputColRefs.current['nobukti'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none text-sm"
                value={
                  filters.filters.nobukti
                    ? filters.filters.nobukti.toUpperCase()
                    : ''
                }
                type="text"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase(); // Menjadikan input menjadi uppercase
                  handleColumnFilterChange('nobukti', value);
                }}
              />
              {filters.filters.nobukti && (
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
        renderCell: (props: any) => {
          const columnFilter = filters.filters.nobukti || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.nobukti || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'tglbukti',
        name: 'Tanggal Bukti',
        resizable: true,
        draggable: true,
        headerCellClass: 'column-headers',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('tglbukti')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'tglbukti' ? 'text-red-500' : 'font-normal'
                }`}
              >
                Tanggal Bukti
              </p>
              <div className="ml-2">
                {filters.sortBy === 'tglbukti' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'tglbukti' &&
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
                  inputColRefs.current['tglbukti'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.tglbukti.toUpperCase() || ''}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  handleColumnFilterChange('tglbukti', value);
                }}
              />
              {filters.filters.tglbukti && (
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
        renderCell: (props: any) => {
          const columnFilter = filters.filters.tglbukti || '';
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.tglbukti || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'bank_nama',
        name: 'Nama Bank',
        resizable: true,
        draggable: true,
        width: 150,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('bank_id')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'bank_id' ? 'text-red-500' : 'font-normal'
                }`}
              >
                Nama Bank
              </p>
              <div className="ml-2">
                {filters.sortBy === 'bank_id' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'bank_id' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="text-red-500" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>

            <div className="relative h-[50%] w-full px-1">
              <Select
                defaultValue=""
                onValueChange={(value: any) => {
                  handleColumnFilterChange('bank_id', value);
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
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.bank_nama !== null &&
                  props.row.bank_nama !== undefined
                  ? props.row.bank_nama
                  : '',
                filters.search
              )}
            </div>
          );
        }
      },
      {
        key: 'pengeluaran_nobukti',
        name: 'Pengeluaran Nomor Bukti',
        resizable: true,
        draggable: true,
        width: 300,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('pengeluaran_nobukti')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'pengeluaran_nobukti'
                    ? 'text-red-500'
                    : 'font-normal'
                }`}
              >
                Pengeluaran Nomor Bukti
              </p>
              <div className="ml-2">
                {filters.sortBy === 'pengeluaran_nobukti' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'pengeluaran_nobukti' &&
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
                  inputColRefs.current['pengeluaran_nobukti'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none text-sm"
                value={
                  filters.filters.pengeluaran_nobukti
                    ? filters.filters.pengeluaran_nobukti?.toUpperCase()
                    : ''
                }
                type="text"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase(); // Menjadikan input menjadi uppercase
                  handleColumnFilterChange('pengeluaran_nobukti', value);
                }}
              />
              {filters.filters.pengeluaran_nobukti && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() =>
                    handleColumnFilterChange('pengeluaran_nobukti', '')
                  }
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.pengeluaran_nobukti || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.pengeluaran_nobukti || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'coakaskeluar',
        name: 'COA Kas Keluar',
        resizable: true,
        draggable: true,
        width: 300,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('coakaskeluar')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'coakaskeluar'
                    ? 'text-red-500'
                    : 'font-normal'
                }`}
              >
                COA Kas Keluar
              </p>
              <div className="ml-2">
                {filters.sortBy === 'coakaskeluar' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'coakaskeluar' &&
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
                  inputColRefs.current['coakaskeluar'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none text-sm"
                value={
                  filters.filters.coakaskeluar
                    ? filters.filters.coakaskeluar?.toUpperCase()
                    : ''
                }
                type="text"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase(); // Menjadikan input menjadi uppercase
                  handleColumnFilterChange('coakaskeluar', value);
                }}
              />
              {filters.filters.coakaskeluar && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('coakaskeluar', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.coakaskeluar || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.coakaskeluar || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'relasi_id',
        name: 'Relasi',
        resizable: true,
        draggable: true,
        width: 150,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('relasi_id')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'relasi_id'
                    ? 'text-red-500'
                    : 'font-normal'
                }`}
              >
                Relasi
              </p>
              <div className="ml-2">
                {filters.sortBy === 'relasi_id' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'relasi_id' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="text-red-500" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>

            <div className="relative h-[50%] w-full px-1">
              <Select
                defaultValue=""
                onValueChange={(value: any) => {
                  handleColumnFilterChange('bank_id', value);
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
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.relasi_nama !== null &&
                  props.row.relasi_nama !== undefined
                  ? props.row.relasi_nama
                  : '',
                filters.search
              )}
            </div>
          );
        }
      },
      {
        key: 'dibayarke',
        name: 'DIBAYAR KE',
        resizable: true,
        draggable: true,
        width: 150,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onContextMenu={handleContextMenu}
              onClick={() => handleSort('dibayarke')}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'dibayarke' ? 'font-bold' : 'font-normal'
                }`}
              >
                DIBAYAR KE
              </p>
              <div className="ml-2">
                {filters.sortBy === 'dibayarke' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'dibayarke' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="font-bold" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>

            <div className="relative h-[50%] w-full px-1">
              <Input
                ref={(el) => {
                  inputColRefs.current['dibayarke'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.dibayarke || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleColumnFilterChange('dibayarke', value);
                }}
              />
              {filters.filters.dibayarke && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('dibayarke', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.dibayarke || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.dibayarke || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'alatbayar_nama',
        name: 'Alat Bayar',
        resizable: true,
        draggable: true,
        width: 150,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onContextMenu={handleContextMenu}
              onClick={() => handleSort('alatbayar_nama')}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'alatbayar_nama'
                    ? 'font-bold'
                    : 'font-normal'
                }`}
              >
                Alat Bayar
              </p>
              <div className="ml-2">
                {filters.sortBy === 'alatbayar_nama' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'alatbayar_nama' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="font-bold" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>

            <div className="relative h-[50%] w-full px-1">
              <Input
                ref={(el) => {
                  inputColRefs.current['alatbayar_nama'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.alatbayar_nama || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleColumnFilterChange('alatbayar_nama', value);
                }}
              />
              {filters.filters.alatbayar_nama && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('alatbayar_nama', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.alatbayar_nama || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.alatbayar_nama || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'nowarkat',
        name: 'NOWARKAT',
        resizable: true,
        draggable: true,
        width: 150,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onContextMenu={handleContextMenu}
              onClick={() => handleSort('nowarkat')}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'nowarkat' ? 'font-bold' : 'font-normal'
                }`}
              >
                NOWARKAT
              </p>
              <div className="ml-2">
                {filters.sortBy === 'nowarkat' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'nowarkat' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="font-bold" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>

            <div className="relative h-[50%] w-full px-1">
              <Input
                ref={(el) => {
                  inputColRefs.current['nowarkat'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.nowarkat || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleColumnFilterChange('nowarkat', value);
                }}
              />
              {filters.filters.nowarkat && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('nowarkat', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.nowarkat || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.nowarkat || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'tgljatuhtempo',
        name: 'TGL JATUH TEMPO',
        resizable: true,
        draggable: true,
        width: 150,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onContextMenu={handleContextMenu}
              onClick={() => handleSort('tgljatuhtempo')}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'tgljatuhtempo'
                    ? 'font-bold'
                    : 'font-normal'
                }`}
              >
                TGL JATUH TEMPO
              </p>
              <div className="ml-2">
                {filters.sortBy === 'tgljatuhtempo' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'tgljatuhtempo' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="font-bold" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>

            <div className="relative h-[50%] w-full px-1">
              <Input
                ref={(el) => {
                  inputColRefs.current['tgljatuhtempo'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.tgljatuhtempo || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleColumnFilterChange('tgljatuhtempo', value);
                }}
              />
              {filters.filters.tgljatuhtempo && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('tgljatuhtempo', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.tgljatuhtempo || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.tgljatuhtempo || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'gantungorderan_nobukti',
        name: 'GANTUNG ORDERAN NOBUKTI',
        resizable: true,
        draggable: true,
        width: 150,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onContextMenu={handleContextMenu}
              onClick={() => handleSort('gantungorderan_nobukti')}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'gantungorderan_nobukti'
                    ? 'font-bold'
                    : 'font-normal'
                }`}
              >
                GANTUNG ORDERAN NOBUKTI
              </p>
              <div className="ml-2">
                {filters.sortBy === 'gantungorderan_nobukti' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'gantungorderan_nobukti' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="font-bold" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>

            <div className="relative h-[50%] w-full px-1">
              <Input
                ref={(el) => {
                  inputColRefs.current['gantungorderan_nobukti'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.gantungorderan_nobukti || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleColumnFilterChange('gantungorderan_nobukti', value);
                }}
              />
              {filters.filters.gantungorderan_nobukti && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() =>
                    handleColumnFilterChange('gantungorderan_nobukti', '')
                  }
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.gantungorderan_nobukti || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.gantungorderan_nobukti || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'modifiedby',
        name: 'Modified By',
        resizable: true,
        draggable: true,
        width: 150,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onContextMenu={handleContextMenu}
              onClick={() => handleSort('modifiedby')}
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
                ref={(el) => {
                  inputColRefs.current['modifiedby'] = el;
                }}
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
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('created_at')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'created_at'
                    ? 'text-red-500'
                    : 'font-normal'
                }`}
              >
                Created At
              </p>
              <div className="ml-2">
                {filters.sortBy === 'created_at' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'created_at' &&
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
                  inputColRefs.current['created_at'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.created_at.toUpperCase() || ''}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
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

        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('updated_at')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'updated_at'
                    ? 'text-red-500'
                    : 'font-normal'
                }`}
              >
                Updated At
              </p>
              <div className="ml-2">
                {filters.sortBy === 'updated_at' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'updated_at' &&
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
                  inputColRefs.current['created_at'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.updated_at.toUpperCase() || ''}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
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
      saveGridConfig(
        user.id,
        'GridKasGantungHeader',
        [...columnsOrder],
        newWidthMap
      );
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

      saveGridConfig(
        user.id,
        'GridKasGantungHeader',
        [...newOrder],
        columnsWidth
      );
      return newOrder;
    });
  };
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
    if (isLoadingData || !hasMore || rows.length === 0) return;

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

  function handleCellClick(args: CellClickArgs<KasGantungHeader>) {
    const clickedRow = args.row;
    const rowIndex = rows.findIndex((r) => r.id === clickedRow.id);
    const foundRow = rows.find((r) => r.id === clickedRow?.id);
    if (rowIndex !== -1 && foundRow) {
      setSelectedRow(rowIndex);
      dispatch(setHeaderData(foundRow));
    }
  }
  async function handleKeyDown(
    args: CellKeyDownArgs<KasGantungHeader>,
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
      setRows([]);
      if (mode !== 'delete') {
        const response = await api2.get(`/redis/get/kasgantungheader-allItems`);
        // Set the rows only if the data has changed
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
          }, 200);
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
  const onSubmit = async (values: KasGantungHeaderInput) => {
    const selectedRowId = rows[selectedRow]?.id;

    if (mode === 'delete') {
      if (selectedRowId) {
        await deleteKasGantung(selectedRowId as unknown as string, {
          onSuccess: () => {
            setPopOver(false);
            setRows((prevRows) =>
              prevRows.filter((row) => row.id !== selectedRowId)
            );
            if (selectedRow === 0) {
              setSelectedRow(selectedRow);
              gridRef?.current?.selectCell({ rowIdx: selectedRow, idx: 1 });
            } else if (selectedRow === rows.length - 1) {
              setSelectedRow(selectedRow - 1);
              gridRef?.current?.selectCell({ rowIdx: selectedRow - 1, idx: 1 });
            } else {
              setSelectedRow(selectedRow);
              gridRef?.current?.selectCell({ rowIdx: selectedRow, idx: 1 });
            }
          }
        });
      }
      return;
    }
    if (mode === 'add') {
      const newOrder = await createKasGantung(
        {
          ...values,
          details: values.details.map((detail: any) => ({
            ...detail,
            id: 0 // Ubah id setiap detail menjadi 0
          })),
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

    if (selectedRowId && mode === 'edit') {
      await updateKasGantung(
        {
          id: selectedRowId as unknown as string,
          fields: { ...values, ...filters }
        },
        { onSuccess: (data) => onSuccess(data.itemIndex, data.pageNumber) }
      );
      queryClient.invalidateQueries('menus');
    }
  };

  const handleEdit = async () => {
    if (selectedRow !== null) {
      const rowData = rows[selectedRow];
      const result = await checkValidationKasGantungFn({
        aksi: 'EDIT',
        value: rowData.id
      });
      if (result.status == 'failed') {
        alert({
          title: result.message,
          variant: 'danger',
          submitText: 'OK',
          isForceEdit: true,
          valueForceEdit: rowData.id,
          tableNameForceEdit: 'kasgantungheader',
          clickableText: 'LANJUT EDIT'
        });
      } else {
        setPopOver(true);
        setMode('edit');
      }
    }
  };
  const handleDelete = async () => {
    if (selectedRow !== null) {
      const rowData = rows[selectedRow];

      try {
        // Mengirim request untuk validasi beberapa kombinasi
        const result = await checkValidationKasGantungFn({
          aksi: 'DELETE',
          value: rowData.nobukti
        });

        if (result.status == 'failed') {
          // Menampilkan alert jika ada yang gagal
          alert({
            title: result.message,
            variant: 'danger',
            submitText: 'OK'
          });
        } else {
          // Jika semua validasi berhasil, lanjutkan proses penghapusan atau operasi lain
          setMode('delete');
          setPopOver(true);
        }
      } catch (error) {
        console.error('Error during delete validation:', error);
      }
    }
  };

  const handleView = () => {
    if (selectedRow !== null) {
      setMode('view');
      setPopOver(true);
    }
  };
  const handleExport = async () => {
    try {
      const { page, limit, ...filtersWithoutLimit } = filters;

      const response = await exportMenuFn(filtersWithoutLimit); // Kirim data tanpa pagination

      // Buat link untuk mendownload file
      const link = document.createElement('a');
      const url = window.URL.createObjectURL(response);
      link.href = url;
      link.download = `laporan_menu${Date.now()}.xlsx`; // Nama file yang diunduh
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
      const response = await exportMenuBySelectFn(jsonCheckedRows);

      // Buat link untuk mendownload file
      const link = document.createElement('a');
      const url = window.URL.createObjectURL(response);
      link.href = url;
      link.download = `laporan_menu${Date.now()}.xlsx`; // Nama file yang diunduh
      link.click(); // Trigger download

      // Revoke URL setelah download
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting menu data:', error);
      alert({
        title: 'Failed to generate the export. Please try again.',
        variant: 'danger',
        submitText: 'OK'
      });
    }
  };

  const handleReport = async () => {
    const { page, limit, ...filtersWithoutLimit } = filters;
    const response =
      await getPengembalianKasGantungReportFn(filtersWithoutLimit);
    const reportRows = response.data.map((row) => ({
      ...row,
      judullaporan: 'Laporan Pengembalian Kas Gantung',
      usercetak: user.username,
      tglcetak: new Date().toLocaleDateString(),
      judul: 'PT.TRANSPORINDO AGUNG SEJAHTERA'
    }));

    // Dynamically import Stimulsoft and generate the PDF report
    import('stimulsoft-reports-js/Scripts/stimulsoft.blockly.editor')
      .then((module) => {
        const { Stimulsoft } = module;
        Stimulsoft.Base.StiFontCollection.addOpentypeFontFile(
          '/fonts/arial.ttf',
          'Arial'
        );
        Stimulsoft.Base.StiLicense.Key =
          '6vJhGtLLLz2GNviWmUTrhSqnOItdDwjBylQzQcAOiHksEid1Z5nN/hHQewjPL/4/AvyNDbkXgG4Am2U6dyA8Ksinqp' +
          '6agGqoHp+1KM7oJE6CKQoPaV4cFbxKeYmKyyqjF1F1hZPDg4RXFcnEaYAPj/QLdRHR5ScQUcgxpDkBVw8XpueaSFBs' +
          'JVQs/daqfpFiipF1qfM9mtX96dlxid+K/2bKp+e5f5hJ8s2CZvvZYXJAGoeRd6iZfota7blbsgoLTeY/sMtPR2yutv' +
          'gE9TafuTEhj0aszGipI9PgH+A/i5GfSPAQel9kPQaIQiLw4fNblFZTXvcrTUjxsx0oyGYhXslAAogi3PILS/DpymQQ' +
          '0XskLbikFsk1hxoN5w9X+tq8WR6+T9giI03Wiqey+h8LNz6K35P2NJQ3WLn71mqOEb9YEUoKDReTzMLCA1yJoKia6Y' +
          'JuDgUf1qamN7rRICPVd0wQpinqLYjPpgNPiVqrkGW0CQPZ2SE2tN4uFRIWw45/IITQl0v9ClCkO/gwUtwtuugegrqs' +
          'e0EZ5j2V4a1XDmVuJaS33pAVLoUgK0M8RG72';

        const report = new Stimulsoft.Report.StiReport();
        const dataSet = new Stimulsoft.System.Data.DataSet('Data');

        // Load the report template (MRT file)
        report.loadFile('/reports/ReportPenerimaanKasGantung.mrt');
        report.dictionary.dataSources.clear();
        dataSet.readJson({ data: reportRows });
        report.regData(dataSet.dataSetName, '', dataSet);
        report.dictionary.synchronize();

        // Render the report asynchronously

        report.renderAsync(() => {
          // Export the report to PDF asynchronously
          report.exportDocumentAsync((pdfData: any) => {
            const pdfBlob = new Blob([new Uint8Array(pdfData)], {
              type: 'application/pdf'
            });
            const pdfUrl = URL.createObjectURL(pdfBlob);

            // Store the Blob URL in sessionStorage
            sessionStorage.setItem('pdfUrl', pdfUrl);

            // Navigate to the report page
            window.open('/reports/pengembaliankasgantung', '_blank');
          }, Stimulsoft.Report.StiExportFormat.Pdf);
        });
      })
      .catch((error) => {
        console.error('Failed to load Stimulsoft:', error);
      });
  };
  // const handleReport = async () => {
  //   const { page, limit, ...filtersWithoutLimit } = filters;
  //   dispatch(setProcessing()); // Show loading overlay when the request starts

  //   try {
  //     const response =
  //       await getPengembalianKasGantungReportFn(filtersWithoutLimit);

  //     if (response.data === null || response.data.length === 0) {
  //       alert({
  //         title: 'DATA TIDAK TERSEDIA!',
  //         variant: 'danger',
  //         submitText: 'OK'
  //       });
  //     } else {
  //       const reportRows = response.data.map((row) => ({
  //         ...row,
  //         judullaporan: 'Laporan Pengembalian Kas Gantung',
  //         usercetak: user.username,
  //         tglcetak: new Date().toLocaleDateString(),
  //         judul: 'PT.TRANSPORINDO AGUNG SEJAHTERA'
  //       }));
  //       console.log('reportRows', reportRows);
  //       dispatch(setReportData(reportRows));
  //       window.open('/reports/pengembaliankasgantung2', '_blank');
  //     }
  //   } catch (error) {
  //     console.error('Error generating report:', error);
  //     alert({
  //       title: 'Terjadi kesalahan saat memuat data!',
  //       variant: 'danger',
  //       submitText: 'OK'
  //     });
  //   } finally {
  //     dispatch(setProcessed()); // Hide loading overlay when the request is finished
  //   }
  // };
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
      const response = await reportMenuBySelectFn(jsonCheckedRows);
      const reportRows = response.map((row: any) => ({
        ...row,
        judullaporan: 'Laporan Menu',
        usercetak: user.username,
        tglcetak: new Date().toLocaleDateString(),
        judul: 'PT.TRANSPORINDO AGUNG SEJAHTERA'
      }));
      dispatch(setReportData(reportRows));
      window.open('/reports/menu', '_blank');
    } catch (error) {
      console.error('Error generating report:', error);
      alert({
        title: 'Failed to generate the report. Please try again.',
        variant: 'danger',
        submitText: 'OK'
      });
    }
  };

  document.querySelectorAll('.column-headers').forEach((element) => {
    element.classList.remove('c1kqdw7y7-0-0-beta-47');
  });
  function getRowClass(row: KasGantungHeader) {
    const rowIndex = rows.findIndex((r) => r.id === row.id);
    return rowIndex === selectedRow ? 'selected-row' : '';
  }

  function rowKeyGetter(row: KasGantungHeader) {
    return row.id;
  }

  function EmptyRowsRenderer() {
    return (
      <div
        className="flex h-full w-full items-center justify-center"
        style={{ textAlign: 'center', gridColumn: '1/-1' }}
      >
        NO ROWS DATA FOUND
      </div>
    );
  }
  const handleResequence = () => {
    router.push('/dashboard/resequence');
  };
  function LoadRowsRenderer() {
    return (
      <div>
        <ImSpinner2 className="animate-spin text-3xl text-primary" />
      </div>
    );
  }
  const handleClose = () => {
    setPopOver(false);
    setMode('');

    forms.reset();
  };
  const handleAdd = async () => {
    try {
      // Jalankan API sinkronisasi
      setMode('add');

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
        'GridKasGantungHeader',
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
    loadGridConfig(user.id, 'GridKasGantungHeader');
  }, []);
  useEffect(() => {
    setIsFirstLoad(true);
  }, []);
  useEffect(() => {
    if (isFirstLoad && gridRef.current && rows.length > 0) {
      setSelectedRow(0);
      console.log('masuk2');
      gridRef.current.selectCell({ rowIdx: 0, idx: 1 });
      dispatch(setHeaderData(rows[0]));
      setIsFirstLoad(false);
    }
  }, [rows, isFirstLoad]);
  useEffect(() => {
    // Cek jika ini pertama kali load dan update filter dengan tanggal yang dipilih
    if (isFirstLoad) {
      if (
        selectedDate !== filters.filters.tglDari ||
        selectedDate2 !== filters.filters.tglSampai
      ) {
        setFilters((prevFilters) => ({
          ...prevFilters,
          filters: {
            ...prevFilters.filters,
            tglDari: selectedDate,
            tglSampai: selectedDate2
          }
        }));
      }
    }
    // Cek perubahan tanggal setelah pertama kali load, dan update filter hanya jika onReload dipanggil
    else if (
      (selectedDate !== filters.filters.tglDari ||
        selectedDate2 !== filters.filters.tglSampai) &&
      onReload &&
      !isFirstLoad
    ) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        filters: {
          ...prevFilters.filters,
          tglDari: selectedDate,
          tglSampai: selectedDate2
        }
      }));
    }
  }, [selectedDate, selectedDate2, filters, onReload, isFirstLoad]);
  useEffect(() => {
    if (!allData || isFetchingManually || isDataUpdated) return;

    const newRows = allData.data || [];

    setRows((prevRows) => {
      // Reset data if filter changes (first page)
      if (currentPage === 1 || filters !== prevFilters) {
        setCurrentPage(1); // Reset currentPage to 1
        setFetchedPages(new Set([1])); // Reset fetchedPages to [1]
        return newRows; // Use the fetched new rows directly
      }

      // Add new data to the bottom for infinite scroll
      if (!fetchedPages.has(currentPage)) {
        return [...prevRows, ...newRows];
      }

      return prevRows;
    });

    if (allData.pagination.totalPages) {
      setTotalPages(allData.pagination.totalPages);
    }

    setHasMore(newRows.length === filters.limit);
    setFetchedPages((prev) => new Set(prev).add(currentPage));
    setPrevFilters(filters);
  }, [allData, currentPage, filters, isFetchingManually, isDataUpdated]);
  useEffect(() => {
    if (rows.length > 0 && selectedRow !== null) {
      const selectedRowData = rows[selectedRow];
      dispatch(setHeaderData(selectedRowData)); // Pastikan data sudah benar
    }
  }, [rows, selectedRow, dispatch]);
  useEffect(() => {
    const headerCells = document.querySelectorAll('.rdg-header-row .rdg-cell');
    headerCells.forEach((cell) => {
      cell.setAttribute('tabindex', '-1');
    });
  }, []);
  // useEffect(() => {
  //   if (gridRef.current && dataGridKey) {
  //     setTimeout(() => {
  //       gridRef.current?.selectCell({ rowIdx: 0, idx: 1 });
  //       setIsFirstLoad(false);
  //     }, 0);
  //   }
  // }, [dataGridKey]);
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

  useEffect(() => {
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  useEffect(() => {
    if (selectedRow !== null && rows.length > 0 && mode !== 'add') {
      const row = rows[selectedRow];

      forms.setValue('nobukti', row.nobukti);
      forms.setValue('tglbukti', row.tglbukti);
      forms.setValue('keterangan', row.keterangan ?? '');
      forms.setValue('bank_id', row.bank_id ?? null);
      forms.setValue('pengeluaran_nobukti', row.pengeluaran_nobukti ?? '');
      forms.setValue('coakaskeluar', row.coakaskeluar ?? '');
      forms.setValue('relasi_id', row.relasi_id ?? null);
      forms.setValue('alatbayar_id', row.alatbayar_id ?? null);
      forms.setValue('bank_nama', row.bank_nama);
      forms.setValue('relasi_nama', row.relasi_nama);
      forms.setValue('alatbayar_nama', row.alatbayar_nama);
      // Saat form pertama kali di-render
      forms.setValue('details', []); // Menyiapkan details sebagai array kosong jika belum ada
    } else {
      // Clear or set defaults when adding a new record
      forms.setValue('bank_nama', '');
      forms.setValue('relasi_nama', '');
      forms.setValue('alatbayar_nama', '');
      forms.setValue('pengeluaran_nobukti', '');
      forms.setValue('coakaskeluar', '');
    }
  }, [forms, selectedRow, rows, mode]);
  useEffect(() => {
    // Initialize the refs based on columns dynamically
    columns.forEach((col) => {
      if (!inputColRefs.current[col.key]) {
        inputColRefs.current[col.key] = null;
      }
    });
  }, []);
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        forms.reset(); // Reset the form when the Escape key is pressed
        setMode(''); // Reset the mode to empty
        dispatch(clearOpenName());
      }
    };

    // Add event listener for keydown when the component is mounted
    document.addEventListener('keydown', handleEscape);

    // Cleanup event listener when the component is unmounted or the effect is re-run
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [forms]);
  useEffect(() => {
    // Memastikan refetch dilakukan saat filters berubah
    if (filters !== prevFilters) {
      refetch(); // Memanggil ulang API untuk mendapatkan data terbaru
      setPrevFilters(filters); // Simpan filters terbaru
    }
  }, [filters, refetch]); // Dependency array termasuk filters dan refetch
  console.log('filters', filters);
  console.log('prevFilters', prevFilters);
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
          ref={gridRef}
          columns={finalColumns}
          rows={rows}
          rowKeyGetter={rowKeyGetter}
          rowClass={getRowClass}
          onCellClick={handleCellClick}
          headerRowHeight={70}
          rowHeight={30}
          className="rdg-light fill-grid"
          onColumnResize={onColumnResize}
          onColumnsReorder={onColumnsReorder}
          onCellKeyDown={handleKeyDown}
          onScroll={handleScroll}
          renderers={{
            noRowsFallback: <EmptyRowsRenderer />
          }}
        />
        <div
          className="mt-1 flex flex-row justify-between border border-x-0 border-b-0 border-blue-500 p-2"
          style={{
            background: 'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 100%)'
          }}
        >
          <ActionButton
            onAdd={handleAdd}
            onDelete={handleDelete}
            onView={handleView}
            onEdit={handleEdit}
          />
          {isLoadingData ? <LoadRowsRenderer /> : null}
          {contextMenu && (
            <div
              ref={contextMenuRef}
              style={{
                position: 'fixed', // Fixed agar koordinat sesuai dengan viewport
                top: contextMenu.y, // Pastikan contextMenu.y berasal dari event.clientY
                left: contextMenu.x, // Pastikan contextMenu.x berasal dari event.clientX
                backgroundColor: 'white',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                padding: '8px',
                borderRadius: '4px',
                zIndex: 1000
              }}
            >
              <Button variant="default" onClick={resetGridConfig}>
                Reset
              </Button>
            </div>
          )}
        </div>
      </div>
      <FormKasGantung
        popOver={popOver}
        handleClose={handleClose}
        setPopOver={setPopOver}
        isLoadingUpdate={isLoadingUpdate}
        isLoadingDelete={isLoadingDelete}
        forms={forms}
        mode={mode}
        onSubmit={forms.handleSubmit(onSubmit)}
        isLoadingCreate={isLoadingCreate}
      />
    </div>
  );
};

export default GridKasGantungHeader;
