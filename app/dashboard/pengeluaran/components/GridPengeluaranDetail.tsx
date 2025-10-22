/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback
} from 'react';
import 'react-data-grid/lib/styles.scss';

import DataGrid, {
  CellKeyDownArgs,
  Column,
  DataGridHandle
} from 'react-data-grid';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import ActionButton from '@/components/custom-ui/ActionButton';
import { FaPen } from 'react-icons/fa';
import { ImSpinner2 } from 'react-icons/im';
import { Button } from '@/components/ui/button';
import {
  PengeluaranDetail,
  filterPengeluaranDetail
} from '@/lib/types/pengeluaran.type';
import { useGetPengeluaranDetail } from '@/lib/server/usePengeluaran';
import { formatCurrency } from '@/lib/utils';
import { FaSort, FaSortDown, FaSortUp, FaTimes } from 'react-icons/fa';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import IcClose from '@/public/image/x.svg';
import { highlightText } from '@/components/custom-ui/HighlightText';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { debounce } from 'lodash';
import FilterInput from '@/components/custom-ui/FilterInput';

interface Filter {
  search: string;
  filters: typeof filterPengeluaranDetail;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

interface GridProps {
  activeTab: string;
}

interface GridConfig {
  columnsOrder: number[];
  columnsWidth: { [key: string]: number };
}
const GridPengeluaranDetail = ({
  activeTab,
  nobukti
}: {
  activeTab: string;
  nobukti?: string;
}) => {
  const headerData = useSelector((state: RootState) => state.header.headerData);
  const [filters, setFilters] = useState<Filter>({
    filters: {
      ...filterPengeluaranDetail,
      nobukti: nobukti ?? headerData?.nobukti ?? ''
    },
    search: '',
    sortBy: 'nobukti',
    sortDirection: 'asc'
  });
  const [prevFilters, setPrevFilters] = useState<Filter>(filters);

  const {
    data: detail,
    isLoading,
    refetch
  } = useGetPengeluaranDetail(
    activeTab === 'pengeluarandetail'
      ? filters
      : { filters: { nobukti: nobukti ?? headerData?.nobukti ?? '' } }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setInputValue(searchValue);
    setFilters((prev) => ({
      ...prev,
      filters: {
        ...filterPengeluaranDetail,
        nobukti: nobukti ?? headerData?.nobukti
      },
      search: searchValue
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

  // const {
  //   data: detail,
  //   isLoading,
  //   refetch
  // } = useGetPengeluaranDetail(
  //   activeTab === 'pengeluarandetail'
  //     ? {
  //         filters: {
  //           pengeluaran_nobukti: headerData?.pengeluaran_nobukti || '',
  //           nobukti:
  //             !headerData?.pengeluaran_nobukti && headerData?.nobukti
  //               ? headerData?.nobukti
  //               : ''
  //         }
  //       }
  //     : {}
  // );

  const [rows, setRows] = useState<PengeluaranDetail[]>([]);
  const [popOver, setPopOver] = useState<boolean>(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>('');

  const [columnsOrder, setColumnsOrder] = useState<readonly number[]>([]);
  const [columnsWidth, setColumnsWidth] = useState<{ [key: string]: number }>(
    {}
  );
  const gridRef = useRef<DataGridHandle>(null);

  const [dataGridKey, setDataGridKey] = useState(0);
  const resizeDebounceTimeout = useRef<NodeJS.Timeout | null>(null); // Timer debounce untuk resize
  const inputColRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const debouncedFilterUpdate = useRef(
    debounce((colKey: string, value: string) => {
      setFilters((prev) => ({
        ...prev,
        filters: { ...prev.filters, [colKey]: value },
        page: 1
      }));
      setRows([]);
    }, 300) // Bisa dikurangi jadi 250-300ms
  ).current;

  const handleFilterInputChange = useCallback(
    (colKey: string, value: string) => {
      debouncedFilterUpdate(colKey, value);
    },
    []
  );
  const handleClearFilter = useCallback((colKey: string) => {
    debouncedFilterUpdate.cancel(); // Cancel pending updates

    setFilters((prev) => ({
      ...prev,
      filters: { ...prev.filters, [colKey]: '' },
      page: 1
    }));
    setRows([]);
  }, []);

  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleSort = (column: string) => {
    const originalIndex = columns.findIndex((col) => col.key === column);

    // 2. hitung index tampilan berdasar columnsOrder
    //    jika belum ada reorder (columnsOrder kosong), fallback ke originalIndex
    const displayIndex =
      columnsOrder.length > 0
        ? columnsOrder.findIndex((idx) => idx === originalIndex)
        : originalIndex;
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
      gridRef?.current?.selectCell({ rowIdx: 0, idx: displayIndex });
    }, 200);
    setSelectedRow(0);

    setRows([]);
  };

  const columns = useMemo((): Column<PengeluaranDetail>[] => {
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
                    ...filterPengeluaranDetail,
                    nobukti: nobukti ?? headerData?.nobukti
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
        key: 'nobukti',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 200,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[48%] px-8"
              onClick={() => handleSort('nobukti')}
              onContextMenu={handleContextMenu}
            >
              <p className="text-sm font-normal">NO BUKTI</p>
              <div className="ml-2">
                {filters.sortBy === 'nobukti' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'nobukti' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="font-bold" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>
          </div>
        ),
        name: 'nobukti',
        renderCell: (props: any) => {
          const columnFilter = filters.filters.nobukti || '';
          const cellValue = props.row.nobukti || '';
          return (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
                    {`${cellValue} ${filters.search || ''} ${columnFilter}`}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="rounded-none border border-zinc-400 bg-white text-sm text-zinc-900"
                >
                  <p>{cellValue}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
      },
      {
        key: 'coadebet',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('coadebet')}
              onContextMenu={handleContextMenu}
            >
              <p className="text-sm font-normal">COA DEBET</p>
              <div className="ml-2">
                {filters.sortBy === 'coadebet' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'coadebet' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="font-bold" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>

            <div className="relative h-[50%] w-full px-1">
              <FilterInput
                colKey="coadebet_text"
                value={filters.filters.coadebet_text || ''}
                onChange={(value) =>
                  handleFilterInputChange('coadebet_text', value)
                }
                onClear={() => handleClearFilter('coadebet_text')}
                inputRef={(el) => {
                  inputColRefs.current['coadebet_text'] = el;
                }}
              />
            </div>
          </div>
        ),
        name: 'coadebet',
        renderCell: (props: any) => {
          const columnFilter = filters.filters.coadebet_text || '';
          const cellValue = props.row.coadebet_text || '';
          return (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
                    {highlightText(cellValue, filters.search, columnFilter)}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="rounded-none border border-zinc-400 bg-white text-sm text-zinc-900"
                >
                  <p>{cellValue}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
      },
      {
        key: 'keterangan',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('keterangan')}
              onContextMenu={handleContextMenu}
            >
              <p className="text-sm font-normal">KETERANGAN</p>
              <div className="ml-2">
                {filters.sortBy === 'keterangan' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'keterangan' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="font-bold" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>

            <div className="relative h-[50%] w-full px-1">
              <FilterInput
                colKey="keterangan"
                value={filters.filters.keterangan || ''}
                onChange={(value) =>
                  handleFilterInputChange('keterangan', value)
                }
                onClear={() => handleClearFilter('keterangan')}
                inputRef={(el) => {
                  inputColRefs.current['keterangan'] = el;
                }}
              />
            </div>
          </div>
        ),
        name: 'keterangan',
        renderCell: (props: any) => {
          const columnFilter = filters.filters.keterangan || '';
          const cellValue = props.row.keterangan || '';
          return (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
                    {highlightText(cellValue, filters.search, columnFilter)}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="rounded-none border border-zinc-400 bg-white text-sm text-zinc-900"
                >
                  <p>{cellValue}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
      },
      {
        key: 'nominal',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('nominal')}
              onContextMenu={handleContextMenu}
            >
              <p className="text-sm font-normal">NOMINAL</p>
              <div className="ml-2">
                {filters.sortBy === 'nominal' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'nominal' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="font-bold" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>

            <div className="relative h-[50%] w-full px-1">
              <FilterInput
                colKey="nominal"
                value={filters.filters.nominal || ''}
                onChange={(value) => handleFilterInputChange('nominal', value)}
                onClear={() => handleClearFilter('nominal')}
                inputRef={(el) => {
                  inputColRefs.current['nominal'] = el;
                }}
              />
            </div>
          </div>
        ),
        name: 'nominal',
        renderCell: (props: any) => {
          const columnFilter = filters.filters.nominal || '';
          const cellValue = props.row.nominal || '';
          return (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
                    {highlightText(
                      cellValue != null ? formatCurrency(cellValue) : '',
                      filters.search,
                      columnFilter
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="rounded-none border border-zinc-400 bg-white text-sm text-zinc-900"
                >
                  <p>{formatCurrency(cellValue)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
      },
      {
        key: 'dpp',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('dpp')}
              onContextMenu={handleContextMenu}
            >
              <p className="text-sm font-normal">DPP</p>
              <div className="ml-2">
                {filters.sortBy === 'dpp' && filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'dpp' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="font-bold" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>

            <div className="relative h-[50%] w-full px-1">
              <FilterInput
                colKey="dpp"
                value={filters.filters.dpp || ''}
                onChange={(value) => handleFilterInputChange('dpp', value)}
                onClear={() => handleClearFilter('dpp')}
                inputRef={(el) => {
                  inputColRefs.current['dpp'] = el;
                }}
              />
            </div>
          </div>
        ),
        name: 'dpp',
        renderCell: (props: any) => {
          const columnFilter = filters.filters.dpp || '';
          const cellValue = props.row.dpp || '';
          return (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
                    {highlightText(
                      cellValue != null ? formatCurrency(cellValue) : '',
                      filters.search,
                      columnFilter
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="rounded-none border border-zinc-400 bg-white text-sm text-zinc-900"
                >
                  <p>{formatCurrency(cellValue)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
      },
      {
        key: 'noinvoiceemkl',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('noinvoiceemkl')}
              onContextMenu={handleContextMenu}
            >
              <p className="text-sm font-normal">NOMOR INVOICE EMKL</p>
              <div className="ml-2">
                {filters.sortBy === 'noinvoiceemkl' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'noinvoiceemkl' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="font-bold" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>

            <div className="relative h-[50%] w-full px-1">
              <FilterInput
                colKey="noinvoiceemkl"
                value={filters.filters.noinvoiceemkl || ''}
                onChange={(value) =>
                  handleFilterInputChange('noinvoiceemkl', value)
                }
                onClear={() => handleClearFilter('noinvoiceemkl')}
                inputRef={(el) => {
                  inputColRefs.current['noinvoiceemkl'] = el;
                }}
              />
            </div>
          </div>
        ),
        name: 'noinvoiceemkl',
        renderCell: (props: any) => {
          const columnFilter = filters.filters.noinvoiceemkl || '';
          const cellValue = props.row.noinvoiceemkl || '';
          return (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
                    {highlightText(cellValue, filters.search, columnFilter)}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="rounded-none border border-zinc-400 bg-white text-sm text-zinc-900"
                >
                  <p>{cellValue}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
      },
      {
        key: 'tglinvoiceemkl',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('tglinvoiceemkl')}
              onContextMenu={handleContextMenu}
            >
              <p className="text-sm font-normal">TANGGAL INVOICE EMKL</p>
              <div className="ml-2">
                {filters.sortBy === 'tglinvoiceemkl' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'tglinvoiceemkl' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="font-bold" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>

            <div className="relative h-[50%] w-full px-1">
              <FilterInput
                colKey="tglinvoiceemkl"
                value={filters.filters.tglinvoiceemkl || ''}
                onChange={(value) =>
                  handleFilterInputChange('tglinvoiceemkl', value)
                }
                onClear={() => handleClearFilter('tglinvoiceemkl')}
                inputRef={(el) => {
                  inputColRefs.current['tglinvoiceemkl'] = el;
                }}
              />
            </div>
          </div>
        ),
        name: 'tglinvoiceemkl',
        renderCell: (props: any) => {
          const columnFilter = filters.filters.tglinvoiceemkl || '';
          const cellValue = props.row.tglinvoiceemkl || '';
          return (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
                    {highlightText(cellValue, filters.search, columnFilter)}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="rounded-none border border-zinc-400 bg-white text-sm text-zinc-900"
                >
                  <p>{cellValue}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
      },
      {
        key: 'nofakturpajakemkl',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('nofakturpajakemkl')}
              onContextMenu={handleContextMenu}
            >
              <p className="text-sm font-normal">NOMOR FAKTUR PAJAK EMKL</p>
              <div className="ml-2">
                {filters.sortBy === 'nofakturpajakemkl' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'nofakturpajakemkl' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="font-bold" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>

            <div className="relative h-[50%] w-full px-1">
              <FilterInput
                colKey="nofakturpajakemkl"
                value={filters.filters.nofakturpajakemkl || ''}
                onChange={(value) =>
                  handleFilterInputChange('nofakturpajakemkl', value)
                }
                onClear={() => handleClearFilter('nofakturpajakemkl')}
                inputRef={(el) => {
                  inputColRefs.current['nofakturpajakemkl'] = el;
                }}
              />
            </div>
          </div>
        ),
        name: 'nofakturpajakemkl',
        renderCell: (props: any) => {
          const columnFilter = filters.filters.nofakturpajakemkl || '';
          const cellValue = props.row.nofakturpajakemkl || '';
          return (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
                    {highlightText(cellValue, filters.search, columnFilter)}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="rounded-none border border-zinc-400 bg-white text-sm text-zinc-900"
                >
                  <p>{cellValue}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
      },
      {
        key: 'perioderefund',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('perioderefund')}
              onContextMenu={handleContextMenu}
            >
              <p className="text-sm font-normal">PERIODE REFUND</p>
              <div className="ml-2">
                {filters.sortBy === 'perioderefund' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'perioderefund' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="font-bold" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>

            <div className="relative h-[50%] w-full px-1">
              <FilterInput
                colKey="perioderefund"
                value={filters.filters.perioderefund || ''}
                onChange={(value) =>
                  handleFilterInputChange('perioderefund', value)
                }
                onClear={() => handleClearFilter('perioderefund')}
                inputRef={(el) => {
                  inputColRefs.current['perioderefund'] = el;
                }}
              />
            </div>
          </div>
        ),
        name: 'perioderefund',
        renderCell: (props: any) => {
          const columnFilter = filters.filters.perioderefund || '';
          const cellValue = props.row.perioderefund || '';
          return (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
                    {highlightText(cellValue, filters.search, columnFilter)}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="rounded-none border border-zinc-400 bg-white text-sm text-zinc-900"
                >
                  <p>{cellValue}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
      },
      {
        key: 'modifiedby',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 200,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('modifiedby')}
              onContextMenu={handleContextMenu}
            >
              <p className="text-sm font-normal">MODIFIED BY</p>
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
              <FilterInput
                colKey="modifiedby"
                value={filters.filters.modifiedby || ''}
                onChange={(value) =>
                  handleFilterInputChange('modifiedby', value)
                }
                onClear={() => handleClearFilter('modifiedby')}
                inputRef={(el) => {
                  inputColRefs.current['modifiedby'] = el;
                }}
              />
            </div>
          </div>
        ),
        name: 'Modified By',
        renderCell: (props: any) => {
          const columnFilter = filters.filters.modifiedby || '';
          const cellValue = props.row.modifiedby || '';
          return (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
                    {highlightText(cellValue, filters.search, columnFilter)}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="rounded-none border border-zinc-400 bg-white text-sm text-zinc-900"
                >
                  <p>{cellValue}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
      },
      {
        key: 'created_at',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 200,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('created_at')}
              onContextMenu={handleContextMenu}
            >
              <p className="text-sm font-normal">Created At</p>
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
              <FilterInput
                colKey="created_at"
                value={filters.filters.created_at || ''}
                onChange={(value) =>
                  handleFilterInputChange('created_at', value)
                }
                onClear={() => handleClearFilter('created_at')}
                inputRef={(el) => {
                  inputColRefs.current['created_at'] = el;
                }}
              />
            </div>
          </div>
        ),
        name: 'Created At',
        renderCell: (props: any) => {
          const columnFilter = filters.filters.created_at || '';
          const cellValue = props.row.created_at || '';
          return (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
                    {highlightText(cellValue, filters.search, columnFilter)}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="rounded-none border border-zinc-400 bg-white text-sm text-zinc-900"
                >
                  <p>{cellValue}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
      },
      {
        key: 'updated_at',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 200,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('updated_at')}
              onContextMenu={handleContextMenu}
            >
              <p className="text-sm font-normal">Updated At</p>
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
              <FilterInput
                colKey="updated_at"
                value={filters.filters.updated_at || ''}
                onChange={(value) =>
                  handleFilterInputChange('updated_at', value)
                }
                onClear={() => handleClearFilter('updated_at')}
                inputRef={(el) => {
                  inputColRefs.current['updated_at'] = el;
                }}
              />
            </div>
          </div>
        ),
        name: 'Updated At',
        renderCell: (props: any) => {
          const columnFilter = filters.filters.updated_at || '';
          const cellValue = props.row.updated_at || '';
          return (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
                    {highlightText(cellValue, filters.search, columnFilter)}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="rounded-none border border-zinc-400 bg-white text-sm text-zinc-900"
                >
                  <p>{cellValue}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
      }
    ];
  }, [rows, filters]);
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
        'GridPengeluaranDetail',
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
        'GridPengeluaranDetail',
        [...newOrder],
        columnsWidth
      );
      return newOrder;
    });
  };
  const handleCloseTable = () => {
    setPopOver(false);
  };
  const handleEditTable = () => {
    setPopOver(true);
  };

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
        'GridPengeluaranDetail',
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

    // update filter seperti biasa…
    setFilters((prev) => ({
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

  const handleClearInput = () => {
    setFilters((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        nobukti: nobukti ?? headerData?.nobukti
      },
      search: ''
    }));
    setInputValue('');
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
        .filter((col): col is Column<PengeluaranDetail> => !!col);
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
    loadGridConfig(user.id, 'GridPengeluaranDetail');
  }, []);
  useEffect(() => {
    if (headerData?.nobukti || nobukti) {
      setFilters((prev) => ({
        ...prev,
        filters: { ...prev.filters, nobukti: nobukti ?? headerData?.nobukti }
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        filters: { ...prev.filters, nobukti: '' }
      }));
    }
  }, [headerData?.nobukti, nobukti]);
  useEffect(() => {
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  useEffect(() => {
    if (headerData?.nobukti || nobukti) {
      setFilters((prev) => ({
        ...prev,
        filters: { ...prev.filters, nobukti: nobukti ?? headerData?.nobukti }
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        filters: { ...prev.filters, nobukti: '' }
      }));
    }
  }, [headerData?.nobukti, nobukti]);
  useEffect(() => {
    if (detail) {
      const formattedRows = detail?.data?.map((item: any) => ({
        id: item.id,
        pengeluaran_id: item.pengeluaran_id, // Updated to match the field name
        coadebet: item.coadebet, // Updated to match the field name
        coadebet_text: item.coadebet_text, // Updated to match the field name
        nobukti: item.nobukti, // Updated to match the field name
        keterangan: item.keterangan, // Updated to match the field name
        nominal: item.nominal, // Updated to match the field name
        dpp: item.dpp, // Updated to match the field name
        transaksibiaya_nobukti: item.transaksibiaya_nobukti, // Updated to match the field name
        transaksilain_nobukti: item.transaksilain_nobukti, // Updated to match the field name
        noinvoiceemkl: item.noinvoiceemkl, // Updated to match the field name
        tglinvoiceemkl: item.tglinvoiceemkl, // Updated to match the field name
        nofakturpajakemkl: item.nofakturpajakemkl, // Updated to match the field name
        perioderefund: item.perioderefund, // Updated to match the field name
        pengeluaranheader_nobukti: item.pengeluaranheader_nobukti, // Updated to match the field name
        penerimaanheader_nobukti: item.penerimaanheader_nobukti, // Updated to match the field name
        info: item.info, // Updated to match the field name
        modifiedby: item.modifiedby, // Updated to match the field name
        created_at: item.created_at, // Updated to match the field name
        updated_at: item.updated_at // Updated to match the field name
      }));

      setRows(formattedRows);
    } else if (!headerData?.nobukti || !nobukti) {
      setRows([]);
    }
  }, [detail, headerData?.nobukti, nobukti]);

  async function handleKeyDown(
    args: CellKeyDownArgs<PengeluaranDetail>,
    event: React.KeyboardEvent
  ) {
    if (event.key === 'ArrowUp' && args.rowIdx === 0) {
      event.preventDefault();
    }
  }

  useEffect(() => {
    const headerCells = document.querySelectorAll('.rdg-header-row .rdg-cell');
    headerCells.forEach((cell) => {
      cell.setAttribute('tabindex', '-1');
    });
  }, []);

  useEffect(() => {
    // Memastikan refetch dilakukan saat filters berubah
    if (filters !== prevFilters) {
      refetch(); // Memanggil ulang API untuk mendapatkan data terbaru
      setPrevFilters(filters); // Simpan filters terbaru
    }
  }, [filters, refetch]); // Dependency array termasuk filters dan refetch

  useEffect(() => {
    return () => {
      debouncedFilterUpdate.cancel();
    };
  }, []);

  return (
    <div className={`flex h-[100%] w-full justify-center`}>
      <div className="flex h-[100%] w-full flex-col rounded-sm border border-blue-500 bg-white">
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
          onColumnResize={onColumnResize}
          onColumnsReorder={onColumnsReorder}
          rows={rows ?? []}
          headerRowHeight={70}
          onCellKeyDown={handleKeyDown}
          rowHeight={30}
          renderers={{ noRowsFallback: <EmptyRowsRenderer /> }}
          className="rdg-light fill-grid text-sm"
        />
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
        <div
          className="flex flex-row justify-between border border-x-0 border-b-0 border-blue-500 p-2"
          style={{
            background: 'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 100%)'
          }}
        >
          {isLoading ? <LoadRowsRenderer /> : null}
        </div>
      </div>
    </div>
  );
};

export default GridPengeluaranDetail;
