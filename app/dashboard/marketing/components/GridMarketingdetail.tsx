'use client';

import Image from 'next/image';
import 'react-data-grid/lib/styles.scss';
import { FaSort, FaSortDown, FaSortUp, FaTimes } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import IcClose from '@/public/image/x.svg';
import { ImSpinner2 } from 'react-icons/im';
import { RootState } from '@/lib/store/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CellKeyDownArgs } from 'react-data-grid';
import { useEffect, useMemo, useRef, useState } from 'react';
import DataGrid, { Column, DataGridHandle } from 'react-data-grid';
import { useGetMarketingDetail } from '@/lib/server/useMarketingHeader';
import {
  filterMarketingDetail,
  MarketingDetail
} from '@/lib/types/marketingheader.type';
import { clearOpenName } from '@/lib/store/lookupSlice/lookupSlice';
import FilterOptions from '@/components/custom-ui/FilterOptions';
import { formatCurrency } from '@/lib/utils';

interface GridConfig {
  columnsOrder: number[];
  columnsWidth: { [key: string]: number };
}

interface Filter {
  page: number;
  limit: number;
  search: string;
  filters: typeof filterMarketingDetail;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

const GridMarketingDetail = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const detailData = useSelector((state: RootState) => state.header.detailData);
  const gridRef = useRef<DataGridHandle>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const resizeDebounceTimeout = useRef<NodeJS.Timeout | null>(null); // Timer debounce untuk resize
  const inputColRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [dataGridKey, setDataGridKey] = useState(0);
  const [rows, setRows] = useState<MarketingDetail[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [columnsOrder, setColumnsOrder] = useState<readonly number[]>([]);
  const [columnsWidth, setColumnsWidth] = useState<{ [key: string]: number }>(
    {}
  );
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  // console.log('detaildata', detailData, detailData.id);
  const [filters, setFilters] = useState<Filter>({
    page: 1,
    limit: 30,
    search: '',
    filters: filterMarketingDetail,
    sortBy: 'nominalawal',
    sortDirection: 'asc'
  });

  const {
    data: allDatamarketingDetail,
    isLoading: isLoadingMarketingDetail,
    refetch
  } = useGetMarketingDetail(detailData?.id ?? 0, { ...filters, page: 1 });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setInputValue(searchValue);
    setFilters((prev) => ({
      ...prev,
      filters: filterMarketingDetail,
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
    setRows([]);
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

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY });
  };

  const columns = useMemo((): Column<MarketingDetail>[] => {
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
                    nominalawal: '',
                    nominalakhir: '',
                    persentase: '',
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
        width: 300,
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
                  inputColRefs.current['marketing'] = el;
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

      // {
      //   key: 'marketingprosesfee',
      //   name: 'marketingprosesfee',
      //   headerCellClass: 'column-headers',
      //   resizable: true,
      //   draggable: true,
      //   width: 300,
      //   renderHeaderCell: () => (
      //     <div className="flex h-full cursor-pointer flex-col items-center gap-1">
      //       <div
      //         // className="flex h-full w-full cursor-pointer flex-col justify-center px-2"
      //         className="headers-cell h-[50%] px-8"
      //         // onClick={() => handleSort('keterangan')}
      //         onContextMenu={handleContextMenu}
      //       >
      //         <p className="text-sm font-normal">marketing proses fee</p>
      //       </div>

      //       <div className="relative h-[50%] w-full px-1">
      //         <Input
      //           // ref={(el) => {
      //           //   inputColRefs.current['keterangan'] = el;
      //           // }}
      //           className="filter-input z-[999999] h-8 rounded-none"
      //           // value={filters.filters.keterangan.toUpperCase() || ''}
      //           // onChange={(e) => {
      //           //   const value = e.target.value.toUpperCase();
      //           //   handleColumnFilterChange('keterangan', value);
      //           // }}
      //         />
      //         {/* {filters.filters.keterangan && ( */}
      //           <button
      //             className="absolute right-2 top-2 text-xs text-gray-500"
      //             // onClick={() => handleColumnFilterChange('keterangan', '')}
      //             type="button"
      //           >
      //             <FaTimes />
      //           </button>
      //         {/* )} */}
      //       </div>
      //     </div>
      //   ),
      //   renderCell: (props: any) => {
      //     return (
      //       <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
      //         {props.row.marketingprosesfee_nama}
      //       </div>
      //     );
      //   }
      // },

      {
        key: 'nominalawal',
        name: 'nominalawal',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('nominalawal')}
              onContextMenu={handleContextMenu}
            >
              <p className="text-sm font-normal">nominal awal</p>
              <div className="ml-2">
                {filters.sortBy === 'nominalawal' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'nominalawal' &&
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
                  inputColRefs.current['nominalawal'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.nominalawal.toUpperCase() || ''}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  handleColumnFilterChange('nominalawal', value);
                }}
              />
              {filters.filters.nominalawal && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('nominalawal', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.nominalawal || '';
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {highlightText(
                formatCurrency(props.row.nominalawal) || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'nominalakhir',
        name: 'nominalakhir',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('nominalakhir')}
              onContextMenu={handleContextMenu}
            >
              <p className="text-sm font-normal">nominal akhir</p>
              <div className="ml-2">
                {filters.sortBy === 'nominalakhir' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'nominalakhir' &&
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
                  inputColRefs.current['nominalakhir'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.nominalakhir.toUpperCase() || ''}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  handleColumnFilterChange('nominalakhir', value);
                }}
              />
              {filters.filters.nominalakhir && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('nominalakhir', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.nominalakhir || '';
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {highlightText(
                formatCurrency(props.row.nominalakhir) || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'persentase',
        name: 'persentase',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('persentase')}
              onContextMenu={handleContextMenu}
            >
              <p className="text-sm font-normal">persentase</p>
              <div className="ml-2">
                {filters.sortBy === 'persentase' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'persentase' &&
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
                  inputColRefs.current['persentase'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.persentase.toUpperCase() || ''}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  handleColumnFilterChange('persentase', value);
                }}
              />
              {filters.filters.persentase && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('persentase', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.persentase || '';
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {highlightText(
                formatCurrency(props.row.persentase) || '',
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
        'GridMarketingDetail',
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
        'GridMarketingDetail',
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
      saveGridConfig(
        user.id,
        'GridMarketingDetail',
        defaultColumnsOrder,
        defaultColumnsWidth
      ); // Simpan konfigurasi reset ke server (atau backend)
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
    args: CellKeyDownArgs<MarketingDetail>,
    event: React.KeyboardEvent
  ) {
    if (event.key === 'ArrowUp' && args.rowIdx === 0) {
      event.preventDefault();
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
    loadGridConfig(user.id, 'GridMarketingDetail');
  }, []);

  useEffect(() => {
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (allDatamarketingDetail) {
      const formattedRows = allDatamarketingDetail?.data?.map((item: any) => ({
        id: item.id,
        marketing_id: item.marketing_id,
        marketing_nama: item.marketing_nama,
        marketingprosesfee_id: item.marketingprosesfee_id,
        nominalawal: item.nominalawal,
        nominalakhir: item.nominalakhir,
        persentase: item.persentase,
        statusaktif: item.statusaktif,
        statusaktif_nama: item.statusaktif_nama,
        memo: item.memo
      }));

      setRows(formattedRows);
    } else if (!detailData?.id) {
      setRows([]);
    }
  }, [allDatamarketingDetail, detailData?.id]);

  useEffect(() => {
    const headerCells = document.querySelectorAll('.rdg-header-row .rdg-cell');
    headerCells.forEach((cell) => {
      cell.setAttribute('tabindex', '-1');
    });
  }, []);

  useEffect(() => {
    if (detailData) {
      refetch();
    }
  }, [detailData]);

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
          onColumnResize={onColumnResize}
          onColumnsReorder={onColumnsReorder}
          rows={rows}
          headerRowHeight={70}
          onCellKeyDown={handleKeyDown}
          rowHeight={30}
          renderers={{ noRowsFallback: <EmptyRowsRenderer /> }}
          className="rdg-light fill-grid text-xs"
        />
        <div
          className="flex flex-row justify-between border border-x-0 border-b-0 border-blue-500 p-2"
          style={{
            background: 'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 100%)'
          }}
        >
          {isLoadingMarketingDetail ? <LoadRowsRenderer /> : null}

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
    </div>
  );
};

export default GridMarketingDetail;
