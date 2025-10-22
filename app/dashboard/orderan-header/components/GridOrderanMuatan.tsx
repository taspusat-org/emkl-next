'use client';

import Image from 'next/image';
import 'react-data-grid/lib/styles.scss';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import IcClose from '@/public/image/x.svg';
import { ImSpinner2 } from 'react-icons/im';
import { useQueryClient } from 'react-query';
import { Input } from '@/components/ui/input';
import { RootState } from '@/lib/store/store';
import { Button } from '@/components/ui/button';
import { api2 } from '@/lib/utils/AxiosInstance';
import { useSearchParams } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAlert } from '@/lib/store/client/useAlert';
import { useFormError } from '@/lib/hooks/formErrorContext';
import ActionButton from '@/components/custom-ui/ActionButton';
import {
  setHeaderData,
  setUrlApproval
} from '@/lib/store/headerSlice/headerSlice';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FaPrint, FaSort, FaSortDown, FaSortUp, FaTimes } from 'react-icons/fa';
import {
  clearOpenName,
  setClearLookup
} from '@/lib/store/lookupSlice/lookupSlice';
import {
  setProcessed,
  setProcessing
} from '@/lib/store/loadingSlice/loadingSlice';

import DataGrid, {
  CellClickArgs,
  CellKeyDownArgs,
  Column,
  DataGridHandle
} from 'react-data-grid';
import { formatCurrency, formatDateToDDMMYYYY } from '@/lib/utils';
import {
  setDetailDataReport,
  setReportData
} from '@/lib/store/reportSlice/reportSlice';
import FilterOptions from '@/components/custom-ui/FilterOptions';
import { useLainnyaDialog } from '@/lib/store/client/useDialogLainnya';
import { useApprovalDialog } from '@/lib/store/client/useDialogApproval';
import JsxParser from 'react-jsx-parser';
import {
  filterOrderanMuatan,
  OrderanMuatan
} from '@/lib/types/orderanHeader.type';
import { useGetAllBookingOrderanHeader } from '@/lib/server/useBookingOrderanHeader';
import {
  useDeleteOrderanHeader,
  useGetAllOrderanMuatan,
  useUpdateOrderanHeader
} from '@/lib/server/useOrderanHeader';
import { checkValidationOrderanHeaderFn } from '@/lib/apis/orderanHeader.api';
import {
  orderanMuatanInput,
  orderanMuatanSchema
} from '@/lib/validations/orderanheader.validation';
import FormOrderanMuatan from './FormOrderanMuatan';
import { JENISORDERMUATAN, JENISORDERMUATANNAMA } from '@/constants/orderan';

interface Filter {
  page: number;
  limit: number;
  search: string;
  filters: typeof filterOrderanMuatan;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

interface GridConfig {
  columnsOrder: number[];
  columnsWidth: { [key: string]: number };
}

const GridOrderanMuatan = () => {
  const { alert } = useAlert();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { clearError } = useFormError();
  const searchParams = useSearchParams();
  const { successApproved } = useApprovalDialog();

  const { user } = useSelector((state: RootState) => state.auth);
  const {
    selectedDate,
    selectedDate2,
    selectedJenisOrderan,
    selectedJenisOrderanNama,
    onReload
  } = useSelector((state: RootState) => state.filter);

  const gridRef = useRef<DataGridHandle>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resizeDebounceTimeout = useRef<NodeJS.Timeout | null>(null); // Timer debounce untuk resize
  const inputColRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const abortControllerRef = useRef<AbortController | null>(null); // AbortController untuk cancel request
  const colTimersRef = useRef<
    Map<keyof Filter['filters'], ReturnType<typeof setTimeout>>
  >(new Map());

  const [mode, setMode] = useState<string>('');
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [inputValue, setInputValue] = useState('');
  const [dataGridKey, setDataGridKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [popOver, setPopOver] = useState<boolean>(false);
  const [addMode, setAddMode] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<boolean>(false);
  const [isDataUpdated, setIsDataUpdated] = useState(false);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [selectedCol, setSelectedCol] = useState<number>(0);
  const [deleteMode, setDeleteMode] = useState<boolean>(false);
  const [reloadForm, setReloadForm] = useState<boolean>(false);
  const [rows, setRows] = useState<OrderanMuatan[]>([]);
  const [isFetchingManually, setIsFetchingManually] = useState(false);
  const [checkedRows, setCheckedRows] = useState<Set<number>>(new Set());
  const [columnsOrder, setColumnsOrder] = useState<readonly number[]>([]);
  const [fetchedPages, setFetchedPages] = useState<Set<number>>(new Set([1]));
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [columnsWidth, setColumnsWidth] = useState<{ [key: string]: number }>(
    {}
  );
  const [filters, setFilters] = useState<Filter>({
    page: 1,
    limit: 30,
    filters: {
      ...filterOrderanMuatan,
      tglDari: selectedDate,
      tglSampai: selectedDate2,
      jenisOrderan: String(selectedJenisOrderan)
    },
    search: '',
    sortBy: 'nobukti',
    sortDirection: 'asc'
  });
  const [prevFilters, setPrevFilters] = useState<Filter>(filters);

  console.log(
    'selectedJenisOrderan',
    selectedJenisOrderan,
    selectedDate,
    selectedDate2,
    'selectedJenisOrderanNama',
    selectedJenisOrderanNama,
    'filters',
    filters
  );

  const {
    data: allDataOrderanMuatan,
    isLoading: isLoadingOrderanMuatan,
    refetch
  } = useGetAllOrderanMuatan(
    { ...filters, page: currentPage },
    abortControllerRef.current?.signal
  );

  const { mutateAsync: updateOrderanMuatan, isLoading: isLoadingUpdate } =
    useUpdateOrderanHeader();
  const { mutateAsync: deleteOrderanMuatan, isLoading: isLoadingDelete } =
    useDeleteOrderanHeader();

  const forms = useForm<orderanMuatanInput>({
    resolver: zodResolver(orderanMuatanSchema),
    mode: 'onSubmit',
    defaultValues: {
      nobukti: ''
    }
  });

  const {
    setFocus,
    reset,
    formState: { isSubmitSuccessful }
  } = forms;

  const cancelPreviousRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController(); // Buat AbortController baru untuk request berikutnya
  };

  const handleColumnFilterChange = (
    colKey: keyof Filter['filters'],
    value: string
  ) => {
    // Set timeout baru untuk debounce
    // Cancel request sebelumnya jika ada
    cancelPreviousRequest();

    // Logika yang ada pada handleColumnFilterChange sebelumnya
    const originalIndex = columns.findIndex((col) => col.key === colKey);
    const displayIndex =
      columnsOrder.length > 0
        ? columnsOrder.findIndex((idx) => idx === originalIndex)
        : originalIndex;

    setFilters((prev) => ({
      ...prev,
      filters: { ...prev.filters, [colKey]: value },
      search: '',
      page: 1
    }));

    setInputValue('');
    setCheckedRows(new Set());
    setIsAllSelected(false);

    setTimeout(() => {
      gridRef?.current?.selectCell({ rowIdx: 0, idx: displayIndex });
    }, 100);

    setTimeout(() => {
      const ref = inputColRefs.current[colKey];
      ref?.focus();
    }, 200);

    setSelectedRow(0);
    setCurrentPage(1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    // Langsung update input value tanpa debounce
    setInputValue(searchValue);

    // Menunggu beberapa waktu sebelum update filter
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      // Mengupdate filter setelah debounce
      setCurrentPage(1);
      setFilters((prev) => ({
        ...prev,
        filters: filterOrderanMuatan, // Gunakan filter yang relevan
        tglDari: selectedDate,
        tglSampai: selectedDate2,
        jenisOrderan: String(selectedJenisOrderan),
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
    }, 300); // Mengatur debounce hanya untuk update filter
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

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY });
  };

  const columns = useMemo((): Column<OrderanMuatan>[] => {
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
                  filters: filterOrderanMuatan
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
        renderCell: ({ row }: { row: OrderanMuatan }) => (
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
        name: 'nobukti',
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
                no bukti
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
        name: 'tglbukti',
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
                tgl bukti
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
        key: 'jenisorder',
        name: 'jenisorder',
        resizable: true,
        draggable: true,
        headerCellClass: 'column-headers',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('jenisorder_text')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'jenisorder'
                    ? 'text-red-500'
                    : 'font-normal'
                }`}
              >
                JENIS ORDERAN
              </p>
              <div className="ml-2">
                {filters.sortBy === 'jenisorder_text' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'jenisorder_text' &&
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
                  inputColRefs.current['jenisorder'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.jenisorder_text.toUpperCase() || ''}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  handleColumnFilterChange('jenisorder_text', value);
                }}
              />
              {filters.filters.jenisorder_text && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() =>
                    handleColumnFilterChange('jenisorder_text', '')
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
          const columnFilter = filters.filters.jenisorder_text || '';
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.jenisorder_nama !== null &&
                  props.row.jenisorder_nama !== undefined
                  ? props.row.jenisorder_nama
                  : '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'container',
        name: 'container',
        resizable: true,
        draggable: true,
        headerCellClass: 'column-headers',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('container_text')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'container'
                    ? 'text-red-500'
                    : 'font-normal'
                }`}
              >
                CONTAINER
              </p>
              <div className="ml-2">
                {filters.sortBy === 'container_text' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'container_text' &&
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
                  inputColRefs.current['container'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.container_text.toUpperCase() || ''}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  handleColumnFilterChange('container_text', value);
                }}
              />
              {filters.filters.container_text && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('container_text', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.container_text || '';
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.container_nama !== null &&
                  props.row.container_nama !== undefined
                  ? props.row.container_nama
                  : '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'shipper',
        name: 'shipper',
        resizable: true,
        draggable: true,
        headerCellClass: 'column-headers',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('shipper_text')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'shipper' ? 'text-red-500' : 'font-normal'
                }`}
              >
                SHIPPER
              </p>
              <div className="ml-2">
                {filters.sortBy === 'shipper_text' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'shipper_text' &&
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
                  inputColRefs.current['shipper'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.shipper_text.toUpperCase() || ''}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  handleColumnFilterChange('shipper_text', value);
                }}
              />
              {filters.filters.shipper_text && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('shipper_text', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.shipper_text || '';
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.shipper_nama !== null &&
                  props.row.shipper_nama !== undefined
                  ? props.row.shipper_nama
                  : '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'tujuankapal',
        name: 'tujuankapal',
        resizable: true,
        draggable: true,
        headerCellClass: 'column-headers',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('tujuankapal_text')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'tujuankapal'
                    ? 'text-red-500'
                    : 'font-normal'
                }`}
              >
                TUJUAN KAPAL
              </p>
              <div className="ml-2">
                {filters.sortBy === 'tujuankapal_text' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'tujuankapal_text' &&
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
                  inputColRefs.current['tujuankapal'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.tujuankapal_text.toUpperCase() || ''}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  handleColumnFilterChange('tujuankapal_text', value);
                }}
              />
              {filters.filters.tujuankapal_text && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() =>
                    handleColumnFilterChange('tujuankapal_text', '')
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
          const columnFilter = filters.filters.tujuankapal_text || '';
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.tujuankapal_nama !== null &&
                  props.row.tujuankapal_nama !== undefined
                  ? props.row.tujuankapal_nama
                  : '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'marketing',
        name: 'marketing',
        resizable: true,
        draggable: true,
        headerCellClass: 'column-headers',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('marketing_text')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'marketing'
                    ? 'text-red-500'
                    : 'font-normal'
                }`}
              >
                MARKETING
              </p>
              <div className="ml-2">
                {filters.sortBy === 'marketing_text' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'marketing_text' &&
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
                  inputColRefs.current['marketing'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.marketing_text.toUpperCase() || ''}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  handleColumnFilterChange('marketing_text', value);
                }}
              />
              {filters.filters.marketing_text && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('marketing_text', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.marketing_text || '';
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.marketing_nama !== null &&
                  props.row.marketing_nama !== undefined
                  ? props.row.marketing_nama
                  : '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'keterangan',
        name: 'keterangan',
        resizable: true,
        draggable: true,
        width: 300,
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
                KETERANGAN
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
                  const value = e.target.value.toUpperCase(); // Menjadikan input menjadi uppercase
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
        key: 'schedule',
        name: 'schedule',
        resizable: true,
        draggable: true,
        headerCellClass: 'column-headers',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('schedule_text')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'schedule' ? 'text-red-500' : 'font-normal'
                }`}
              >
                SCHEDULE
              </p>
              <div className="ml-2">
                {filters.sortBy === 'schedule_text' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'schedule_text' &&
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
                  inputColRefs.current['schedule'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.schedule_text.toUpperCase() || ''}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  handleColumnFilterChange('schedule_text', value);
                }}
              />
              {filters.filters.schedule_text && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('schedule_text', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.schedule_text || '';
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.schedule_nama !== null &&
                  props.row.schedule_nama !== undefined
                  ? props.row.schedule_nama
                  : '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'pelayarancontainer',
        name: 'pelayarancontainer',
        resizable: true,
        draggable: true,
        headerCellClass: 'column-headers',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('pelayarancontainer_text')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'pelayarancontainer'
                    ? 'text-red-500'
                    : 'font-normal'
                }`}
              >
                PELAYARAN CONTAINER
              </p>
              <div className="ml-2">
                {filters.sortBy === 'pelayarancontainer_text' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'pelayarancontainer_text' &&
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
                  inputColRefs.current['pelayarancontainer'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none"
                value={
                  filters.filters.pelayarancontainer_text.toUpperCase() || ''
                }
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  handleColumnFilterChange('pelayarancontainer_text', value);
                }}
              />
              {filters.filters.pelayarancontainer_text && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() =>
                    handleColumnFilterChange('pelayarancontainer_text', '')
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
          const columnFilter = filters.filters.pelayarancontainer_text || '';
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.pelayarancontainer_nama !== null &&
                  props.row.pelayarancontainer_nama !== undefined
                  ? props.row.pelayarancontainer_nama
                  : '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'jenismuatan',
        name: 'jenismuatan',
        resizable: true,
        draggable: true,
        headerCellClass: 'column-headers',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('jenismuatan_text')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'jenismuatan'
                    ? 'text-red-500'
                    : 'font-normal'
                }`}
              >
                JENIS MUATAN
              </p>
              <div className="ml-2">
                {filters.sortBy === 'jenismuatan_text' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'jenismuatan_text' &&
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
                  inputColRefs.current['jenismuatan'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.jenismuatan_text.toUpperCase() || ''}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  handleColumnFilterChange('jenismuatan_text', value);
                }}
              />
              {filters.filters.jenismuatan_text && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() =>
                    handleColumnFilterChange('jenismuatan_text', '')
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
          const columnFilter = filters.filters.jenismuatan_text || '';
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.jenismuatan_nama !== null &&
                  props.row.jenismuatan_nama !== undefined
                  ? props.row.jenismuatan_nama
                  : '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'sandarkapal',
        name: 'sandarkapal',
        resizable: true,
        draggable: true,
        headerCellClass: 'column-headers',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('sandarkapal_text')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'sandarkapal'
                    ? 'text-red-500'
                    : 'font-normal'
                }`}
              >
                SANDAR KAPAL
              </p>
              <div className="ml-2">
                {filters.sortBy === 'sandarkapal_text' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'sandarkapal_text' &&
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
                  inputColRefs.current['sandarkapal'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.sandarkapal_text.toUpperCase() || ''}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  handleColumnFilterChange('sandarkapal_text', value);
                }}
              />
              {filters.filters.sandarkapal_text && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() =>
                    handleColumnFilterChange('sandarkapal_text', '')
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
          const columnFilter = filters.filters.sandarkapal_text || '';
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.sandarkapal_nama !== null &&
                  props.row.sandarkapal_nama !== undefined
                  ? props.row.sandarkapal_nama
                  : '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'nopolisi',
        name: 'nopolisi',
        resizable: true,
        draggable: true,
        width: 300,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('nopolisi')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'nopolisi' ? 'text-red-500' : 'font-normal'
                }`}
              >
                NO POLISI
              </p>
              <div className="ml-2">
                {filters.sortBy === 'nopolisi' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'nopolisi' &&
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
                  inputColRefs.current['nopolisi'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none text-sm"
                value={
                  filters.filters.nopolisi
                    ? filters.filters.nopolisi.toUpperCase()
                    : ''
                }
                type="text"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase(); // Menjadikan input menjadi uppercase
                  handleColumnFilterChange('nopolisi', value);
                }}
              />
              {filters.filters.nopolisi && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('nopolisi', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.nopolisi || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.nopolisi || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'nosp',
        name: 'nosp',
        resizable: true,
        draggable: true,
        width: 300,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('nosp')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'nosp' ? 'text-red-500' : 'font-normal'
                }`}
              >
                NO SP
              </p>
              <div className="ml-2">
                {filters.sortBy === 'nosp' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'nosp' &&
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
                  inputColRefs.current['nosp'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none text-sm"
                value={
                  filters.filters.nosp ? filters.filters.nosp.toUpperCase() : ''
                }
                type="text"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase(); // Menjadikan input menjadi uppercase
                  handleColumnFilterChange('nosp', value);
                }}
              />
              {filters.filters.nosp && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('nosp', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.nosp || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.nosp || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'nocontainer',
        name: 'nocontainer',
        resizable: true,
        draggable: true,
        width: 300,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('nocontainer')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'nocontainer'
                    ? 'text-red-500'
                    : 'font-normal'
                }`}
              >
                NO CONTAINER
              </p>
              <div className="ml-2">
                {filters.sortBy === 'nocontainer' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'nocontainer' &&
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
                  inputColRefs.current['nocontainer'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none text-sm"
                value={
                  filters.filters.nocontainer
                    ? filters.filters.nocontainer.toUpperCase()
                    : ''
                }
                type="text"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase(); // Menjadikan input menjadi uppercase
                  handleColumnFilterChange('nocontainer', value);
                }}
              />
              {filters.filters.nocontainer && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('nocontainer', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.nocontainer || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.nocontainer || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'noseal',
        name: 'noseal',
        resizable: true,
        draggable: true,
        width: 300,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('noseal')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'noseal' ? 'text-red-500' : 'font-normal'
                }`}
              >
                NO SEAL
              </p>
              <div className="ml-2">
                {filters.sortBy === 'noseal' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'noseal' &&
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
                  inputColRefs.current['noseal'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none text-sm"
                value={
                  filters.filters.noseal
                    ? filters.filters.noseal.toUpperCase()
                    : ''
                }
                type="text"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase(); // Menjadikan input menjadi uppercase
                  handleColumnFilterChange('noseal', value);
                }}
              />
              {filters.filters.noseal && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('noseal', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.noseal || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.noseal || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'lokasistuffing',
        name: 'lokasistuffing',
        resizable: true,
        draggable: true,
        headerCellClass: 'column-headers',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('lokasistuffing_text')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'lokasistuffing'
                    ? 'text-red-500'
                    : 'font-normal'
                }`}
              >
                LOKASI STUFFING
              </p>
              <div className="ml-2">
                {filters.sortBy === 'lokasistuffing_text' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'lokasistuffing_text' &&
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
                  inputColRefs.current['lokasistuffing'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.lokasistuffing_text.toUpperCase() || ''}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  handleColumnFilterChange('lokasistuffing_text', value);
                }}
              />
              {filters.filters.lokasistuffing_text && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() =>
                    handleColumnFilterChange('lokasistuffing_text', '')
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
          const columnFilter = filters.filters.lokasistuffing_text || '';
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.lokasistuffing_nama !== null &&
                  props.row.lokasistuffing_nama !== undefined
                  ? props.row.lokasistuffing_nama
                  : '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'nominalstuffing',
        name: 'nominalstuffing',
        resizable: true,
        draggable: true,
        width: 300,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('nominalstuffing')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'nominalstuffing'
                    ? 'text-red-500'
                    : 'font-normal'
                }`}
              >
                NOMINAL STUFFING
              </p>
              <div className="ml-2">
                {filters.sortBy === 'nominalstuffing' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'nominalstuffing' &&
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
                  inputColRefs.current['nominalstuffing'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none text-sm"
                value={
                  filters.filters.nominalstuffing
                    ? filters.filters.nominalstuffing.toUpperCase()
                    : ''
                }
                type="text"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase(); // Menjadikan input menjadi uppercase
                  handleColumnFilterChange('nominalstuffing', value);
                }}
              />
              {filters.filters.nominalstuffing && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() =>
                    handleColumnFilterChange('nominalstuffing', '')
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
          const columnFilter = filters.filters.nominalstuffing || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {props.row.nominalstuffing != null &&
              props.row.nominalstuffing !== ''
                ? highlightText(
                    formatCurrency(props.row.nominalstuffing) || '',
                    filters.search,
                    columnFilter
                  )
                : ''}
            </div>
          );
        }
      },
      {
        key: 'emkllain',
        name: 'emkllain',
        resizable: true,
        draggable: true,
        headerCellClass: 'column-headers',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('emkllain_text')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'emkllain' ? 'text-red-500' : 'font-normal'
                }`}
              >
                EMKL LAIN
              </p>
              <div className="ml-2">
                {filters.sortBy === 'emkllain_text' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'emkllain_text' &&
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
                  inputColRefs.current['emkllain'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.emkllain_text.toUpperCase() || ''}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  handleColumnFilterChange('emkllain_text', value);
                }}
              />
              {filters.filters.emkllain_text && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('emkllain_text', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.emkllain_text || '';
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.emkllain_nama !== null &&
                  props.row.emkllain_nama !== undefined
                  ? props.row.emkllain_nama
                  : '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'asalmuatan',
        name: 'asalmuatan',
        resizable: true,
        draggable: true,
        width: 300,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('asalmuatan')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'asalmuatan'
                    ? 'text-red-500'
                    : 'font-normal'
                }`}
              >
                ASAL MUATAN
              </p>
              <div className="ml-2">
                {filters.sortBy === 'asalmuatan' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'asalmuatan' &&
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
                  inputColRefs.current['asalmuatan'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none text-sm"
                value={
                  filters.filters.asalmuatan
                    ? filters.filters.asalmuatan.toUpperCase()
                    : ''
                }
                type="text"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase(); // Menjadikan input menjadi uppercase
                  handleColumnFilterChange('asalmuatan', value);
                }}
              />
              {filters.filters.asalmuatan && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('asalmuatan', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.asalmuatan || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.asalmuatan || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'daftarbl',
        name: 'daftarbl',
        resizable: true,
        draggable: true,
        headerCellClass: 'column-headers',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('daftarbl_text')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'daftarbl' ? 'text-red-500' : 'font-normal'
                }`}
              >
                DAFTAR BL
              </p>
              <div className="ml-2">
                {filters.sortBy === 'daftarbl_text' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'daftarbl_text' &&
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
                  inputColRefs.current['daftarbl'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.daftarbl_text.toUpperCase() || ''}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  handleColumnFilterChange('daftarbl_text', value);
                }}
              />
              {filters.filters.daftarbl_text && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('daftarbl_text', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.daftarbl_text || '';
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.daftarbl_nama !== null &&
                  props.row.daftarbl_nama !== undefined
                  ? props.row.daftarbl_nama
                  : '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'comodity',
        name: 'comodity',
        resizable: true,
        draggable: true,
        width: 300,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('comodity')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'comodity' ? 'text-red-500' : 'font-normal'
                }`}
              >
                COMODITY
              </p>
              <div className="ml-2">
                {filters.sortBy === 'comodity' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'comodity' &&
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
                  inputColRefs.current['comodity'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none text-sm"
                value={
                  filters.filters.comodity
                    ? filters.filters.comodity.toUpperCase()
                    : ''
                }
                type="text"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase(); // Menjadikan input menjadi uppercase
                  handleColumnFilterChange('comodity', value);
                }}
              />
              {filters.filters.comodity && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('comodity', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.comodity || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.comodity || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'gandengan',
        name: 'gandengan',
        resizable: true,
        draggable: true,
        width: 300,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('gandengan')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'gandengan'
                    ? 'text-red-500'
                    : 'font-normal'
                }`}
              >
                GANDENGAN
              </p>
              <div className="ml-2">
                {filters.sortBy === 'gandengan' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'gandengan' &&
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
                  inputColRefs.current['gandengan'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none text-sm"
                value={
                  filters.filters.gandengan
                    ? filters.filters.gandengan.toUpperCase()
                    : ''
                }
                type="text"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase(); // Menjadikan input menjadi uppercase
                  handleColumnFilterChange('gandengan', value);
                }}
              />
              {filters.filters.gandengan && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('gandengan', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.gandengan || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.gandengan || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'tradoluar',
        name: 'tradoluar',
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
              <p className="text-sm font-normal">STATUS TRADO LUAR</p>
            </div>
            <div className="relative h-[50%] w-full px-1">
              <FilterOptions
                endpoint="parameter"
                value="id"
                label="text"
                filterBy={{ grp: 'STATUS NILAI', subgrp: 'STATUS NILAI' }}
                onChange={(value) =>
                  handleColumnFilterChange('tradoluar_text', value)
                } // Menangani perubahan nilai di parent
              />
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const memoData = props.row.tradoluar_memo
            ? JSON.parse(props.row.tradoluar_memo)
            : null;
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
          return <div className="text-xs text-gray-500"></div>;
        }
      },
      {
        key: 'pisahbl',
        name: 'pisahbl',
        resizable: true,
        draggable: true,
        width: 100,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onContextMenu={handleContextMenu}
            >
              <p className="text-sm font-normal">PISAH BL</p>
            </div>
            <div className="relative h-[50%] w-full px-1">
              <FilterOptions
                endpoint="parameter"
                value="id"
                label="text"
                filterBy={{ grp: 'STATUS NILAI', subgrp: 'STATUS NILAI' }}
                onChange={(value) =>
                  handleColumnFilterChange('pisahbl_text', value)
                } // Menangani perubahan nilai di parent
              />
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const memoData = props.row.pisahbl_memo
            ? JSON.parse(props.row.pisahbl_memo)
            : null;
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
          return <div className="text-xs text-gray-500"></div>;
        }
      },
      {
        key: 'jobptd',
        name: 'jobptd',
        resizable: true,
        draggable: true,
        width: 100,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onContextMenu={handleContextMenu}
            >
              <p className="text-sm font-normal">JOB PTD</p>
            </div>
            <div className="relative h-[50%] w-full px-1">
              <FilterOptions
                endpoint="parameter"
                value="id"
                label="text"
                filterBy={{ grp: 'STATUS NILAI', subgrp: 'STATUS NILAI' }}
                onChange={(value) =>
                  handleColumnFilterChange('jobptd_text', value)
                } // Menangani perubahan nilai di parent
              />
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const memoData = props.row.jobptd_memo
            ? JSON.parse(props.row.jobptd_memo)
            : null;
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
          return <div className="text-xs text-gray-500"></div>;
        }
      },
      {
        key: 'transit',
        name: 'transit',
        resizable: true,
        draggable: true,
        width: 100,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onContextMenu={handleContextMenu}
            >
              <p className="text-sm font-normal">TRANSIT</p>
            </div>
            <div className="relative h-[50%] w-full px-1">
              <FilterOptions
                endpoint="parameter"
                value="id"
                label="text"
                filterBy={{ grp: 'STATUS NILAI', subgrp: 'STATUS NILAI' }}
                onChange={(value) =>
                  handleColumnFilterChange('transit_text', value)
                } // Menangani perubahan nilai di parent
              />
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const memoData = props.row.transit_memo
            ? JSON.parse(props.row.transit_memo)
            : null;
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
          return <div className="text-xs text-gray-500"></div>;
        }
      },
      {
        key: 'stuffingdepo',
        name: 'stuffingdepo',
        resizable: true,
        draggable: true,
        width: 100,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onContextMenu={handleContextMenu}
            >
              <p className="text-sm font-normal">STUFFING DEPO</p>
            </div>
            <div className="relative h-[50%] w-full px-1">
              <FilterOptions
                endpoint="parameter"
                value="id"
                label="text"
                filterBy={{ grp: 'STATUS NILAI', subgrp: 'STATUS NILAI' }}
                onChange={(value) =>
                  handleColumnFilterChange('stuffingdepo_text', value)
                } // Menangani perubahan nilai di parent
              />
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const memoData = props.row.stuffingdepo_memo
            ? JSON.parse(props.row.stuffingdepo_memo)
            : null;
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
          return <div className="text-xs text-gray-500"></div>;
        }
      },
      {
        key: 'opendoor',
        name: 'opendoor',
        resizable: true,
        draggable: true,
        width: 100,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onContextMenu={handleContextMenu}
            >
              <p className="text-sm font-normal">OPEN DOOR</p>
            </div>
            <div className="relative h-[50%] w-full px-1">
              <FilterOptions
                endpoint="parameter"
                value="id"
                label="text"
                filterBy={{ grp: 'STATUS NILAI', subgrp: 'STATUS NILAI' }}
                onChange={(value) =>
                  handleColumnFilterChange('opendoor_text', value)
                } // Menangani perubahan nilai di parent
              />
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const memoData = props.row.opendoor_memo
            ? JSON.parse(props.row.opendoor_memo)
            : null;
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
          return <div className="text-xs text-gray-500"></div>;
        }
      },
      {
        key: 'batalmuat',
        name: 'batalmuat',
        resizable: true,
        draggable: true,
        width: 100,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onContextMenu={handleContextMenu}
            >
              <p className="text-sm font-normal">BATAL MUAT</p>
            </div>
            <div className="relative h-[50%] w-full px-1">
              <FilterOptions
                endpoint="parameter"
                value="id"
                label="text"
                filterBy={{ grp: 'STATUS NILAI', subgrp: 'STATUS NILAI' }}
                onChange={(value) =>
                  handleColumnFilterChange('batalmuat_text', value)
                } // Menangani perubahan nilai di parent
              />
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const memoData = props.row.batalmuat_memo
            ? JSON.parse(props.row.batalmuat_memo)
            : null;
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
          return <div className="text-xs text-gray-500"></div>;
        }
      },
      {
        key: 'soc',
        name: 'soc',
        resizable: true,
        draggable: true,
        width: 100,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onContextMenu={handleContextMenu}
            >
              <p className="text-sm font-normal">SOC</p>
            </div>
            <div className="relative h-[50%] w-full px-1">
              <FilterOptions
                endpoint="parameter"
                value="id"
                label="text"
                filterBy={{ grp: 'STATUS NILAI', subgrp: 'STATUS NILAI' }}
                onChange={(value) =>
                  handleColumnFilterChange('soc_text', value)
                } // Menangani perubahan nilai di parent
              />
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const memoData = props.row.soc_memo
            ? JSON.parse(props.row.soc_memo)
            : null;
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
          return <div className="text-xs text-gray-500"></div>;
        }
      },
      {
        key: 'pengurusandoor',
        name: 'pengurusandoor',
        resizable: true,
        draggable: true,
        width: 250,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onContextMenu={handleContextMenu}
            >
              <p className="text-sm font-normal">
                PENGURUSAN DOOR EKSPEDISI LAIN
              </p>
            </div>
            <div className="relative h-[50%] w-full px-1">
              <FilterOptions
                endpoint="parameter"
                value="id"
                label="text"
                filterBy={{ grp: 'STATUS NILAI', subgrp: 'STATUS NILAI' }}
                onChange={(value) =>
                  handleColumnFilterChange('pengurusandoor_text', value)
                } // Menangani perubahan nilai di parent
              />
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const memoData = props.row.pengurusandoor_memo
            ? JSON.parse(props.row.pengurusandoor_memo)
            : null;
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
          return <div className="text-xs text-gray-500"></div>;
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

  const orderedColumns = useMemo(() => {
    if (Array.isArray(columnsOrder) && columnsOrder.length > 0) {
      // Mapping dan filter untuk menghindari undefined
      return columnsOrder
        .map((orderIndex) => columns[orderIndex])
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

  const handleEdit = async () => {
    if (selectedRow === null || checkedRows.size > 0) {
      alert({
        title: 'PILIH DATA YANG INGIN DI EDIT!',
        variant: 'danger',
        submitText: 'OK'
      });
      return;
    }
    if (selectedRow !== null) {
      const rowData = rows[selectedRow];
      const result = await checkValidationOrderanHeaderFn({
        aksi: 'EDIT',
        value: rowData.id,
        jenisOrderan: selectedJenisOrderan
      });
      if (result.data.status == 'failed') {
        alert({
          title: result.data.message,
          variant: 'danger',
          submitText: 'OK'
        });
      } else {
        setPopOver(true);
        setMode('edit');
      }
    }
  };

  const handleMultipleDelete = async (
    idsToDelete: number[],
    nobukti: string
  ) => {
    try {
      for (const id of idsToDelete) {
        // Hapus data satu per satu
        await deleteOrderanMuatan({
          id: id as unknown as string,
          jenisOrderan: String(selectedJenisOrderan),
          nobukti: nobukti
        });
      }

      setRows(
        (
          prevRows // Update state setelah semua data berhasil dihapus
        ) => prevRows.filter((row) => !idsToDelete.includes(row.id))
      );
      setCheckedRows(new Set()); // Reset checked rows
      setIsAllSelected(false);

      // Update selected row
      if (selectedRow >= rows.length - idsToDelete.length) {
        setSelectedRow(Math.max(0, rows.length - idsToDelete.length - 1));
      }

      setTimeout(() => {
        // Focus grid
        gridRef?.current?.selectCell({
          rowIdx: Math.max(0, selectedRow - 1),
          idx: 1
        });
      }, 100);

      alert({
        title: 'Berhasil!',
        variant: 'success',
        submitText: 'OK'
      });
    } catch (error) {
      console.error('Error in handleMultipleDelete:', error);
      alert({
        title: 'Error!',
        variant: 'danger',
        submitText: 'OK'
      });
    }
  };

  const handleDelete = async () => {
    try {
      dispatch(setProcessing());

      if (checkedRows.size === 0) {
        if (selectedRow !== null) {
          const rowData = rows[selectedRow];

          const result = await checkValidationOrderanHeaderFn({
            aksi: 'DELETE',
            value: rowData.id,
            jenisOrderan: selectedJenisOrderan
          });

          if (result.data.status == 'failed') {
            alert({
              title: result.data.message,
              variant: 'danger',
              submitText: 'OK'
            });
          } else {
            setMode('delete');
            setPopOver(true);
          }
        }
      } else {
        const selectedNoBukti = rows[selectedRow]?.nobukti;
        const checkedRowsArray = Array.from(checkedRows);
        const validationPromises = checkedRowsArray.map(async (id) => {
          try {
            const response = await checkValidationOrderanHeaderFn({
              aksi: 'DELETE',
              value: id,
              jenisOrderan: selectedJenisOrderan
            });
            return {
              id,
              canDelete: response.data.status === 'success',
              message: response.data?.message
            };
          } catch (error) {
            return { id, canDelete: false, message: 'Error validating data' };
          }
        });

        const validationResults = await Promise.all(validationPromises);
        const cannotDeleteItems = validationResults.filter(
          (result) => !result.canDelete
        );

        if (cannotDeleteItems.length > 0) {
          const cannotDeleteIds = cannotDeleteItems
            .map((item) => item.id)
            .join(', ');

          alert({
            title: 'Beberapa data tidak dapat dihapus!',
            variant: 'danger',
            submitText: 'OK'
          });
          return;
        }

        try {
          await alert({
            title: 'Apakah anda yakin ingin menghapus data ini ?',
            variant: 'danger',
            submitText: 'YA',
            catchOnCancel: true,
            cancelText: 'TIDAK'
          });

          await handleMultipleDelete(checkedRowsArray, selectedNoBukti);
          dispatch(setProcessed());
        } catch (alertError) {
          dispatch(setProcessed());
          return;
        }
      }
    } catch (error) {
      console.error('Error in handleDelete:', error);
      alert({
        title: 'Error!',
        variant: 'danger',
        submitText: 'OK'
      });
    } finally {
      dispatch(setProcessed());
    }
  };

  const handleView = () => {
    if (selectedRow !== null) {
      setMode('view');
      setPopOver(true);
    }
  };

  const handleClose = () => {
    setPopOver(false);
    setMode('');
    clearError();
    forms.reset();
    setReloadForm(false);
  };

  const handleReport = async () => {
    if (checkedRows.size === 0) {
      alert({
        title: 'PILIH DATA YANG INGIN DI CETAK!',
        variant: 'danger',
        submitText: 'OK'
      });
      return; // Stop execution if no rows are selected
    }
    if (checkedRows.size > 1) {
      alert({
        title: 'HANYA BISA MEMILIH SATU DATA!',
        variant: 'danger',
        submitText: 'OK'
      });
      return; // Stop execution if no rows are selected
    }

    try {
      dispatch(setProcessing());
      const rowId = Array.from(checkedRows)[0];
      const selectedRowNobukti = rows.find((r) => r.id === rowId)?.nobukti;

      // const response = await getBookingOrderanMuatanByIdFn(rowId);
      // const responseDetail = await getPengeluaranEmklDetailFn({
      //   filters: { nobukti: selectedRowNobukti }
      // });
      // const totalNominal = responseDetail.data.reduce(
      //   (sum: number, i: any) => sum + Number(i.nominal || 0),
      //   0
      // );

      // if (response.data === null || response.data.length === 0) {
      //   alert({
      //     title: 'TERJADI KESALAHAN SAAT MEMBUAT LAPORAN!',
      //     variant: 'danger',
      //     submitText: 'OK'
      //   });
      //   return;
      // }
      // const reportRows = response.data.map((row) => ({
      //   ...row,
      //   judullaporan: 'Laporan booking Orderan Muatan',
      //   usercetak: user.username,
      //   tglcetak: new Date().toLocaleDateString(),
      //   // terbilang: numberToTerbilang(totalNominal),
      //   judul: 'PT.TRANSPORINDO AGUNG SEJAHTERA'
      // }));
      // sessionStorage.setItem('dataId', rowId as unknown as string);
      import('stimulsoft-reports-js/Scripts/stimulsoft.blockly.editor')
        .then((module) => {
          const { Stimulsoft } = module;
          Stimulsoft.Base.StiFontCollection.addOpentypeFontFile(
            '/fonts/tahomabd.ttf',
            'TahomaBD'
          );
          Stimulsoft.Base.StiFontCollection.addOpentypeFontFile(
            '/fonts/tahoma.ttf',
            'Tahoma'
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
          report.loadFile('/reports/LaporanPengeluaranKasEmklHeader.mrt');
          report.dictionary.dataSources.clear();
          // dataSet.readJson({ data: reportRows });
          // dataSet.readJson({ detail: responseDetail.data });
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
              window.open('/reports/pengeluaranemklheader', '_blank');
            }, Stimulsoft.Report.StiExportFormat.Pdf);
          });
        })
        .catch((error) => {
          console.error('Failed to load Stimulsoft:', error);
        });
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      dispatch(setProcessed());
    }
  };

  // const handleReport = async () => {
  //   if (checkedRows.size === 0) {
  //     alert({
  //       title: 'PILIH DATA YANG INGIN DI CETAK!',
  //       variant: 'danger',
  //       submitText: 'OK'
  //     });
  //     return; // Stop execution if no rows are selected
  //   }
  //   if (checkedRows.size > 1) {
  //     alert({
  //       title: 'HANYA BISA MEMILIH SATU DATA!',
  //       variant: 'danger',
  //       submitText: 'OK'
  //     });
  //     return; // Stop execution if no rows are selected
  //   }

  //   const rowId = Array.from(checkedRows)[0];
  //   const selectedRowNobukti = rows.find((r) => r.id === rowId)?.nobukti;

  //   const response = await getBookingOrderanMuatanByIdFn(rowId);
  //   // const responseDetail = await getPengeluaranEmklDetailFn({
  //   //   filters: { nobukti: selectedRowNobukti }
  //   // });
  //   // console.log('responseDetail', responseDetail.data);
  //   // const totalNominal = responseDetail.data.reduce(
  //   //   (sum: number, i: any) => sum + Number(i.nominal || 0),
  //   //   0
  //   // );

  //   if (response.data === null || response.data.length === 0) {
  //     alert({
  //       title: 'DATA TIDAK TERSEDIA!',
  //       variant: 'danger',
  //       submitText: 'ok'
  //     });
  //   } else {
  //     const reportRows = response.data.map((row: any) => ({
  //       ...row,
  //       judullaporan: 'Laporan Pengeluaran',
  //       usercetak: user.username,
  //       tglcetak: formatDateToDDMMYYYY(new Date()),
  //       // terbilang: numberToTerbilang(totalNominal),
  //       judul: 'PT.TRANSPORINDO AGUNG SEJAHTERA'
  //     }));
  //     dispatch(setReportData(reportRows));
  //     dispatch(setDetailDataReport(responseDetail.data));
  //     window.open('/reports/designer', '_blank');
  //   }
  // };

  // const handleReport = async () => {
  //   if (checkedRows.size === 0) {
  //     alert({
  //       title: 'PILIH DATA YANG INGIN DI CETAK!',
  //       variant: 'danger',
  //       submitText: 'OK'
  //     });
  //     return; // Stop execution if no rows are selected
  //   }
  //   if (checkedRows.size > 1) {
  //     alert({
  //       title: 'HANYA BISA MEMILIH SATU DATA!',
  //       variant: 'danger',
  //       submitText: 'OK'
  //     });
  //     return; // Stop execution if no rows are selected
  //   }

  //   const rowId = Array.from(checkedRows)[0];
  //   const now = new Date();
  //   const pad = (n: any) => n.toString().padStart(2, '0');
  //   const tglcetak = `${pad(now.getDate())}-${pad(
  //     now.getMonth() + 1
  //   )}-${now.getFullYear()} ${pad(now.getHours())}:${pad(
  //     now.getMinutes()
  //   )}:${pad(now.getSeconds())}`;
  //   const { page, limit, ...filtersWithoutLimit } = filters;
  //   dispatch(setProcessing()); // Show loading overlay when the request starts

  //   try {
  //     const response = await getBookingOrderanMuatanByIdFn(
  //       rowId,
  //       // filtersWithoutLimit
  //     );

  //     console.log('response', response);

  //     // const responseDetail = await getPengeluaranDetailFn(rowId);
  //     const totalNominal = response.data.reduce(
  //       (sum: number, i: any) => sum + Number(i.nominal || 0),
  //       0
  //     );
  //     if (response.data === null || response.data.length === 0) {
  //       alert({
  //         title: 'DATA TIDAK TERSEDIA!',
  //         variant: 'danger',
  //         submitText: 'OK'
  //       });
  //     } else {
  //       const reportRows = response.data.map((row: any) => ({
  //         ...row,
  //         judullaporan: 'PT. TRANSPORINDO AGUNG SEJAHTERA',
  //         usercetak: user.username,
  //         tglcetak,
  //         // terbilang: numberToTerbilang(totalNominal),
  //         judul: `LAPORAN BOOKING ORDERAN MUATAN`
  //       }));
  //       console.log('reportRows', reportRows);
  //       dispatch(setReportData(reportRows));
  //       // dispatch(setDetailDataReport(responseDetail.data));
  //       window.open('/reports/designer', '_blank');
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

  const onSuccess = async (
    indexOnPage: any,
    pageNumber: any,
    keepOpenModal: any = false
  ) => {
    dispatch(setClearLookup(true));
    clearError();

    try {
      if (keepOpenModal) {
        forms.reset();
        setPopOver(true);
      } else {
        forms.reset();
        setPopOver(false);

        // setRows([]);
        if (mode !== 'delete') {
          const response = await api2.get(
            `/redis/get/bookingorderanheader-allItems`
          );
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

        setIsDataUpdated(false);
      }
    } catch (error) {
      console.error('Error during onSuccess:', error);
      setIsDataUpdated(false);
    } finally {
      // dispatch(setClearLookup(false));
      setIsDataUpdated(false);
    }
  };

  const onSubmit = async (
    values: orderanMuatanInput,
    keepOpenModal = false
  ) => {
    clearError();
    const selectedRowId = rows[selectedRow]?.id;
    const selectedRowHeaderId = rows[selectedRow]?.header_id;
    const selectedNoBukti = rows[selectedRow]?.nobukti;

    try {
      dispatch(setProcessing());
      if (mode === 'delete') {
        if (selectedRowId) {
          await deleteOrderanMuatan(
            {
              id: selectedRowId as unknown as string,
              jenisOrderan: String(selectedJenisOrderan),
              nobukti: selectedNoBukti
            },
            {
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
            }
          );
        }
        return;
      }

      if (selectedRowId && mode === 'edit') {
        await updateOrderanMuatan(
          {
            id: selectedRowHeaderId as unknown as string,
            fields: { ...values, ...filters }
          },
          { onSuccess: (data) => onSuccess(data.dataIndex, data.pageNumber) }
        );
        queryClient.invalidateQueries('orderanheader');
      }
    } catch (error) {
      console.error(error);
    } finally {
      dispatch(setProcessed());
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
        'GridOrderanMuatan',
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

      saveGridConfig(user.id, 'GridOrderanMuatan', [...newOrder], columnsWidth);
      return newOrder;
    });
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
        'GridOrderanMuatan',
        defaultColumnsOrder,
        defaultColumnsWidth
      );
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      contextMenuRef.current &&
      !contextMenuRef.current.contains(event.target as Node)
    ) {
      setContextMenu(null);
    }
  };

  document.querySelectorAll('.column-headers').forEach((element) => {
    element.classList.remove('c1kqdw7y7-0-0-beta-47');
  });

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

  function handleCellClick(args: CellClickArgs<OrderanMuatan>) {
    const clickedRow = args.row;
    const rowIndex = rows.findIndex((r) => r.id === clickedRow.id);
    const foundRow = rows.find((r) => r.id === clickedRow?.id);
    if (rowIndex !== -1 && foundRow) {
      setSelectedRow(rowIndex);
      dispatch(setHeaderData(foundRow));
    }
  }

  function LoadRowsRenderer() {
    return (
      <div>
        <ImSpinner2 className="animate-spin text-3xl text-primary" />
      </div>
    );
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

  function getRowClass(row: OrderanMuatan) {
    const rowIndex = rows.findIndex((r) => r.id === row.id);
    return rowIndex === selectedRow ? 'selected-row' : '';
  }

  function rowKeyGetter(row: OrderanMuatan) {
    return row.id;
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
    if (isLoadingOrderanMuatan || !hasMore || rows.length === 0) return;

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

  async function handleKeyDown(
    args: CellKeyDownArgs<OrderanMuatan>,
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

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      colTimersRef.current.forEach((t) => clearTimeout(t));
      colTimersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    setIsFirstLoad(true);
    loadGridConfig(user.id, 'GridOrderanMuatan');
    const rawNobukti = searchParams.get('orderan_nobukti');
    setFilters((prevFilters: Filter) => ({
      ...prevFilters,
      filters: {
        ...prevFilters.filters,
        nobukti: rawNobukti ?? '',
        tglDari: selectedDate,
        tglSampai: selectedDate2,
        jenisOrderan: String(selectedJenisOrderan)
      }
    }));

    // Menambahkan timeout 1 detik sebelum menghapus parameter dari URL
    setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.delete('orderan_nobukti');
      window.history.replaceState({}, '', url.toString());
    }, 1000); // Delay 1 detik (1000 ms)
  }, []);

  useEffect(() => {
    setFilters((prevFilters: Filter) => ({
      ...prevFilters,
      filters: {
        ...prevFilters.filters,
        jenisOrderan: String(selectedJenisOrderan)
      }
    }));
  }, [selectedJenisOrderan, selectedJenisOrderanNama]);

  useEffect(() => {
    if (isFirstLoad && gridRef.current && rows.length > 0) {
      setSelectedRow(0);
      gridRef.current.selectCell({ rowIdx: 0, idx: 1 });
      dispatch(setHeaderData(rows[0]));
      setIsFirstLoad(false);
    }
  }, [rows, isFirstLoad]);

  useEffect(() => {
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
            tglSampai: selectedDate2,
            jenisOrderan: String(selectedJenisOrderan)
          }
        }));
      }
    } else if (onReload) {
      // Jika onReload diklik, update filter tanggal
      if (
        selectedDate !== filters.filters.tglDari ||
        selectedDate2 !== filters.filters.tglSampai
      ) {
        setFilters((prevFilters) => ({
          ...prevFilters,
          filters: {
            ...prevFilters.filters,
            tglDari: selectedDate,
            tglSampai: selectedDate2,
            jenisOrderan: String(selectedJenisOrderan)
          }
        }));
      }
    }
  }, [selectedDate, selectedDate2, filters, onReload, isFirstLoad]);

  useEffect(() => {
    if (!allDataOrderanMuatan || isDataUpdated) return;

    const newRows = allDataOrderanMuatan.data || [];

    setRows((prevRows) => {
      if (currentPage === 1 || filters !== prevFilters) {
        // Reset data jika filter berubah (halaman pertama)
        setCurrentPage(1); // Reset currentPage ke 1
        setFetchedPages(new Set([1])); // Reset fetchedPages ke [1]
        return newRows; // Pakai data baru langsung
      }

      // Tambah data baru di bawah untuk infinite scroll
      if (!fetchedPages.has(currentPage)) {
        return [...prevRows, ...newRows];
      }

      return prevRows;
    });

    if (allDataOrderanMuatan.pagination.totalPages) {
      setTotalPages(allDataOrderanMuatan.pagination.totalPages);
    }

    setHasMore(newRows.length === filters.limit);
    setFetchedPages((prev) => new Set(prev).add(currentPage));
    setIsFirstLoad(false);
    setPrevFilters(filters);
  }, [allDataOrderanMuatan, currentPage, filters, isDataUpdated]);

  useEffect(() => {
    if (rows.length > 0 && selectedRow !== null) {
      const selectedRowData = rows[selectedRow];
      dispatch(setHeaderData(selectedRowData)); // Pastikan data sudah benar
    } else {
      dispatch(setHeaderData({}));
    }
  }, [rows, selectedRow, dispatch]);

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
    if (selectedRow !== null && rows.length > 0 && mode !== 'add') {
      forms.setValue('nobukti', rowData.nobukti);
      forms.setValue('tglbukti', rowData.tglbukti);
      forms.setValue(
        'jenisorder_id',
        Number(selectedJenisOrderan) || JENISORDERMUATAN
      );
      forms.setValue(
        'jenisorder_nama',
        selectedJenisOrderanNama || JENISORDERMUATANNAMA
      );
      forms.setValue('container_id', Number(rowData?.container_id));
      forms.setValue('container_nama', rowData?.container_nama);
      forms.setValue('shipper_id', Number(rowData?.shipper_id));
      forms.setValue('shipper_nama', rowData?.shipper_nama);
      forms.setValue('tujuankapal_id', Number(rowData?.tujuankapal_id));
      forms.setValue('tujuankapal_nama', rowData?.tujuankapal_nama);
      forms.setValue('marketing_id', Number(rowData?.marketing_id));
      forms.setValue('marketing_nama', rowData?.marketing_nama);
      forms.setValue('keterangan', rowData?.keterangan);
      forms.setValue('schedule_id', Number(rowData?.schedule_id));
      forms.setValue('schedule_nama', rowData?.schedule_nama);
      forms.setValue(
        'pelayarancontainer_id',
        Number(rowData?.pelayarancontainer_id)
      );
      forms.setValue(
        'pelayarancontainer_nama',
        rowData?.pelayarancontainer_nama
      );
      forms.setValue('jenismuatan_id', Number(rowData?.jenismuatan_id));
      forms.setValue('jenismuatan_nama', rowData?.jenismuatan_nama);
      forms.setValue('sandarkapal_id', Number(rowData?.sandarkapal_id));
      forms.setValue('sandarkapal_nama', rowData?.sandarkapal_nama);
      forms.setValue('tradoluar', Number(rowData?.tradoluar));
      forms.setValue('tradoluar_nama', rowData?.tradoluar_nama);
      forms.setValue('nopolisi', rowData?.nopolisi);
      forms.setValue('nosp', rowData?.nosp);
      forms.setValue('nocontainer', rowData?.nocontainer);
      forms.setValue('noseal', rowData?.noseal);
      forms.setValue('lokasistuffing', Number(rowData?.lokasistuffing));
      forms.setValue('lokasistuffing_nama', rowData?.lokasistuffing_nama);
      forms.setValue(
        'nominalstuffing',
        rowData.nominalstuffing == null
          ? undefined
          : formatCurrency(rowData?.nominalstuffing)
      );
      forms.setValue('emkllain_id', Number(rowData?.emkllain_id));
      forms.setValue('emkllain_nama', rowData?.emkllain_nama);
      forms.setValue('asalmuatan', rowData?.asalmuatan);
      forms.setValue('daftarbl_id', Number(rowData?.daftarbl_id));
      forms.setValue('daftarbl_nama', rowData?.daftarbl_nama);
      forms.setValue('comodity', rowData?.comodity);
      forms.setValue('gandengan', rowData?.gandengan);
      forms.setValue('pisahbl', Number(rowData?.pisahbl));
      forms.setValue('pisahbl_nama', rowData?.pisahbl_nama);
      forms.setValue('jobptd', Number(rowData?.jobptd));
      forms.setValue('jobptd_nama', rowData?.jobptd_nama);
      forms.setValue('transit', Number(rowData?.transit));
      forms.setValue('transit_nama', rowData?.transit_nama);
      forms.setValue('stuffingdepo', Number(rowData?.stuffingdepo));
      forms.setValue('stuffingdepo_nama', rowData?.stuffingdepo_nama);
      forms.setValue('opendoor', Number(rowData?.opendoor));
      forms.setValue('opendoor_nama', rowData?.opendoor_nama);
      forms.setValue('batalmuat', Number(rowData?.batalmuat));
      forms.setValue('batalmuat_nama', rowData?.batalmuat_nama);
      forms.setValue('soc', Number(rowData?.soc));
      forms.setValue('soc_nama', rowData?.soc_nama);
      forms.setValue(
        'pengurusandoorekspedisilain',
        Number(rowData?.pengurusandoor)
      );
      forms.setValue(
        'pengurusandoorekspedisilain_nama',
        rowData?.pengurusandoor_nama
      );
    }
  }, [forms, selectedRow, rows, mode, popOver]);

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
        // forms.reset();
        setMode(''); // Reset the mode to empty
        clearError();
        setPopOver(false);
        dispatch(clearOpenName());
        setReloadForm(false);
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

  useEffect(() => {
    if (isSubmitSuccessful) {
      // reset();
      // Pastikan fokus terjadi setelah repaint
      requestAnimationFrame(() => setFocus('tglbukti'));
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
              className="overflow m-2 h-[28px] w-[200px] rounded-sm bg-white text-black"
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
            module="ORDERANMUATAN"
            checkedRows={checkedRows}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            customActions={[
              {
                label: 'Print',
                icon: <FaPrint />,
                onClick: () => handleReport(),
                className: 'bg-cyan-500 hover:bg-cyan-700'
              }
            ]}
          />
          {isLoadingOrderanMuatan ? <LoadRowsRenderer /> : null}
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
      <FormOrderanMuatan
        popOver={popOver}
        handleClose={handleClose}
        setPopOver={setPopOver}
        // isLoadingCreate={isLoadingCreate}
        isLoadingUpdate={isLoadingUpdate}
        // isLoadingDelete={isLoadingDelete}
        forms={forms}
        mode={mode}
        onSubmit={forms.handleSubmit(onSubmit as any)}
      />
    </div>
  );
};

export default GridOrderanMuatan;
