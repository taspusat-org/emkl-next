/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import 'react-data-grid/lib/styles.scss';

import DataGrid, {
  CellKeyDownArgs,
  Column,
  DataGridHandle
} from 'react-data-grid';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import ActionButton from '@/components/custom-ui/ActionButton';
import { FaPen, FaSort, FaSortDown, FaSortUp, FaTimes } from 'react-icons/fa';
import { ImSpinner2 } from 'react-icons/im';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import {
  filterPenerimaanDetail,
  PenerimaanDetail
} from '@/lib/types/penerimaan.type';
import { useGetPenerimaanDetail } from '@/lib/server/usePenerimaan';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import IcClose from '@/public/image/x.svg';

interface GridConfig {
  columnsOrder: number[];
  columnsWidth: { [key: string]: number };
}
interface Filter {
  search: string;
  filters: typeof filterPenerimaanDetail;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}
const GridPenerimaanDetail = ({
  activeTab,
  nobukti
}: {
  activeTab: string;
  nobukti?: string;
}) => {
  const headerData = useSelector((state: RootState) => state.header.headerData);
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedRow, setSelectedRow] = useState<number>(0);

  const inputColRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [filters, setFilters] = useState<Filter>({
    filters: {
      ...filterPenerimaanDetail,
      nobukti: nobukti ?? headerData.nobukti
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
  } = useGetPenerimaanDetail(activeTab === 'penerimaandetail' ? filters : {});

  const [rows, setRows] = useState<PenerimaanDetail[]>([]);
  const [popOver, setPopOver] = useState<boolean>(false);
  const { user } = useSelector((state: RootState) => state.auth);

  const [columnsOrder, setColumnsOrder] = useState<readonly number[]>([]);
  const [columnsWidth, setColumnsWidth] = useState<{ [key: string]: number }>(
    {}
  );
  const gridRef = useRef<DataGridHandle>(null);

  const [dataGridKey, setDataGridKey] = useState(0);
  const resizeDebounceTimeout = useRef<NodeJS.Timeout | null>(null); // Timer debounce untuk resize

  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
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
      filters: {
        ...prev.filters,
        [colKey]: value,
        nobukti: nobukti ?? headerData.nobukti
      },
      search: ''
    }));
    setInputValue('');

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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setInputValue(searchValue);
    setFilters((prev) => ({
      ...prev,
      filters: {
        ...filterPenerimaanDetail,
        nobukti: nobukti ?? headerData.nobukti
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
  const handleClearInput = () => {
    setFilters((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        nobukti: nobukti ?? headerData.nobukti
      },
      search: ''
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
      sortDirection: newSortOrder
    }));
    setTimeout(() => {
      gridRef?.current?.selectCell({ rowIdx: 0, idx: 1 });
    }, 200);
    setSelectedRow(0);

    setRows([]);
  };
  const columns = useMemo((): Column<PenerimaanDetail>[] => {
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
                    ...filterPenerimaanDetail,
                    nobukti: nobukti ?? headerData.nobukti
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
        name: 'NO BUKTI',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onContextMenu={handleContextMenu}
            >
              <p className={`text-sm font-normal`}>Nomor Bukti</p>
            </div>
            <div className="relative h-[50%] w-full px-1"></div>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.nobukti}
            </div>
          );
        }
      },
      {
        key: 'coa_nama',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        name: 'coa_nama',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('coa_nama')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'coa_nama' ? 'font-bold' : 'font-normal'
                }`}
              >
                Coa
              </p>
              <div className="ml-2">
                {filters.sortBy === 'coa_nama' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'coa_nama' &&
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
                  inputColRefs.current['coa_nama'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none text-sm"
                value={
                  filters.filters.coa_nama
                    ? filters.filters.coa_nama.toUpperCase()
                    : ''
                }
                type="text"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase(); // Menjadikan input menjadi uppercase
                  handleColumnFilterChange('coa_nama', value);
                }}
              />
              {filters.filters.coa_nama && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('coa_nama', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.coa_nama || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.coa_nama || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'keterangan',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        name: 'keterangan',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('keterangan')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'keterangan' ? 'font-bold' : 'font-normal'
                }`}
              >
                Keterangan
              </p>
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
        key: 'nominal',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        name: 'nominal',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('nominal')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'nominal' ? 'font-bold' : 'font-normal'
                }`}
              >
                Nominal
              </p>
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
              <Input
                ref={(el) => {
                  inputColRefs.current['nominal'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none text-sm"
                value={
                  filters.filters.nominal
                    ? filters.filters.nominal.toUpperCase()
                    : ''
                }
                type="text"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase(); // Menjadikan input menjadi uppercase
                  handleColumnFilterChange('nominal', value);
                }}
              />
              {filters.filters.nominal && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('nominal', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.nominal || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center justify-end p-0 text-sm">
              {highlightText(
                formatCurrency(props.row.nominal) || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'transaksibiaya_nobukti',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        name: 'transaksibiaya_nobukti',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('transaksibiaya_nobukti')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'transaksibiaya_nobukti'
                    ? 'font-bold'
                    : 'font-normal'
                }`}
              >
                NO.BUKTI TRANSAKSI BIAYA
              </p>
              <div className="ml-2">
                {filters.sortBy === 'transaksibiaya_nobukti' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'transaksibiaya_nobukti' &&
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
                  inputColRefs.current['transaksibiaya_nobukti'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none text-sm"
                value={
                  filters.filters.transaksibiaya_nobukti
                    ? filters.filters.transaksibiaya_nobukti.toUpperCase()
                    : ''
                }
                type="text"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase(); // Menjadikan input menjadi uppercase
                  handleColumnFilterChange('transaksibiaya_nobukti', value);
                }}
              />
              {filters.filters.transaksibiaya_nobukti && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() =>
                    handleColumnFilterChange('transaksibiaya_nobukti', '')
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
          const columnFilter = filters.filters.transaksibiaya_nobukti || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.transaksibiaya_nobukti || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'transaksilain_nobukti',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        name: 'transaksilain_nobukti',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('transaksilain_nobukti')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'transaksilain_nobukti'
                    ? 'font-bold'
                    : 'font-normal'
                }`}
              >
                NO BUKTI TRANSAKSI LAIN
              </p>
              <div className="ml-2">
                {filters.sortBy === 'transaksilain_nobukti' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'transaksilain_nobukti' &&
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
                  inputColRefs.current['transaksilain_nobukti'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none text-sm"
                value={
                  filters.filters.transaksilain_nobukti
                    ? filters.filters.transaksilain_nobukti.toUpperCase()
                    : ''
                }
                type="text"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase(); // Menjadikan input menjadi uppercase
                  handleColumnFilterChange('transaksilain_nobukti', value);
                }}
              />
              {filters.filters.transaksilain_nobukti && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() =>
                    handleColumnFilterChange('transaksilain_nobukti', '')
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
          const columnFilter = filters.filters.transaksilain_nobukti || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.transaksilain_nobukti || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'pengeluaranemklheader_nobukti',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        name: 'pengeluaranemklheader_nobukti',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('pengeluaranemklheader_nobukti')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'pengeluaranemklheader_nobukti'
                    ? 'font-bold'
                    : 'font-normal'
                }`}
              >
                PENGELUARAN HEADER NO BUKTI
              </p>
              <div className="ml-2">
                {filters.sortBy === 'pengeluaranemklheader_nobukti' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'pengeluaranemklheader_nobukti' &&
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
                  inputColRefs.current['pengeluaranemklheader_nobukti'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none text-sm"
                value={
                  filters.filters.pengeluaranemklheader_nobukti
                    ? filters.filters.pengeluaranemklheader_nobukti.toUpperCase()
                    : ''
                }
                type="text"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase(); // Menjadikan input menjadi uppercase
                  handleColumnFilterChange(
                    'pengeluaranemklheader_nobukti',
                    value
                  );
                }}
              />
              {filters.filters.pengeluaranemklheader_nobukti && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() =>
                    handleColumnFilterChange(
                      'pengeluaranemklheader_nobukti',
                      ''
                    )
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
            filters.filters.pengeluaranemklheader_nobukti || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.pengeluaranemklheader_nobukti || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'penerimaanemklheader_nobukti',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        name: 'penerimaanemklheader_nobukti',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
              onClick={() => handleSort('penerimaanemklheader_nobukti')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'penerimaanemklheader_nobukti'
                    ? 'font-bold'
                    : 'font-normal'
                }`}
              >
                PENGELUARAN HEADER NO BUKTI
              </p>
              <div className="ml-2">
                {filters.sortBy === 'penerimaanemklheader_nobukti' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'penerimaanemklheader_nobukti' &&
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
                  inputColRefs.current['penerimaanemklheader_nobukti'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none text-sm"
                value={
                  filters.filters.penerimaanemklheader_nobukti
                    ? filters.filters.penerimaanemklheader_nobukti.toUpperCase()
                    : ''
                }
                type="text"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase(); // Menjadikan input menjadi uppercase
                  handleColumnFilterChange(
                    'penerimaanemklheader_nobukti',
                    value
                  );
                }}
              />
              {filters.filters.penerimaanemklheader_nobukti && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() =>
                    handleColumnFilterChange('penerimaanemklheader_nobukti', '')
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
            filters.filters.penerimaanemklheader_nobukti || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.penerimaanemklheader_nobukti || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },

      {
        key: 'modifiedby',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        name: 'modifiedby',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
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
                ref={(el) => {
                  inputColRefs.current['modifiedby'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none text-sm"
                value={
                  filters.filters.modifiedby
                    ? filters.filters.modifiedby.toUpperCase()
                    : ''
                }
                type="text"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase(); // Menjadikan input menjadi uppercase
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
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 200,
        name: 'created_at',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
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
                className="filter-input z-[999999] h-8 rounded-none text-sm"
                value={
                  filters.filters.created_at
                    ? filters.filters.created_at.toUpperCase()
                    : ''
                }
                type="text"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase(); // Menjadikan input menjadi uppercase
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
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
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
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 200,
        name: 'updated_at',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%] px-8"
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
                  inputColRefs.current['updated_at'] = el;
                }}
                className="filter-input z-[999999] h-8 rounded-none text-sm"
                value={
                  filters.filters.updated_at
                    ? filters.filters.updated_at.toUpperCase()
                    : ''
                }
                type="text"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase(); // Menjadikan input menjadi uppercase
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
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
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
        'GridPenerimaanDetail',
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
        'GridPenerimaanDetail',
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
        'GridPenerimaanDetail',
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
  function getRowClass(row: PenerimaanDetail) {
    const rowIndex = rows.findIndex((r) => r.id === row.id);
    return rowIndex === selectedRow ? 'selected-row' : '';
  }
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
        .filter((col): col is Column<PenerimaanDetail> => !!col);
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
    loadGridConfig(user.id, 'GridPenerimaanDetail');
  }, []);
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      filters: { ...prev.filters, nobukti: nobukti ?? headerData.nobukti }
    }));
  }, [headerData.nobukti, nobukti]);
  useEffect(() => {
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  useEffect(() => {
    if (detail) {
      const formattedRows = detail?.data?.map((item: any) => ({
        id: item.id,
        nobukti: item.nobukti, // Updated to match the field name
        penerimaan_id: item.penerimaan_id, // Updated to match the field name
        coa: item.coa, // Updated to match the field name
        keterangan: item.keterangan, // Updated to match the field name
        coa_nama: item.coa_nama, // Updated to match the field name
        nominal: item.nominal, // Updated to match the field name
        transaksibiaya_nobukti: item.transaksibiaya_nobukti, // Updated to match the field name
        transaksilain_nobukti: item.transaksilain_nobukti, // Updated to match the field name
        pengeluaranemklheader_nobukti: item.pengeluaranemklheader_nobukti, // Updated to match the field name
        penerimaanemklheader_nobukti: item.penerimaanemklheader_nobukti, // Updated to match the field name
        pengembaliankasgantung_nobukti: item.pengembaliankasgantung_nobukti, // Updated to match the field name
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
    args: CellKeyDownArgs<PenerimaanDetail>,
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
          rowClass={getRowClass}
          rowHeight={30}
          renderers={{ noRowsFallback: <EmptyRowsRenderer /> }}
          className="rdg-light fill-grid text-xs"
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

export default GridPenerimaanDetail;
