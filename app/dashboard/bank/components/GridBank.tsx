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
import FormBank from './FormBank';
import { useQueryClient } from 'react-query';
import { BankInput, BankSchema } from '@/lib/validations/bank.validation';
import { getAkunpusatFn } from '@/lib/apis/akunpusat.api';

import {
  useCreateBank,
  useDeleteBank,
  useGetBank,
  useUpdateBank
} from '@/lib/server/useBank';

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

import { HiDocument } from 'react-icons/hi2';
import { setReportData } from '@/lib/store/reportSlice/reportSlice';
import { useDispatch } from 'react-redux';
import { Checkbox } from '@/components/ui/checkbox';
import { useAlert } from '@/lib/store/client/useAlert';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import IcClose from '@/public/image/x.svg';
import ReportDesignerMenu from '@/app/reports/menu/page';
import { IBank } from '@/lib/types/bank.type';
import { number } from 'zod';
import {
  clearOpenName,
  setClearLookup
} from '@/lib/store/lookupSlice/lookupSlice';
import {
  setProcessed,
  setProcessing
} from '@/lib/store/loadingSlice/loadingSlice';
import { exportBankFn, getBankFn } from '@/lib/apis/bank.api';
import { useFormError } from '@/lib/hooks/formErrorContext';
import FilterOptions from '@/components/custom-ui/FilterOptions';

interface Filter {
  page: number;
  limit: number;
  search: string;

  filters: {
    nama: string;
    keterangan: string;
    created_at: string;
    updated_at: string;

    coa: string;
    keterangancoa: string;

    coagantung: string;
    keterangancoagantung: string;

    statusbank: string;
    textbank: string;

    statusaktif: string;
    text: string;

    statusdefault: string;
    textdefault: string;

    formatpenerimaan: string;
    formatpenerimaantext: string;

    formatpengeluaran: string;
    formatpengeluarantext: string;

    formatpenerimaangantung: string;
    formatpenerimaangantungtext: string;

    formatpengeluarangantung: string;
    formatpengeluarangantungtext: string;

    formatpencairan: string;
    formatpencairantext: string;

    formatrekappenerimaan: string;
    formatrekappenerimaantext: string;

    formatrekappengeluaran: string;
    formatrekappengeluarantext: string;
  };
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

interface GridConfig {
  columnsOrder: number[];
  columnsWidth: { [key: string]: number };
}

const GridBank = () => {
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [selectedCol, setSelectedCol] = useState<number>(0);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const [totalPages, setTotalPages] = useState(1);
  const [popOver, setPopOver] = useState<boolean>(false);
  const { mutateAsync: createBank, isLoading: isLoadingCreate } =
    useCreateBank();
  const { mutateAsync: updateBank, isLoading: isLoadingUpdate } =
    useUpdateBank();
  const [currentPage, setCurrentPage] = useState(1);
  const [inputValue, setInputValue] = useState<string>('');
  const [hasMore, setHasMore] = useState(true);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { mutateAsync: deleteBank, isLoading: isLoadingDelete } =
    useDeleteBank();
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
  const [rows, setRows] = useState<IBank[]>([]);
  const [isDataUpdated, setIsDataUpdated] = useState(false);
  const resizeDebounceTimeout = useRef<NodeJS.Timeout | null>(null); // Timer debounce untuk resize
  const prevPageRef = useRef(currentPage);
  const dispatch = useDispatch();
  const [checkedRows, setCheckedRows] = useState<Set<number>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const { alert } = useAlert();
  const { user, cabang_id } = useSelector((state: RootState) => state.auth);
  const getCoa = useSelector((state: RootState) => state.lookup.data);
  const forms = useForm<BankInput>({
    resolver: zodResolver(BankSchema),
    mode: 'onSubmit',
    defaultValues: {
      nama: '',
      keterangan: '',

      coa: null,
      keterangancoa: '',
      coagantung: null,
      keterangancoagantung: '',

      statusbank: 1,
      textbank: '',

      statusaktif: 1,
      text: '',

      statusdefault: 1,
      textdefault: '',

      formatpenerimaan: 0,
      formatpenerimaantext: '',

      formatpengeluaran: 0,
      formatpengeluarantext: '',

      formatpenerimaangantung: 0,
      formatpenerimaangantungtext: '',

      formatpengeluarangantung: 0,
      formatpengeluarangantungtext: '',

      formatpencairan: 0,
      formatpencairantext: '',

      formatrekappenerimaan: 0,
      formatrekappenerimaantext: '',

      formatrekappengeluaran: 0,
      formatrekappengeluarantext: ''
    }
  });
  const {
    setFocus,
    reset,
    formState: { isSubmitSuccessful }
  } = forms;
  const router = useRouter();
  const [filters, setFilters] = useState<Filter>({
    page: 1,
    limit: 30,
    search: '',
    filters: {
      nama: '',
      keterangan: '',
      created_at: '',
      updated_at: '',
      coa: '',
      keterangancoa: '',
      coagantung: '',
      keterangancoagantung: '',
      statusbank: '',
      textbank: '',
      statusaktif: '',
      text: '',
      statusdefault: '',
      textdefault: '',
      formatpenerimaan: '',
      formatpenerimaantext: '',
      formatpengeluaran: '',
      formatpengeluarantext: '',
      formatpenerimaangantung: '',
      formatpenerimaangantungtext: '',
      formatpengeluarangantung: '',
      formatpengeluarangantungtext: '',
      formatpencairan: '',
      formatpencairantext: '',
      formatrekappenerimaan: '',
      formatrekappenerimaantext: '',
      formatrekappengeluaran: '',
      formatrekappengeluarantext: ''
    },
    sortBy: 'nama',
    sortDirection: 'asc'
  });
  const gridRef = useRef<DataGridHandle>(null);
  const [prevFilters, setPrevFilters] = useState<Filter>(filters);
  const { data: allBank, isLoading: isLoadingBank } = useGetBank({
    ...filters,
    page: currentPage
  });
  const inputColRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const { clearError } = useFormError();
  const handleColumnFilterChange = (
    colKey: keyof Filter['filters'],
    value: string
  ) => {
    // 1. cari index di array columns asli
    const originalIndex = columns.findIndex((col) => col.key === colKey);

    // 2. hitung index tampilan berdasar columnsOrder
    //    jika belum ada reorder (columnsOrder kosong), fallback ke originalIndex
    const displayIndex =
      columnsOrder.length > 0
        ? columnsOrder.findIndex((idx) => idx === originalIndex)
        : originalIndex;

    // update filter seperti biasa…
    setFilters((prev) => ({
      ...prev,
      filters: { ...prev.filters, [colKey]: value },
      search: '',
      page: 1
    }));
    setInputValue('');
    setCheckedRows(new Set());
    setIsAllSelected(false);

    // 3. focus sel di grid pakai displayIndex
    setTimeout(() => {
      gridRef?.current?.selectCell({ rowIdx: 0, idx: displayIndex });
    }, 100);

    // 4. focus input filter
    setTimeout(() => {
      const ref = inputColRefs.current[colKey];
      ref?.focus();
    }, 200);

    setSelectedRow(0);
  };
  const handleDropdownFilterChange = (
    colKey: keyof Filter['filters'],
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      filters: { ...prev.filters, [colKey]: value },
      search: '',
      page: 1
    }));
    setInputValue('');
    setCheckedRows(new Set());
    setIsAllSelected(false);
    setSelectedRow(0);
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
    setCurrentPage(1);
    setFilters((prev) => ({
      ...prev,
      filters: {
        nama: '',
        keterangan: '',
        created_at: '',
        updated_at: '',
        coa: '',
        keterangancoa: '',
        coagantung: '',
        keterangancoagantung: '',
        statusbank: '',
        textbank: '',
        statusaktif: '',
        text: '',
        statusdefault: '',
        textdefault: '',
        formatpenerimaan: '',
        formatpenerimaantext: '',
        formatpengeluaran: '',
        formatpengeluarantext: '',
        formatpenerimaangantung: '',
        formatpenerimaangantungtext: '',
        formatpengeluarangantung: '',
        formatpengeluarangantungtext: '',
        formatpencairan: '',
        formatpencairantext: '',
        formatrekappenerimaan: '',
        formatrekappenerimaantext: '',
        formatrekappengeluaran: '',
        formatrekappengeluarantext: ''
      },
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
  console.log(forms.getValues());

  const columns = useMemo((): Column<IBank>[] => {
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
                    nama: '',
                    keterangan: '',
                    created_at: '',
                    updated_at: '',
                    coa: '',
                    keterangancoa: '',
                    coagantung: '',
                    keterangancoagantung: '',
                    statusbank: '',
                    textbank: '',
                    statusaktif: '',
                    text: '',
                    statusdefault: '',
                    textdefault: '',
                    formatpenerimaan: '',
                    formatpenerimaantext: '',
                    formatpengeluaran: '',
                    formatpengeluarantext: '',
                    formatpenerimaangantung: '',
                    formatpenerimaangantungtext: '',
                    formatpengeluarangantung: '',
                    formatpengeluarangantungtext: '',
                    formatpencairan: '',
                    formatpencairantext: '',
                    formatrekappenerimaan: '',
                    formatrekappenerimaantext: '',
                    formatrekappengeluaran: '',
                    formatrekappengeluarantext: ''
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
        renderCell: ({ row }: { row: IBank }) => (
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
        key: 'nama',
        name: 'Nama',
        resizable: true,
        draggable: true,
        width: 300,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('nama')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'nama' ? 'text-red-500' : 'font-normal'
                }`}
              >
                Nama
              </p>
              <div className="ml-2">
                {filters.sortBy === 'nama' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'nama' &&
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
                  inputColRefs.current['nama'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none text-sm"
                value={
                  filters.filters.nama ? filters.filters.nama.toUpperCase() : ''
                }
                type="text"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  handleColumnFilterChange('nama', value);
                }}
              />
              {filters.filters.nama && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('nama', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.nama || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.nama || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'keterangan',
        name: 'Keterangan',
        resizable: true,
        draggable: true,
        width: 200,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('keterangan')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'keterangan'
                    ? 'text-red-500'
                    : 'font-normal'
                }`}
              >
                Keterangan
              </p>
              <div className="ml-2">
                {filters.sortBy === 'keterangan' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'keterangan' &&
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
                  inputColRefs.current['keterangan'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none text-sm"
                value={
                  filters.filters.keterangan
                    ? filters.filters.keterangan.toUpperCase()
                    : ''
                }
                type="text"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  handleColumnFilterChange('keterangan', value);
                }}
              />
              {filters.filters.keterangan && (
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
        renderCell: (props: any) => {
          const columnFilter = filters.filters.keterangan || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.keterangan || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'keterangancoa',
        name: 'COA',
        resizable: true,
        draggable: true,
        width: 200,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('keterangancoa')}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'keterangancoa'
                    ? 'text-red-500'
                    : 'font-normal'
                }`}
              >
                COA
              </p>
              <div className="ml-2">
                {filters.sortBy === 'keterangancoa' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'keterangancoa' &&
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
                  handleColumnFilterChange('keterangancoa', value);
                }}
              >
                <SelectTrigger className="filter-select z-[999999] mr-1 h-8 w-full cursor-pointer rounded-none border border-gray-300 p-1 text-xs font-thin">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem className="cursor-pointer text-xs" value="">
                      <p className="text-sm font-normal">all</p>
                    </SelectItem>
                    {getCoa['KETERANGANCOA']?.map((item: any) => (
                      <SelectItem
                        key={item.id}
                        className="cursor-pointer text-xs"
                        value={item.id}
                      >
                        <p className="text-sm font-normal">
                          {item.keterangancoa}
                        </p>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {props.row.keterangancoa || ''}
            </div>
          );
        }
      },
      {
        key: 'coagantung',
        name: 'COA GANTUNG',
        resizable: true,
        draggable: true,
        width: 200,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('keterangancoagantung')}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'keterangancoagantung'
                    ? 'text-red-500'
                    : 'font-normal'
                }`}
              >
                COA GANTUNG
              </p>
              <div className="ml-2">
                {filters.sortBy === 'keterangancoagantung' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'keterangancoagantung' &&
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
                  handleColumnFilterChange('keterangancoagantung', value);
                }}
              >
                <SelectTrigger className="filter-select z-[999999] mr-1 h-8 w-full cursor-pointer rounded-none border border-gray-300 p-1 text-xs font-thin">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem className="cursor-pointer text-xs" value="">
                      <p className="text-sm font-normal">all</p>
                    </SelectItem>
                    {getCoa['KETERANGANCOA']?.map((item: any) => (
                      <SelectItem
                        key={item.id}
                        className="cursor-pointer text-xs"
                        value={item.id}
                      >
                        <p className="text-sm font-normal">
                          {item.keterangancoa}
                        </p>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.keterangancoagantung || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {props.row.keterangancoagantung || ''}
            </div>
          );
        }
      },
      {
        key: 'statusbank',
        name: 'Status Bank',
        resizable: true,
        draggable: true,
        width: 150,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('statusbank')}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'statusbank'
                    ? 'text-red-500'
                    : 'font-normal'
                }`}
              >
                Status Bank
              </p>
              <div className="ml-2">
                {filters.sortBy === 'statusbank' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'statusbank' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="text-red-500" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>
            <div className="relative h-[50%] w-full px-1">
              <div className="relative h-[50%] w-full px-1">
                <FilterOptions
                  endpoint="parameter"
                  value="id"
                  label="text"
                  filterBy={{ grp: 'STATUS BANK', subgrp: 'STATUS BANK' }}
                  onChange={(value) =>
                    handleColumnFilterChange('statusbank', value)
                  } // Menangani perubahan nilai di parent
                />
              </div>
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.textbank || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {props.row.textbank || ''}
            </div>
          );
        }
      },
      {
        key: 'statusaktif',
        name: 'Status Aktif',
        resizable: true,
        draggable: true,
        width: 150,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('statusaktif')}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'statusaktif'
                    ? 'text-red-500'
                    : 'font-normal'
                }`}
              >
                Status Aktif
              </p>
              <div className="ml-2">
                {filters.sortBy === 'statusaktif' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'statusaktif' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="text-red-500" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>
            <div className="relative h-[50%] w-full px-1">
              <FilterOptions
                endpoint="parameter"
                value="id"
                label="text"
                filterBy={{ grp: 'STATUS AKTIF', subgrp: 'STATUS AKTIF' }}
                onChange={(value) =>
                  handleColumnFilterChange('statusaktif', value)
                } // Menangani perubahan nilai di parent
              />
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const memoData = props.row.memo ? JSON.parse(props.row.memo) : null;

          if (memoData) {
            return (
              <div className="flex h-full w-full items-center justify-center py-1">
                <div
                  className="m-0 flex h-full w-fit cursor-pointer items-center justify-center p-0"
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
        key: 'statusdefault',
        name: 'Status Default',
        resizable: true,
        draggable: true,
        width: 150,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('statusdefault')}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'statusdefault'
                    ? 'text-red-500'
                    : 'font-normal'
                }`}
              >
                Status Default
              </p>
              <div className="ml-2">
                {filters.sortBy === 'statusdefault' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'statusdefault' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="text-red-500" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>
            <div className="relative h-[50%] w-full px-1">
              <FilterOptions
                endpoint="parameter"
                value="id"
                label="text"
                filterBy={{ grp: 'STATUS NILAI', subgrp: 'STATUS NILAI' }}
                onChange={(value) =>
                  handleColumnFilterChange('statusdefault', value)
                } // Menangani perubahan nilai di parent
              />
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {props.row.textdefault || ''}
            </div>
          );
        }
      },
      {
        key: 'formatpenerimaan',
        name: 'Format Penerimaan',
        resizable: true,
        draggable: true,
        width: 150,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('formatpenerimaan')}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'formatpenerimaan'
                    ? 'text-red-500'
                    : 'font-normal'
                }`}
              >
                Format Penerimaan
              </p>
              <div className="ml-2">
                {filters.sortBy === 'formatpenerimaan' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'formatpenerimaan' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="text-red-500" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>
            <div className="relative h-[50%] w-full px-1">
              <FilterOptions
                endpoint="parameter"
                value="id"
                label="text"
                filterBy={{ grp: 'PENERIMAAN', subgrp: 'NOMOR PENERIMAAN' }}
                onChange={(value) =>
                  handleColumnFilterChange('formatpenerimaan', value)
                } // Menangani perubahan nilai di parent
              />
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.formatpenerimaantext || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {props.row.formatpenerimaantext || ''}
            </div>
          );
        }
      },
      {
        key: 'formatpengeluaran',
        name: 'Format Pengeluaran',
        resizable: true,
        draggable: true,
        width: 150,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('formatpengeluaran')}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'formatpengeluaran'
                    ? 'text-red-500'
                    : 'font-normal'
                }`}
              >
                Format Pengeluaran
              </p>
              <div className="ml-2">
                {filters.sortBy === 'formatpengeluaran' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'formatpengeluaran' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="text-red-500" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>
            <div className="relative h-[50%] w-full px-1">
              <FilterOptions
                endpoint="parameter"
                value="id"
                label="text"
                filterBy={{ grp: 'PENGELUARAN', subgrp: 'NOMOR PENGELUARAN' }}
                onChange={(value) =>
                  handleColumnFilterChange('formatpengeluaran', value)
                } // Menangani perubahan nilai di parent
              />
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.formatpengeluarantext || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {props.row.formatpengeluarantext || ''}
            </div>
          );
        }
      },
      {
        key: 'formatpenerimaangantung',
        name: 'Format Penerimaan Gantung',
        resizable: true,
        draggable: true,
        width: 150,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('formatpenerimaangantung')}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'formatpenerimaangantung'
                    ? 'text-red-500'
                    : 'font-normal'
                }`}
              >
                Format Penerimaan Gantung
              </p>
              <div className="ml-2">
                {filters.sortBy === 'formatpenerimaangantung' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'formatpenerimaangantung' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="text-red-500" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>
            <div className="relative h-[50%] w-full px-1">
              <FilterOptions
                endpoint="parameter"
                value="id"
                label="text"
                filterBy={{
                  grp: 'PENERIMAAN GANTUNG',
                  subgrp: 'NOMOR PENERIMAAN GANTUNG'
                }}
                onChange={(value) =>
                  handleColumnFilterChange('formatpenerimaangantung', value)
                } // Menangani perubahan nilai di parent
              />
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter =
            filters.filters.formatpenerimaangantungtext || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {props.row.formatpenerimaangantungtext || ''}
            </div>
          );
        }
      },
      {
        key: 'formatpengeluarangantung',
        name: 'Format Pengeluaran Gantung',
        resizable: true,
        draggable: true,
        width: 150,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('formatpengeluarangantung')}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'formatpengeluarangantung'
                    ? 'text-red-500'
                    : 'font-normal'
                }`}
              >
                Format Pengeluaran Gantung
              </p>
              <div className="ml-2">
                {filters.sortBy === 'formatpengeluarangantung' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'formatpengeluarangantung' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="text-red-500" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>
            <div className="relative h-[50%] w-full px-1">
              <FilterOptions
                endpoint="parameter"
                value="id"
                label="text"
                filterBy={{
                  grp: 'PENGELUARAN GANTUNG',
                  subgrp: 'NOMOR PENGELUARAN GANTUNG'
                }}
                onChange={(value) =>
                  handleColumnFilterChange('formatpengeluarangantung', value)
                } // Menangani perubahan nilai di parent
              />
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter =
            filters.filters.formatpengeluarangantungtext || '';

          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {props.row.formatpengeluarangantungtext || ''}
            </div>
          );
        }
      },
      {
        key: 'formatpencairan',
        name: 'Format Pencairan',
        resizable: true,
        draggable: true,
        width: 150,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('formatpencairan')}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'formatpencairan'
                    ? 'text-red-500'
                    : 'font-normal'
                }`}
              >
                Format Pencairan
              </p>
              <div className="ml-2">
                {filters.sortBy === 'formatpencairan' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'formatpencairan' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="text-red-500" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>
            <div className="relative h-[50%] w-full px-1">
              <FilterOptions
                endpoint="parameter"
                value="id"
                label="text"
                filterBy={{
                  grp: 'PENCAIRAN',
                  subgrp: 'NOMOR PENCAIRAN'
                }}
                onChange={(value) =>
                  handleColumnFilterChange('formatpencairan', value)
                } // Menangani perubahan nilai di parent
              />
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.formatpencairantext || '';

          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {props.row.formatpencairantext || ''}
            </div>
          );
        }
      },
      {
        key: 'formatrekappenerimaan',
        name: 'Format Rekap Penerimaan',
        resizable: true,
        draggable: true,
        width: 150,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('formatrekappenerimaan')}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'formatrekappenerimaan'
                    ? 'text-red-500'
                    : 'font-normal'
                }`}
              >
                Format Rekap Penerimaan
              </p>
              <div className="ml-2">
                {filters.sortBy === 'formatrekappenerimaan' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'formatrekappenerimaan' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="text-red-500" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>
            <div className="relative h-[50%] w-full px-1">
              <FilterOptions
                endpoint="parameter"
                value="id"
                label="text"
                filterBy={{
                  grp: 'REKAP PENERIMAAN',
                  subgrp: 'NOMOR REKAP PENERIMAAN'
                }}
                onChange={(value) =>
                  handleColumnFilterChange('formatrekappenerimaan', value)
                } // Menangani perubahan nilai di parent
              />
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.formatrekappenerimaantext || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {props.row.formatrekappenerimaantext || ''}
            </div>
          );
        }
      },
      {
        key: 'formatrekappengeluaran',
        name: 'Format Rekap Pengeluaran',
        resizable: true,
        draggable: true,
        width: 150,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('formatrekappengeluaran')}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'formatrekappengeluaran'
                    ? 'text-red-500'
                    : 'font-normal'
                }`}
              >
                Format Rekap Pengeluaran
              </p>
              <div className="ml-2">
                {filters.sortBy === 'formatrekappengeluaran' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'formatrekappengeluaran' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="text-red-500" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>
            <div className="relative h-[50%] w-full px-1">
              <FilterOptions
                endpoint="parameter"
                value="id"
                label="text"
                filterBy={{
                  grp: 'REKAP PENGELUARAN',
                  subgrp: 'NOMOR REKAP PENGELUARAN'
                }}
                onChange={(value) =>
                  handleColumnFilterChange('formatrekappengeluaran', value)
                } // Menangani perubahan nilai di parent
              />
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.formatrekappengeluarantext || '';

          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {props.row.formatrekappengeluarantext || ''}
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
  }, [filters, checkedRows, isAllSelected, rows, getCoa]);

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
      saveGridConfig(user.id, 'GridBank', [...columnsOrder], newWidthMap);
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

      saveGridConfig(user.id, 'GridBank', [...newOrder], columnsWidth);
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
    if (isLoadingBank || !hasMore || rows.length === 0) return;

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

  function handleCellClick(args: { row: IBank }) {
    const clickedRow = args.row;
    const rowIndex = rows.findIndex((r) => r.id === clickedRow.id);
    if (rowIndex !== -1) {
      setSelectedRow(rowIndex);
    }
  }
  async function handleKeyDown(
    args: CellKeyDownArgs<IBank>,
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
  const onSuccess = async (
    indexOnPage: any,
    pageNumber: any,
    keepOpenModal: any = false
  ) => {
    console.log('sdadsakjhdjkhsa');
    dispatch(setClearLookup(true));
    clearError();
    try {
      if (keepOpenModal) {
        forms.reset();
        setPopOver(true);
      } else {
        forms.reset();
        setPopOver(false);
        setIsFetchingManually(true);
        setRows([]);
        if (mode !== 'delete') {
          const response = await api2.get(`/redis/get/bank-allItems`);
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
      }
    } catch (error) {
      console.error('Error during onSuccess:', error);
      setIsFetchingManually(false);
      setIsDataUpdated(false);
    }
  };
  const onSubmit = async (values: BankInput, keepOpenModal = false) => {
    clearError();
    const selectedRowId = rows[selectedRow]?.id;
    try {
      dispatch(setProcessing());
      if (mode === 'delete') {
        if (selectedRowId) {
          await deleteBank(selectedRowId as unknown as string, {
            onSuccess: () => {
              setPopOver(false);
              setRows((prevRows) =>
                prevRows.filter((row) => row.id !== selectedRowId)
              );
              if (selectedRow === 0) {
                setSelectedRow(selectedRow);
                gridRef?.current?.selectCell({ rowIdx: selectedRow, idx: 1 });
              } else {
                setSelectedRow(selectedRow - 1);
                gridRef?.current?.selectCell({
                  rowIdx: selectedRow - 1,
                  idx: 1
                });
              }
            }
          });
        }
        return;
      }
      if (mode === 'add') {
        const newOrder = await createBank(
          {
            ...values,
            ...filters // Kirim filter ke body/payload
          },
          {
            onSuccess: (data) =>
              onSuccess(data.itemIndex, data.pageNumber, keepOpenModal)
          }
        );

        if (newOrder !== undefined && newOrder !== null) {
        }
        return;
      }
      if (selectedRowId && mode === 'edit') {
        await updateBank(
          {
            id: selectedRowId as unknown as string,
            fields: { ...values, ...filters }
          },
          {
            onSuccess: (data: any) => onSuccess(data.itemIndex, data.pageNumber)
          }
        );
        queryClient.invalidateQueries('bank');
      }
    } catch (error) {
      console.error(error);
    } finally {
      dispatch(setProcessed());
    }
  };

  const handleEdit = () => {
    if (selectedRow !== null) {
      const rowData = rows[selectedRow];
      setPopOver(true);
      setMode('edit');
    }
  };
  const handleDelete = () => {
    if (selectedRow !== null) {
      setMode('delete');
      setPopOver(true);
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

      const response = await exportBankFn(filtersWithoutLimit); // Kirim data tanpa pagination

      // Buat link untuk mendownload file
      const link = document.createElement('a');
      const url = window.URL.createObjectURL(response);
      link.href = url;
      link.download = `laporan_bank${Date.now()}.xlsx`; // Nama file yang diunduh
      link.click(); // Trigger download

      // Revoke URL setelah download
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting bank data:', error);
    }
  };

  // const handleExportBySelect = async () => {
  //   if (checkedRows.size === 0) {
  //     alert({
  //       title: 'PILIH DATA YANG INGIN DI CETAK!',
  //       variant: 'danger',
  //       submitText: 'OK'
  //     });
  //     return; // Stop execution if no rows are selected
  //   }

  //   // Mengubah checkedRows menjadi format JSON
  //   const jsonCheckedRows = Array.from(checkedRows).map((id) => ({ id }));
  //   try {
  //     const response = await exportMenuBySelectFn(jsonCheckedRows);

  //     // Buat link untuk mendownload file
  //     const link = document.createElement('a');
  //     const url = window.URL.createObjectURL(response);
  //     link.href = url;
  //     link.download = `laporan_menu${Date.now()}.xlsx`; // Nama file yang diunduh
  //     link.click(); // Trigger download

  //     // Revoke URL setelah download
  //     window.URL.revokeObjectURL(url);
  //   } catch (error) {
  //     console.error('Error exporting menu data:', error);
  //     alert({
  //       title: 'Failed to generate the export. Please try again.',
  //       variant: 'danger',
  //       submitText: 'OK'
  //     });
  //   }
  // };

  const handleReport = async () => {
    const now = new Date();
    const pad = (n: any) => n.toString().padStart(2, '0');
    const tglcetak = `${pad(now.getDate())}-${pad(
      now.getMonth() + 1
    )}-${now.getFullYear()} ${pad(now.getHours())}:${pad(
      now.getMinutes()
    )}:${pad(now.getSeconds())}`;
    const { page, limit, ...filtersWithoutLimit } = filters;
    const response = await getBankFn(filtersWithoutLimit);
    const reportRows = response.data.map((row) => ({
      ...row,
      judullaporan: 'Laporan Bank',
      usercetak: user.username,
      tglcetak: tglcetak,
      judul: 'PT.TRANSPORINDO AGUNG SEJAHTERA'
    }));

    sessionStorage.setItem(
      'filtersWithoutLimit',
      JSON.stringify(filtersWithoutLimit)
    );

    import('stimulsoft-reports-js/Scripts/stimulsoft.blockly.editor')
      .then((module) => {
        const { Stimulsoft } = module;
        Stimulsoft.Base.StiFontCollection.addOpentypeFontFile(
          '/fonts/ComicNeue-Regular.ttf',
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
        report.loadFile('/reports/LaporanBank.mrt');
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
            window.open('/reports/bank', '_blank');
          }, Stimulsoft.Report.StiExportFormat.Pdf);
        });
      })
      .catch((error) => {
        console.error('Failed to load Stimulsoft:', error);
      });
  };

  // const handleReportBySelect = async () => {
  //   if (checkedRows.size === 0) {
  //     alert({
  //       title: 'PILIH DATA YANG INGIN DI CETAK!',
  //       variant: 'danger',
  //       submitText: 'OK'
  //     });
  //     return; // Stop execution if no rows are selected
  //   }

  //   const jsonCheckedRows = Array.from(checkedRows).map((id) => ({ id }));
  //   try {
  //     const response = await reportMenuBySelectFn(jsonCheckedRows);
  //     const reportRows = response.map((row: any) => ({
  //       ...row,
  //       judullaporan: 'Laporan Menu',
  //       usercetak: user.username,
  //       tglcetak: new Date().toLocaleDateString(),
  //       judul: 'PT.TRANSPORINDO AGUNG SEJAHTERA'
  //     }));
  //     dispatch(setReportData(reportRows));
  //     window.open('/reports/menu', '_blank');
  //   } catch (error) {
  //     console.error('Error generating report:', error);
  //     alert({
  //       title: 'Failed to generate the report. Please try again.',
  //       variant: 'danger',
  //       submitText: 'OK'
  //     });
  //   }
  // };

  document.querySelectorAll('.column-headers').forEach((element) => {
    element.classList.remove('c1kqdw7y7-0-0-beta-47');
  });
  function getRowClass(row: IBank) {
    const rowIndex = rows.findIndex((r) => r.id === row.id);
    return rowIndex === selectedRow ? 'selected-row' : '';
  }

  function rowKeyGetter(row: IBank) {
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
    clearError();
    forms.reset();
  };
  const handleAdd = async () => {
    try {
      // Jalankan API sinkronisasi
      setMode('add');

      setPopOver(true);

      // forms.reset();
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
        'GridBank',
        defaultColumnsOrder,
        defaultColumnsWidth
      );
    }
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        forms.reset(); // Reset the form when the Escape key is pressed
        setMode(''); // Reset the mode to empty
        setPopOver(false);
        clearError();
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
    loadGridConfig(user.id, 'GridBank');
  }, []);
  useEffect(() => {
    setIsFirstLoad(true);
  }, []);
  useEffect(() => {
    if (isFirstLoad && gridRef.current && rows.length > 0) {
      setSelectedRow(0);
      gridRef.current.selectCell({ rowIdx: 0, idx: 1 });
      setIsFirstLoad(false);
    }
  }, [rows, isFirstLoad]);

  useEffect(() => {
    if (!allBank || isFetchingManually || isDataUpdated) return;

    const newRows = allBank.data || [];

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

    if (allBank.pagination.totalPages) {
      setTotalPages(allBank.pagination.totalPages);
    }

    setHasMore(newRows.length === filters.limit);
    setFetchedPages((prev) => new Set(prev).add(currentPage));
    setPrevFilters(filters);
  }, [allBank, currentPage, filters, isFetchingManually, isDataUpdated]);

  useEffect(() => {
    const headerCells = document.querySelectorAll('.rdg-header-row .rdg-cell');
    headerCells.forEach((cell) => {
      cell.setAttribute('tabindex', '-1');
    });
  }, []);
  useEffect(() => {
    if (gridRef.current && dataGridKey) {
      setTimeout(() => {
        gridRef.current?.selectCell({ rowIdx: 0, idx: 1 });
        setIsFirstLoad(false);
      }, 0);
    }
  }, [dataGridKey]);
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
    const rowData = rows[selectedRow];
    if (
      selectedRow !== null &&
      rows.length > 0 &&
      mode !== 'add' &&
      mode !== ''
    ) {
      console.log(rowData);
      forms.setValue('nama', rowData.nama);
      forms.setValue('keterangan', rowData.keterangan);

      forms.setValue('coa', rowData.coa !== null ? Number(rowData.coa) : null);
      forms.setValue('keterangancoa', rowData.keterangancoa);

      forms.setValue(
        'coagantung',
        rowData.coagantung !== null ? Number(rowData.coagantung) : null
      );
      forms.setValue('keterangancoagantung', rowData.keterangancoagantung);

      forms.setValue('statusbank', Number(rowData.statusbank));
      forms.setValue('textbank', rowData.textbank);

      forms.setValue('statusaktif', Number(rowData.statusaktif));
      forms.setValue('text', rowData.text);

      forms.setValue('statusdefault', Number(rowData.statusdefault));
      forms.setValue('textdefault', rowData.textdefault);

      forms.setValue('formatpenerimaan', Number(rowData.formatpenerimaan));
      forms.setValue('formatpenerimaantext', rowData.formatpenerimaantext);

      forms.setValue('formatpengeluaran', Number(rowData.formatpengeluaran));
      forms.setValue('formatpengeluarantext', rowData.formatpengeluarantext);

      forms.setValue(
        'formatpenerimaangantung',
        Number(rowData.formatpenerimaangantung)
      );
      forms.setValue(
        'formatpenerimaangantungtext',
        rowData.formatpenerimaangantungtext
      );

      forms.setValue(
        'formatpengeluarangantung',
        Number(rowData.formatpengeluarangantung)
      );
      forms.setValue(
        'formatpengeluarangantungtext',
        rowData.formatpengeluarangantungtext
      );

      forms.setValue('formatpencairan', Number(rowData.formatpencairan));
      forms.setValue('formatpencairantext', rowData.formatpencairantext);

      forms.setValue(
        'formatrekappenerimaan',
        Number(rowData.formatrekappenerimaan)
      );
      forms.setValue(
        'formatrekappenerimaantext',
        rowData.formatrekappenerimaantext
      );

      forms.setValue(
        'formatrekappengeluaran',
        Number(rowData.formatrekappengeluaran)
      );
      forms.setValue(
        'formatrekappengeluarantext',
        rowData.formatrekappengeluarantext
      );
    } else if (selectedRow !== null && rows.length > 0 && mode === 'add') {
      // If in addMode, ensure the form values are cleared
      forms.reset();
    }
  }, [forms, selectedRow, rows, mode]);
  console.log(forms.getValues());
  useEffect(() => {
    // Initialize the refs based on columns dynamically
    columns.forEach((col) => {
      if (!inputColRefs.current[col.key]) {
        inputColRefs.current[col.key] = null;
      }
    });
  }, []);
  useEffect(() => {
    if (isSubmitSuccessful) {
      // reset();
      // Pastikan fokus terjadi setelah repaint
      requestAnimationFrame(() => setFocus('nama'));
    }
  }, [isSubmitSuccessful, setFocus]);
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
          onScroll={handleScroll}
          onSelectedCellChange={(args) => {
            handleCellClick({ row: args.row });
          }}
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
            module="BANK"
            onAdd={handleAdd}
            onDelete={handleDelete}
            onView={handleView}
            onEdit={handleEdit}
            customActions={[
              {
                label: 'Print',
                icon: <FaPrint />,
                onClick: () => handleReport(),
                className: 'bg-cyan-500 hover:bg-cyan-700'
              }
            ]}
            // customActions={[
            //   {
            //     label: 'Resequence',
            //     icon: <FaPlus />, // Custom icon
            //     onClick: () => handleResequence(),
            //     variant: 'success', // Optional styling variant
            //     className: 'bg-purple-700 hover:bg-purple-800' // Additional styling
            //   }
            // ]}
            // dropdownMenus={[
            //   {
            //     label: 'Report',
            //     icon: <FaPrint />,
            //     className: 'bg-cyan-500 hover:bg-cyan-700',
            //     actions: [
            //       {
            //         label: 'REPORT ALL',
            //         onClick: () => handleReport(),
            //         className: 'bg-cyan-500 hover:bg-cyan-700'
            //       }
            //       // ,
            //       // {
            //       //   label: 'REPORT BY SELECT',
            //       //   onClick: () => handleReportBySelect(),
            //       //   className: 'bg-cyan-500 hover:bg-cyan-700'
            //       // }
            //     ]
            //   },
            //   {
            //     label: 'Export',
            //     icon: <FaFileExport />,
            //     className: 'bg-green-600 hover:bg-green-700',
            //     actions: [
            //       {
            //         label: 'EXPORT ALL',
            //         onClick: () => handleExport(),
            //         className: 'bg-green-600 hover:bg-green-700'
            //       }
            //       // ,
            //       // {
            //       //   label: 'EXPORT BY SELECT',
            //       //   // onClick: () => handleExportBySelect(),
            //       //   className: 'bg-green-600 hover:bg-green-700'
            //       // }
            //     ]
            //   }
            // ]}
          />
          {isLoadingBank ? <LoadRowsRenderer /> : null}
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
      <FormBank
        popOver={popOver}
        handleClose={handleClose}
        setPopOver={setPopOver}
        isLoadingUpdate={isLoadingUpdate}
        isLoadingDelete={isLoadingDelete}
        forms={forms}
        mode={mode as any}
        onSubmit={forms.handleSubmit(onSubmit as any)}
        isLoadingCreate={isLoadingCreate}
      />
    </div>
  );
};

export default GridBank;
