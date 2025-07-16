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
import { useDispatch } from 'react-redux';
import { FaSort, FaSortDown, FaSortUp, FaTimes } from 'react-icons/fa';
import { Input } from '@/components/ui/input';
import { useGetLogtrail } from '@/lib/server/useLogtrail';
import {
  setIdDetailLogtrail,
  setIdHeaderLogtrail
} from '@/lib/store/logtrailSlice/logtrailSlice';

interface Row {
  id: string;
  namatabel: string;
  postingdari: string;
  idtrans: string;
  nobuktitrans: string;
  aksi: string;
  modifiedby: string;
  created_at: string; // Tanggal dalam format ISO string
  updated_at: string; // Tanggal dalam format ISO string
}
interface Filter {
  page: number;
  limit: number;
  search: string;
  filters: {
    id: string; // Filter berdasarkan class
    namatabel: string; // Filter berdasarkan method
    postingdari: string; // Filter berdasarkan nama
    idtrans: string; // Filter berdasarkan nama
    nobuktitrans: string; // Filter berdasarkan nama
    aksi: string; // Filter berdasarkan nama
    modifiedby: string; // Filter berdasarkan nama
    updated_at: string; // Filter berdasarkan nama
    created_at: string; // Filter berdasarkan nama
  };
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

const GridLogtrail = () => {
  const [filters, setFilters] = useState<Filter>({
    page: 1,
    limit: 20,
    filters: {
      id: '', // Filter berdasarkan class
      namatabel: '', // Filter berdasarkan method
      postingdari: '', // Filter berdasarkan nama
      idtrans: '', // Filter berdasarkan nama
      nobuktitrans: '', // Filter berdasarkan nama
      aksi: '', // Filter berdasarkan nama
      modifiedby: '', // Filter berdasarkan nama
      created_at: '', // Filter berdasarkan nama
      updated_at: '' // Filter berdasarkan nama
    },
    search: '',
    sortBy: 'id',
    sortDirection: 'asc'
  });

  const [currentPage, setCurrentPage] = useState(1);
  const { data: logtrail, isLoading: isLoadingLogtrail } = useGetLogtrail({
    ...filters,
    page: currentPage
  });

  const inputColRefs = {
    id: useRef<HTMLInputElement>(null),
    namatabel: useRef<HTMLInputElement>(null),
    postingdari: useRef<HTMLInputElement>(null),
    idtrans: useRef<HTMLInputElement>(null),
    nobuktitrans: useRef<HTMLInputElement>(null),
    aksi: useRef<HTMLInputElement>(null),
    modifiedby: useRef<HTMLInputElement>(null),
    created_at: useRef<HTMLInputElement>(null),
    updated_at: useRef<HTMLInputElement>(null)
  };
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [selectedCol, setSelectedCol] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [inputValue, setInputValue] = useState<string>('');
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [prevFilters, setPrevFilters] = useState<Filter>(filters);
  const [fetchedPages, setFetchedPages] = useState(new Set([currentPage]));
  const [rows, setRows] = useState<Row[]>([]);
  const dispatch = useDispatch();
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
    setInputValue('');
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
  document.querySelectorAll('.column-headers').forEach((element) => {
    element.classList.remove('c1kqdw7y7-0-0-beta-47');
  });
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
        className="text-xs"
        dangerouslySetInnerHTML={{ __html: highlightedText }}
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
        id: '', // Filter berdasarkan class
        namatabel: '', // Filter berdasarkan method
        postingdari: '', // Filter berdasarkan nama
        idtrans: '', // Filter berdasarkan nama
        nobuktitrans: '', // Filter berdasarkan nama
        aksi: '', // Filter berdasarkan nama
        modifiedby: '', // Filter berdasarkan nama
        created_at: '', // Filter berdasarkan nama
        updated_at: '' // Filter berdasarkan nama
      },
      search: searchValue,
      page: 1
    }));
    setTimeout(() => {
      gridRef?.current?.selectCell({ rowIdx: 0, idx: 1 });
    }, 200);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 300);

    setSelectedRow(0);
    setFetchedPages(new Set([1]));
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
    }, 250);
    setSelectedRow(0);
    setCurrentPage(1);
    setFetchedPages(new Set([1]));
    setRows([]);
  };

  const columns = useMemo((): Column<Row>[] => {
    return [
      {
        key: 'nomor',
        name: 'NO',
        width: 50,
        headerCellClass: 'column-headers',
        resizable: true,
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
                    id: '', // Filter berdasarkan class
                    namatabel: '', // Filter berdasarkan method
                    postingdari: '', // Filter berdasarkan nama
                    idtrans: '', // Filter berdasarkan nama
                    nobuktitrans: '', // Filter berdasarkan nama
                    aksi: '', // Filter berdasarkan nama
                    modifiedby: '', // Filter berdasarkan nama
                    created_at: '', // Filter berdasarkan nama
                    updated_at: '' // Filter berdasarkan nama
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
            <div className="flex h-full w-full cursor-pointer items-center justify-center text-xs">
              {rowIndex + 1}
            </div>
          );
        }
      },
      {
        key: 'id',
        name: 'ID',
        width: 80,
        resizable: true,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('id')}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'id' ? 'font-bold' : 'font-normal'
                }`}
              >
                ID
              </p>
              <div className="ml-2">
                {filters.sortBy === 'id' && filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'id' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="font-bold" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>
            <div className="relative h-[50%] w-full px-1">
              <Input
                ref={inputColRefs.id}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.id || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleColumnFilterChange('id', value);
                }}
              />
              {filters.filters.id && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('id', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.id || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-xs">
              {highlightText(props.row.id || '', filters.search, columnFilter)}
            </div>
          );
        }
      },
      {
        key: 'namatabel',
        name: 'Namatabel',
        resizable: true,
        width: 150,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('namatabel')}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'namatabel' ? 'font-bold' : 'font-normal'
                }`}
              >
                Nama Tabel
              </p>
              <div className="ml-2">
                {filters.sortBy === 'namatabel' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'namatabel' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="font-bold" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>

            <div className="relative h-[50%] w-full px-1">
              <Input
                ref={inputColRefs.namatabel}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.namatabel || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleColumnFilterChange('namatabel', value);
                }}
              />
              {filters.filters.namatabel && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('namatabel', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.namatabel || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-xs">
              {highlightText(
                props.row.namatabel || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'postingdari',
        name: 'POSTING DARI',
        resizable: true,
        width: 150,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('postingdari')}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'postingdari' ? 'font-bold' : 'font-normal'
                }`}
              >
                POSTING DARI
              </p>
              <div className="ml-2">
                {filters.sortBy === 'postingdari' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'postingdari' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="font-bold" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>

            <div className="relative h-[50%] w-full px-1">
              <Input
                ref={inputColRefs.postingdari}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.postingdari || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleColumnFilterChange('postingdari', value);
                }}
              />
              {filters.filters.postingdari && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('postingdari', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.postingdari || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-xs">
              {highlightText(
                props.row.postingdari || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'idtrans',
        name: 'ID TRANS',
        resizable: true,
        width: 150,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('idtrans')}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'idtrans' ? 'font-bold' : 'font-normal'
                }`}
              >
                ID TRANS
              </p>
              <div className="ml-2">
                {filters.sortBy === 'idtrans' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'idtrans' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="font-bold" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>

            <div className="relative h-[50%] w-full px-1">
              <Input
                ref={inputColRefs.idtrans}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.idtrans || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleColumnFilterChange('idtrans', value);
                }}
              />
              {filters.filters.idtrans && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('idtrans', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.idtrans || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-xs">
              {highlightText(
                props.row.idtrans || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'nobuktitrans',
        name: 'NO BUKTI TRANS',
        resizable: true,
        width: 150,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('nobuktitrans')}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'nobuktitrans'
                    ? 'font-bold'
                    : 'font-normal'
                }`}
              >
                NO BUKTI TRANS
              </p>
              <div className="ml-2">
                {filters.sortBy === 'nobuktitrans' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'nobuktitrans' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="font-bold" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>

            <div className="relative h-[50%] w-full px-1">
              <Input
                ref={inputColRefs.nobuktitrans}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.nobuktitrans || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleColumnFilterChange('nobuktitrans', value);
                }}
              />
              {filters.filters.nobuktitrans && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('nobuktitrans', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.nobuktitrans || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-xs">
              {highlightText(
                props.row.nobuktitrans || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'aksi',
        name: 'AKSI',
        width: 150,
        resizable: true,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('aksi')}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'aksi' ? 'font-bold' : 'font-normal'
                }`}
              >
                AKSI
              </p>
              <div className="ml-2">
                {filters.sortBy === 'aksi' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'aksi' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="font-bold" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>

            <div className="relative h-[50%] w-full px-1">
              <Input
                ref={inputColRefs.aksi}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.aksi || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleColumnFilterChange('aksi', value);
                }}
              />
              {filters.filters.aksi && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('aksi', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.aksi || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-xs">
              {highlightText(
                props.row.aksi || '',
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
        width: 150,
        resizable: true,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
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
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-xs">
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
        width: 250,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('created_at')}
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
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
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
        width: 250,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('updated_at')}
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
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
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
  }, [filters, rows, filters.filters]);
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
    if (isLoadingLogtrail || !hasMore || rows.length === 0) return;

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

    if (isAtTop(event)) {
      const prevPage = findUnfetchedPage(-1);
      if (prevPage && !fetchedPages.has(prevPage)) {
        setCurrentPage(prevPage);
      }
    }
  }
  const gridRef = useRef<DataGridHandle>(null);
  function handleCellClick(args: CellClickArgs<Row>) {
    const clickedRow = args.row;
    const rowIndex = rows.findIndex((r) => r.id === clickedRow.id);
    const foundRow = rows.find((r) => r.id === clickedRow?.id);
    if (rowIndex !== -1 && foundRow) {
      setSelectedRow(rowIndex);
      dispatch(setIdHeaderLogtrail(clickedRow?.id as unknown as number));
      dispatch(setIdDetailLogtrail(clickedRow?.idtrans as unknown as number));
    }
  }

  async function handleKeyDown(
    args: CellKeyDownArgs<Row>,
    event: React.KeyboardEvent
  ) {
    const visibleRowCount = 10;
    const firstDataRowIndex = 0;

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

        const nextRow = Math.min(prev + visibleRowCount - 1, rows.length - 1);
        return nextRow;
      });
    } else if (event.key === 'PageUp') {
      setSelectedRow((prev) => {
        if (prev === null) return firstDataRowIndex;

        const newRow = Math.max(prev - visibleRowCount + 1, firstDataRowIndex);
        return newRow;
      });
    }
  }
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
      <div
        className="flex h-full w-full items-center justify-center"
        style={{ textAlign: 'center', gridColumn: '1/-1' }}
      >
        <ImSpinner2 className="animate-spin text-3xl text-primary" />
      </div>
    );
  }
  useEffect(() => {
    setIsFirstLoad(true);
  }, []);
  useEffect(() => {
    if (isFirstLoad && gridRef.current && rows.length > 0) {
      setSelectedRow(0);
      gridRef.current.selectCell({ rowIdx: 0, idx: 1 });
      setIsFirstLoad(false);
      dispatch(setIdHeaderLogtrail(rows[0].id as unknown as number));
      dispatch(setIdDetailLogtrail(rows[0].idtrans as unknown as number));
    }
  }, [rows, isFirstLoad]);

  useEffect(() => {
    if (rows.length > 0 && selectedRow !== null) {
      const selectedRowData = rows[selectedRow];
      dispatch(setIdHeaderLogtrail(selectedRowData.id as unknown as number)); // Pastikan data sudah benar
      dispatch(
        setIdDetailLogtrail(selectedRowData.idtrans as unknown as number)
      ); // Pastikan data sudah benar
    }
  }, [rows, selectedRow, dispatch]);

  useEffect(() => {
    if (!logtrail) return;

    const newRows = logtrail.data || [];

    setRows((prevRows) => {
      // Reset data jika filter berubah (halaman pertama)
      if (currentPage === 1 || filters !== prevFilters) {
        setCurrentPage(1); // Reset currentPage to 1
        setFetchedPages(new Set([1])); // Reset fetchedPages to [1]
        return newRows; // Use the fetched new rows directly
      }

      // Tambahkan data baru ke bawah untuk infinite scroll
      if (!fetchedPages.has(currentPage)) {
        return [...prevRows, ...newRows];
      }

      return prevRows;
    });
    if (logtrail.pagination.totalPages) {
      setTotalPages(logtrail.pagination.totalPages);
    }

    setHasMore(newRows.length === filters.limit);
    setFetchedPages((prev) => new Set(prev).add(currentPage));
    setPrevFilters(filters);
  }, [logtrail, currentPage, filters]);
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
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              handleInputChange(e);
            }}
            className="m-2 h-[28px] w-[200px] rounded-sm bg-white text-black"
            placeholder="Type to search..."
          />
        </div>
        <DataGrid
          ref={gridRef}
          columns={columns}
          rows={rows}
          rowKeyGetter={rowKeyGetter}
          rowClass={getRowClass}
          onCellClick={handleCellClick}
          headerRowHeight={70}
          rowHeight={30}
          className="rdg-light fill-grid"
          onCellKeyDown={handleKeyDown}
          onScroll={handleScroll}
          renderers={{
            noRowsFallback: isLoadingLogtrail ? (
              <LoadRowsRenderer />
            ) : (
              <EmptyRowsRenderer />
            )
          }}
        />
      </div>
    </div>
  );
};

export default GridLogtrail;
