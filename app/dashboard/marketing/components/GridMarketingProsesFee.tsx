'use client';

import Image from 'next/image';
import 'react-data-grid/lib/styles.scss';
import { useForm } from 'react-hook-form';
import { FaPencil } from 'react-icons/fa6';
import IcClose from '@/public/image/x.svg';
import { ImSpinner2 } from 'react-icons/im';
import { Input } from '@/components/ui/input';
import { RootState } from '@/lib/store/store';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSelector, useDispatch } from 'react-redux';
import FormMarketingDetail from './FormMarketingDetail';
import { useEffect, useMemo, useRef, useState } from 'react';
import ActionButton from '@/components/custom-ui/ActionButton';
import { CellClickArgs, CellKeyDownArgs } from 'react-data-grid';
import FilterOptions from '@/components/custom-ui/FilterOptions';
import DataGrid, { Column, DataGridHandle } from 'react-data-grid';
import {
  clearOpenName,
  setClearLookup
} from '@/lib/store/lookupSlice/lookupSlice';
import { setDetailData } from '@/lib/store/headerSlice/headerSlice';
import { FaSort, FaSortDown, FaSortUp, FaTimes } from 'react-icons/fa';
import {
  useCreateMarketingDetail,
  useGetMarketingProsesFee
} from '@/lib/server/useMarketingHeader';
import {
  filterMarketingProsesFee,
  MarketingProsesFee
} from '@/lib/types/marketingheader.type';
import {
  MarketingDetailInput,
  marketingdetailSchema
} from '@/lib/validations/marketing.validation';
import { useFormError } from '@/lib/hooks/formErrorContext';
import { checkValidationEditmarketingDetailFn } from '@/lib/apis/marketingheader.api';
import { useAlert } from '@/lib/store/client/useAlert';

interface GridProps {
  activeTab: string; // Menerima props activeTab
}

interface GridConfig {
  columnsOrder: number[];
  columnsWidth: { [key: string]: number };
}

interface Filter {
  page: number;
  limit: number;
  search: string;
  filters: typeof filterMarketingProsesFee;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

const GridMarketingProsesFee = ({ activeTab }: GridProps) => {
  const { alert } = useAlert();
  const dispatch = useDispatch();
  const { clearError } = useFormError();
  const { user } = useSelector((state: RootState) => state.auth);
  const headerData = useSelector((state: RootState) => state.header.headerData);
  const gridRef = useRef<DataGridHandle>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const resizeDebounceTimeout = useRef<NodeJS.Timeout | null>(null); // Timer debounce untuk resize
  const inputColRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [dataGridKey, setDataGridKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [popOver, setPopOver] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [rows, setRows] = useState<MarketingProsesFee[]>([]);
  const [columnsOrder, setColumnsOrder] = useState<readonly number[]>([]);
  const [fetchedPages, setFetchedPages] = useState<Set<number>>(new Set([1]));
  const [columnsWidth, setColumnsWidth] = useState<{ [key: string]: number }>(
    {}
  );
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [filters, setFilters] = useState<Filter>({
    page: 1,
    limit: 30,
    search: '',
    filters: filterMarketingProsesFee,
    sortBy: 'marketing_nama',
    sortDirection: 'asc'
  });
  const [prevFilters, setPrevFilters] = useState<Filter>(filters);

  const forms = useForm<MarketingDetailInput>({
    resolver: zodResolver(marketingdetailSchema),
    mode: 'onSubmit',
    defaultValues: {
      // marketing_id: null,
      marketing_nama: '',
      // jenisprosesfee_id: null,
      // statuspotongbiayakantor: 0,
      statuspotongbiayakantor_nama: '',
      statusaktif_nama: '',
      marketingdetail: []
    }
  });

  const {
    data: allDatamarketingProsesFee,
    isLoading: isLoadingMarketingProsesFee,
    refetch
  } = useGetMarketingProsesFee(headerData?.id ?? 0, activeTab, '', {
    ...filters,
    page: 1
  });

  const {
    mutateAsync: createMarketingDetail,
    isLoading: isLoadingCreateMarketingDetail
  } = useCreateMarketingDetail();

  const handleColumnFilterChange = (
    colKey: keyof Filter['filters'],
    value: string
  ) => {
    const originalIndex = columns.findIndex((col) => col.key === colKey); // 1. cari index di array columns asli

    // 2. hitung index tampilan berdasar columnsOrder, jika belum ada reorder (columnsOrder kosong), fallback ke originalIndex
    const displayIndex =
      columnsOrder.length > 0
        ? columnsOrder.findIndex((idx) => idx === originalIndex)
        : originalIndex;

    setFilters((prev) => ({
      // update filter seperti biasa…
      ...prev,
      filters: { ...prev.filters, [colKey]: value },
      search: '',
      page: 1
    }));
    setInputValue('');

    setTimeout(() => {
      // 3. focus sel di grid pakai displayIndex
      gridRef?.current?.selectCell({ rowIdx: 0, idx: displayIndex });
    }, 100);

    setTimeout(() => {
      // 4. focus input filter
      const ref = inputColRefs.current[colKey];
      ref?.focus();
    }, 200);

    setSelectedRow(0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setInputValue(searchValue);
    setFilters((prev) => ({
      ...prev,
      filters: filterMarketingProsesFee,
      search: searchValue,
      page: 1
    }));

    setTimeout(() => {
      gridRef?.current?.selectCell({ rowIdx: 0, idx: 1 });
    }, 100);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 200);

    setSelectedRow(0);
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

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY });
  };

  const columns = useMemo((): Column<MarketingProsesFee>[] => {
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
                    marketing_nama: '',
                    jenisprosesfee_nama: '',
                    statuspotongbiayakantor_nama: '',
                    statusaktif_nama: ''
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
        key: 'marketing',
        name: 'marketing',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('marketing_nama')}
              onContextMenu={handleContextMenu}
            >
              <p className="text-sm font-normal">nama marketing</p>
              <div className="ml-2">
                {filters.sortBy === 'marketing_nama' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'marketing_nama' &&
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
                  inputColRefs.current['marketing_nama'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.marketing_nama.toUpperCase() || ''}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  handleColumnFilterChange('marketing_nama', value);
                }}
              />
              {filters.filters.marketing_nama && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('marketing_nama', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.marketing_nama || '';
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {highlightText(
                props.row.marketing_nama || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'jenisprosesfee',
        name: 'jenisprosesfee',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('jenisprosesfee_nama')}
              onContextMenu={handleContextMenu}
            >
              <p className="text-sm font-normal">Jenis Proses Fee</p>
              <div className="ml-2">
                {filters.sortBy === 'jenisprosesfee_nama' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'jenisprosesfee_nama' &&
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
                  inputColRefs.current['jenisprosesfee'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.jenisprosesfee_nama.toUpperCase() || ''}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  handleColumnFilterChange('jenisprosesfee_nama', value);
                }}
              />
              {filters.filters.jenisprosesfee_nama && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() =>
                    handleColumnFilterChange('jenisprosesfee_nama', '')
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
          const columnFilter = filters.filters.jenisprosesfee_nama || '';
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {highlightText(
                props.row.jenisprosesfee_nama || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'statuspotongbiayakantor',
        name: 'statuspotongbiayakantor',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('statuspotongbiayakantor_nama')}
              onContextMenu={handleContextMenu}
            >
              <p className="text-sm font-normal">status potong biaya kantor</p>
              <div className="ml-2">
                {filters.sortBy === 'statuspotongbiayakantor_nama' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'statuspotongbiayakantor_nama' &&
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
                  inputColRefs.current['statuspotongbiayakantor'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none"
                value={
                  filters.filters.statuspotongbiayakantor_nama.toUpperCase() ||
                  ''
                }
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  handleColumnFilterChange(
                    'statuspotongbiayakantor_nama',
                    value
                  );
                }}
              />
              {filters.filters.statuspotongbiayakantor_nama && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() =>
                    handleColumnFilterChange('statuspotongbiayakantor_nama', '')
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
          const columnFilter =
            filters.filters.statuspotongbiayakantor_nama || '';
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {highlightText(
                props.row.statuspotongbiayakantor_nama || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'statusaktif',
        name: 'statusaktif',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onContextMenu={handleContextMenu}
            >
              <p className="text-sm font-normal">STATUS AKTIF</p>
            </div>
            <div className="relative h-[50%] w-full px-1">
              <FilterOptions
                endpoint="parameter"
                value="id"
                label="text"
                filterBy={{ grp: 'STATUS AKTIF', subgrp: 'STATUS AKTIF' }}
                onChange={(value) =>
                  handleColumnFilterChange('statusaktif_nama', value)
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
      }
    ];
  }, [filters, rows, filters.filters]);

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

  const handleEditMarketingDetail = async () => {
    try {
      if (selectedRow !== null) {
        const rowData = rows[selectedRow];

        const result = await checkValidationEditmarketingDetailFn({
          aksi: 'EDIT',
          value: Number(rowData.id)
        });

        if (result.data.status == 'failed') {
          alert({
            title: result.data.message,
            variant: 'danger',
            submitText: 'OK'
          });
        } else {
          setPopOver(true);
        }
      }
    } catch (error) {
      console.error('Error syncing ACOS:', error);
    }
  };

  const handleClose = () => {
    setPopOver(false);
    forms.reset();
  };

  const onSubmit = async (values: MarketingDetailInput) => {
    const newOrder = await createMarketingDetail(
      {
        ...values,
        marketingdetail: values.marketingdetail.map((detail: any) => ({
          ...detail,
          id: 0
        })),
        ...filters
      },
      {
        onSuccess: (data) => {
          if (data?.id) {
            clearError();
            forms.reset();
            setPopOver(false);
          }
        }
      }
    );

    if (newOrder !== undefined && newOrder !== null) {
    }
    return;
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
        throw new Error('Failed to save grid schedule detail configuration');
      }
    } catch (error) {
      console.error(
        'Failed to save grid schedule detail configuration:',
        error
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
    // 4) Set ulang timer: hanya ketika 300ms sejak resize terakhir berlalu, saveGridConfig akan dipanggil
    resizeDebounceTimeout.current = setTimeout(() => {
      saveGridConfig(
        user.id,
        'GridMarketingProsesFee',
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
        'GridMarketingProsesFee',
        [...newOrder],
        columnsWidth
      );
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

    if (user.id) {
      // Simpan konfigurasi reset ke server (atau backend)
      saveGridConfig(
        user.id,
        'GridMarketingProsesFee',
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
      setColumnsOrder(columns.map((_, index) => index)); // If configuration is not available or error occurs, fallback to original column widths

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

  const handleClickOutside = (event: MouseEvent) => {
    if (
      contextMenuRef.current &&
      !contextMenuRef.current.contains(event.target as Node)
    ) {
      setContextMenu(null);
    }
  };

  async function handleKeyDown(
    args: CellKeyDownArgs<MarketingProsesFee>,
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
      // } else if (event.key === 'ArrowRight') {
      //   setSelectedCol((prev) => {
      //     return Math.min(prev + 1, columns.length - 1);
      //   });
      // } else if (event.key === 'ArrowLeft') {
      //   setSelectedCol((prev) => {
      //     return Math.max(prev - 1, 0);
      //   });
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
    }
  }

  function rowKeyGetter(row: MarketingProsesFee) {
    return Number(row.id);
  }

  function getRowClass(row: MarketingProsesFee) {
    const rowIndex = rows.findIndex((r) => r.id === row.id);
    return rowIndex === selectedRow ? 'selected-row' : '';
  }

  function handleCellClick(args: CellClickArgs<MarketingProsesFee>) {
    const clickedRow = args.row;
    const rowIndex = rows.findIndex((r) => r.id === clickedRow.id);
    const foundRow = rows.find((r) => r.id === clickedRow?.id);
    if (rowIndex !== -1 && foundRow) {
      setSelectedRow(rowIndex);
      dispatch(setDetailData(foundRow));
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
        className="flex h-fit w-full items-center justify-center border border-l-0 border-t-0 border-blue-500 py-1"
        style={{ textAlign: 'center', gridColumn: '1/-1' }}
      >
        <p className="text-gray-400">NO ROWS DATA FOUND</p>
      </div>
    );
  }

  useEffect(() => {
    loadGridConfig(user.id, 'GridMarketingProsesFee'); // useEffect untuk trigger grid yg kesipan di config kalo ada
  }, []);

  useEffect(() => {
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (allDatamarketingProsesFee) {
      const formattedRows = allDatamarketingProsesFee?.data?.map(
        (item: any) => ({
          id: item.id,
          marketing_id: item.marketing_id,
          marketing_nama: item.marketing_nama,
          jenisprosesfee_id: item.jenisprosesfee_id,
          jenisprosesfee_nama: item.jenisprosesfee_nama,
          statuspotongbiayakantor: item.statuspotongbiayakantor,
          statuspotongbiayakantor_nama: item.statuspotongbiayakantor_nama,
          statusaktif: item.statusaktif,
          statusaktif_nama: item.statusaktif_nama,
          memo: item.memo
        })
      );

      setRows(formattedRows);
    } else if (!headerData?.id) {
      setRows([]);
    }
  }, [allDatamarketingProsesFee, headerData?.id]);

  useEffect(() => {
    if (gridRef.current && rows.length > 0) {
      setSelectedRow(0);

      gridRef.current.selectCell({ rowIdx: 0, idx: 1 });
      dispatch(setDetailData(rows[0]));
    }
  }, [rows]);

  useEffect(() => {
    if (rows.length > 0 && selectedRow !== null) {
      const selectedRowData = rows[selectedRow];
      dispatch(setDetailData(selectedRowData)); // Pastikan data sudah benar
    }
  }, [rows, selectedRow, dispatch]);

  useEffect(() => {
    const headerCells = document.querySelectorAll('.rdg-header-row .rdg-cell');
    headerCells.forEach((cell) => {
      cell.setAttribute('tabindex', '-1');
    });
  }, []);

  useEffect(() => {
    if (headerData) {
      refetch();
    }
  }, [headerData]);

  useEffect(() => {
    if (activeTab === 'marketingprosesfee') {
      refetch();
    }
  }, [activeTab, refetch]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // forms.reset(); // Reset the form when the Escape key is pressed
        // setMode(''); // Reset the mode to empty
        setPopOver(false);
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
    if (selectedRow !== null && rows.length > 0) {
      const row = rows[selectedRow];

      forms.setValue(
        'marketing_id',
        row?.marketing_id ? Number(row.marketing_id) : 0
      );
      forms.setValue(
        'marketing_nama',
        row?.marketing_nama ? row.marketing_nama : ''
      );
      forms.setValue('marketingprosesfee_id', row?.id ? Number(row.id) : 0);
      forms.setValue('jenisprosesfee_nama', row?.jenisprosesfee_nama || '');
      forms.setValue(
        'statuspotongbiayakantor_nama',
        row?.statuspotongbiayakantor_nama || ''
      );
      forms.setValue('statusaktif_nama', row?.statusaktif_nama || '');
      forms.setValue('marketingdetail', []);
    }
  }, [popOver, forms, selectedRow, rows]);

  return (
    <div className={`flex h-[100%] w-full justify-center`}>
      <div className="flex h-[100%] w-full flex-col border border-blue-500 bg-white">
        <div
          className="flex h-[38px] w-full flex-row items-center border-b border-blue-500 px-2"
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
          rowClass={getRowClass}
          onCellClick={handleCellClick}
          headerRowHeight={70}
          rowHeight={30}
          className="rdg-light fill-grid text-xs"
          onColumnResize={onColumnResize}
          onColumnsReorder={onColumnsReorder}
          onCellKeyDown={handleKeyDown}
          renderers={{ noRowsFallback: <EmptyRowsRenderer /> }}
        />

        <div
          className="flex flex-row justify-between border border-x-0 border-b-0 border-t-2 border-blue-500 p-2"
          style={{
            background: 'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 100%)'
          }}
        >
          <ActionButton
            customActions={[
              {
                label: 'EDIT MARKETING DETAIL',
                icon: <FaPencil />,
                className: 'bg-cyan-500 hover:bg-cyan-700',
                onClick: () => handleEditMarketingDetail()
              }
            ]}
          />
          {isLoadingMarketingProsesFee ? <LoadRowsRenderer /> : null}
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
      <FormMarketingDetail
        forms={forms}
        popOver={popOver}
        setPopOver={setPopOver}
        handleClose={handleClose}
        onSubmit={forms.handleSubmit(onSubmit)}
      />
    </div>
  );
};

export default GridMarketingProsesFee;
