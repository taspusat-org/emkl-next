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
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { toast } from '@/hooks/use-toast';
import FormUser from './FormUser';
import {
  IRoleUser,
  IUserAcl,
  resetUser,
  setUser
} from '@/lib/store/userSlice/userSlice';
import {
  useCreateUser,
  useDeleteUser,
  useGetAllUser,
  useUpdateUser
} from '@/lib/server/useUser';
import { UserInput, userSchema } from '@/lib/validations/user.validation';
import { formatDateTime } from '@/lib/utils';
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import {
  exportUserBySelectFn,
  exportUserFn,
  getAllUserFn,
  reportUserBySelectFn
} from '@/lib/apis/user.api';
import { HiDocument } from 'react-icons/hi2';
import { setReportData } from '@/lib/store/reportSlice/reportSlice';
import { Checkbox } from '@/components/ui/checkbox';
import { useAlert } from '@/lib/store/client/useAlert';
import { Button } from '@/components/ui/button';
import IcClose from '@/public/image/x.svg';
import Image from 'next/image';
import {
  setLoaded,
  setLoading,
  setProcessed,
  setProcessing
} from '@/lib/store/loadingSlice/loadingSlice';
import { highlightText } from '@/components/custom-ui/HighlightText';
import { IUser } from '@/lib/types/user.type';

interface Row {
  id: number;
  username: string;
  name: string;
  password: string;
  email: string;
  modifiedby: string;
  text: string;
  namakaryawan: string;
  karyawan_id: number;
  statusaktif: number;
  created_at: string;
  updated_at: string;
}
interface Filter {
  page: number;
  limit: number;
  search: string;
  filters: {
    username: string;
    name: string;
    email: string;
    modifiedby: string;
    text: string;
    created_at: string;
    updated_at: string;
    statusaktif: string;
  };
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

interface GridConfig {
  columnsOrder: number[];
  columnsWidth: { [key: string]: number };
}

const GridUser = () => {
  const [filters, setFilters] = useState<Filter>({
    page: 1,
    limit: 20,
    filters: {
      username: '',
      name: '',
      email: '',
      modifiedby: '',
      created_at: '',
      updated_at: '',
      statusaktif: '',
      text: ''
    },
    search: '',
    sortBy: 'username',
    sortDirection: 'asc'
  });

  const [currentPage, setCurrentPage] = useState(1);
  const { data: users, isLoading: isLoadingUser } = useGetAllUser({
    ...filters,
    page: currentPage
  });
  const inputColRefs = {
    username: useRef<HTMLInputElement>(null),
    name: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    modifiedby: useRef<HTMLInputElement>(null),
    text: useRef<HTMLInputElement>(null),
    statusaktif: useRef<HTMLInputElement>(null),
    created_at: useRef<HTMLInputElement>(null),
    updated_at: useRef<HTMLInputElement>(null)
  };
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const { user } = useSelector((state: RootState) => state.auth);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [mode, setMode] = useState<string>('');
  const [isDataUpdated, setIsDataUpdated] = useState(false);

  const [inputValue, setInputValue] = useState<string>('');
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const resizeDebounceTimeout = useRef<NodeJS.Timeout | null>(null); // Timer debounce untuk resize
  const [popOver, setPopOver] = useState<boolean>(false);
  const [prevFilters, setPrevFilters] = useState<Filter>(filters);
  const { mutateAsync: createUser, isLoading: isLoadingCreate } =
    useCreateUser();
  const [isFetchingManually, setIsFetchingManually] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { mutateAsync: updateUser, isLoading: isLoadingUpdate } =
    useUpdateUser();
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
  const { mutateAsync: deleteUser, isLoading: isLoadingDelete } =
    useDeleteUser();
  const [fetchedPages, setFetchedPages] = useState(new Set([currentPage]));
  const [rows, setRows] = useState<Row[]>([]);
  const [checkedRows, setCheckedRows] = useState<Set<number>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const dispatch = useDispatch();
  const { alert } = useAlert();

  const forms = useForm<UserInput>({
    resolver: zodResolver(userSchema),
    mode: 'onTouched',
    defaultValues: {
      username: '',
      name: '',
      email: '',
      karyawan_id: undefined,
      statusaktif: 0,
      userId: ''
    }
  });
  const handleColumnFilterChange = (
    colKey: keyof Filter['filters'],
    value: string
  ) => {
    const columnIndex = columns.findIndex((col) => col.key === colKey);

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
      gridRef?.current?.selectCell({ rowIdx: 0, idx: columnIndex });
    }, 100);
    setTimeout(() => {
      const ref = inputColRefs[colKey]?.current;
      if (ref) {
        ref.focus();
      }
    }, 200);
    setSelectedRow(0);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setInputValue(searchValue);
    setCurrentPage(1);
    setFilters((prev) => ({
      ...prev,
      filters: {
        username: '',
        name: '',
        email: '',
        modifiedby: '',
        created_at: '',
        updated_at: '',
        statusaktif: '',
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
                    username: '',
                    name: '',
                    email: '',
                    text: '',
                    modifiedby: '',
                    created_at: '',
                    statusaktif: '',
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
        key: 'username',
        name: 'Username',
        resizable: true,
        draggable: true,
        width: 150,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('username')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'username' ? 'font-bold' : 'font-normal'
                }`}
              >
                Username
              </p>
              <div className="ml-2">
                {filters.sortBy === 'username' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'username' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="font-bold" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>
            <div className="relative h-[50%] w-full px-1">
              <Input
                ref={inputColRefs.username}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.username || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleColumnFilterChange('username', value);
                }}
              />
              {filters.filters.username && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('username', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.username || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.username || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'name',
        name: 'Name',
        resizable: true,
        draggable: true,
        headerCellClass: 'column-headers',
        width: 150,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('name')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'name' ? 'font-bold' : 'font-normal'
                }`}
              >
                Nama
              </p>
              <div className="ml-2">
                {filters.sortBy === 'name' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'name' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="font-bold" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>

            <div className="relative h-[50%] w-full px-1">
              <Input
                ref={inputColRefs.name}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.name || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleColumnFilterChange('name', value);
                }}
              />
              {filters.filters.name && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('name', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.name || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.name || '',
                filters.search,
                columnFilter
              )}
            </div>
          );
        }
      },
      {
        key: 'email',
        name: 'Email',
        resizable: true,
        draggable: true,
        headerCellClass: 'column-headers',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('email')}
              onContextMenu={handleContextMenu}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'email' ? 'font-bold' : 'font-normal'
                }`}
              >
                Email
              </p>
              <div className="ml-2">
                {filters.sortBy === 'email' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : filters.sortBy === 'email' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="font-bold" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>

            <div className="relative h-[50%] w-full px-1">
              <Input
                ref={inputColRefs.email}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.email || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleColumnFilterChange('email', value);
                }}
              />
              {filters.filters.email && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('email', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.email || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              {highlightText(
                props.row.email || '',
                filters.search,
                columnFilter
              )}
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
                  handleColumnFilterChange('statusaktif', value);
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
                    <SelectItem className="text=xs cursor-pointer" value="131">
                      <p className="text-sm font-normal">AKTIF</p>
                    </SelectItem>
                    <SelectItem className="text=xs cursor-pointer" value="132">
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
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onContextMenu={handleContextMenu}
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
              onContextMenu={handleContextMenu}
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
  }, [filters, rows, filters.filters, checkedRows]);
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
    if (isLoadingUser || !hasMore || rows.length === 0) return;

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
  const gridRef = useRef<DataGridHandle>(null);
  function handleCellClick(args: { row: Row }) {
    const clickedRow = args.row;
    const rowIndex = rows.findIndex((r) => r.id === clickedRow.id);
    const foundRow = rows.find((r) => r.id === clickedRow?.id);
    setSelectedId(clickedRow?.id);
    if (rowIndex !== -1 && foundRow) {
      setSelectedRow(rowIndex);
    }
  }
  document.querySelectorAll('.column-headers').forEach((element) => {
    element.classList.remove('c1kqdw7y7-0-0-beta-47');
  });
  const handleKeyDown = (
    args: CellKeyDownArgs<Row>,
    event: React.KeyboardEvent
  ) => {
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

        const nextRow = Math.min(prev + visibleRowCount - 1, rows.length - 1);
        return nextRow;
      });
    } else if (event.key === 'PageUp') {
      setSelectedRow((prev) => {
        if (prev === null) return firstDataRowIndex;

        const newRow = Math.max(prev - visibleRowCount + 1, firstDataRowIndex);
        return newRow;
      });
    } else if (event.key === ' ') {
      // Handle spacebar keydown to toggle row selection
      if (selectedRowId !== undefined) {
        handleRowSelect(selectedRowId); // Toggling the selection of the row
      }
    }
  };

  const onSuccess = async (indexOnPage: any, pageNumber: any) => {
    try {
      forms.reset();
      setRows([]);

      setPopOver(false);
      setIsFetchingManually(true);
      if (mode !== 'delete') {
        const response = await api2.get(`/redis/get/users-allItems`);

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

  const onSubmit = async (values: UserInput) => {
    const selectedRowId = rows[selectedRow]?.id;

    if (mode === 'delete') {
      if (selectedRowId) {
        dispatch(setProcessing());
        try {
          await deleteUser(selectedRowId as unknown as string, {
            onSuccess: () => {
              setPopOver(false);
              setRows((prevRows) =>
                prevRows.filter((row) => row.id !== selectedRowId)
              );
              if (selectedRow === rows.length - 1) {
                setSelectedRow(selectedRow - 1);
                gridRef?.current?.selectCell({
                  rowIdx: selectedRow - 1,
                  idx: 1
                });
              } else {
                setSelectedRow(selectedRow);
                gridRef?.current?.selectCell({ rowIdx: selectedRow, idx: 1 });
              }
            }
          });
        } catch (error) {
          console.error('Error exporting user data:', error);
        } finally {
          dispatch(setProcessed()); // Hide loading overlay when the request is finished
        }
      }
      return;
    }
    if (mode === 'add') {
      dispatch(setProcessing());
      try {
        const newOrder = await createUser(
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
      } catch (error) {
        console.error('Error exporting user data:', error);
      } finally {
        dispatch(setProcessed()); // Hide loading overlay when the request is finished
      }
      return;
    }

    if (selectedRowId && mode === 'edit') {
      dispatch(setProcessing());
      try {
        await updateUser(
          {
            id: selectedRowId as unknown as number,
            fields: { ...values, ...filters }
          },
          { onSuccess: (data) => onSuccess(data.itemIndex, data.pageNumber) }
        );
      } catch (error) {
        console.error('Error exporting user data:', error);
      } finally {
        dispatch(setProcessed()); // Hide loading overlay when the request is finished
      }
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
      saveGridConfig(user.id, 'GridUser', [...columnsOrder], newWidthMap);
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

      saveGridConfig(user.id, 'GridUser', [...newOrder], columnsWidth);
      return newOrder;
    });
  };

  const handleAdd = async () => {
    dispatch(setProcessing());

    try {
      setPopOver(true); // Close the popover
      forms.reset(); // Reset the form
      setMode('add');

      // Any other asynchronous operations can go here (e.g., API calls, validation, etc.)
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setMode('add');

      dispatch(setProcessed());
    }
  };

  const handleEdit = () => {
    dispatch(setProcessing()); // Start loading
    try {
      if (selectedRow !== null) {
        setPopOver(true);
        setMode('edit');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      dispatch(setProcessed()); // Stop loading
    }
  };

  const handleDelete = () => {
    dispatch(setProcessing()); // Start loading
    try {
      if (selectedRow !== null) {
        setPopOver(true);
        setMode('delete');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      dispatch(setProcessed()); // Stop loading
    }
  };
  const handleView = () => {
    dispatch(setProcessing()); // Start loading
    try {
      if (selectedRow !== null) {
        const rowData = rows[selectedRow];
        setPopOver(true);
        setMode('view');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      dispatch(setProcessed()); // Stop loading
    }
  };

  const handleReport = async () => {
    const { page, limit, ...filtersWithoutLimit } = filters;
    dispatch(setProcessing()); // Show loading overlay when the request starts

    try {
      const response = await getAllUserFn(filtersWithoutLimit);

      if (response.data === null || response.data.length === 0) {
        alert({
          title: 'DATA TIDAK TERSEDIA!',
          variant: 'danger',
          submitText: 'OK'
        });
      } else {
        const reportRows = response.data.map((row) => ({
          ...row,
          judullaporan: 'Laporan User',
          usercetak: user.username,
          tglcetak: new Date().toLocaleDateString(),
          judul: 'PT.TRANSPORINDO AGUNG SEJAHTERA'
        }));

        dispatch(setReportData(reportRows));
        window.open('/reports/user', '_blank');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert({
        title: 'Terjadi kesalahan saat memuat data!',
        variant: 'danger',
        submitText: 'OK'
      });
    } finally {
      dispatch(setProcessed()); // Hide loading overlay when the request is finished
    }
  };

  const handleReportBySelect = async () => {
    // Validasi: Periksa jika checkedRows kosong
    dispatch(setProcessing()); // Show loading overlay when the request starts

    try {
      // Kirim data ke API
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
      const response = await reportUserBySelectFn(jsonCheckedRows);

      // Proses data laporan yang diterima
      const reportRows = response.map((row: any) => ({
        ...row,
        judullaporan: 'Laporan User',
        usercetak: user.username,
        tglcetak: new Date().toLocaleDateString(),
        judul: 'PT.TRANSPORINDO AGUNG SEJAHTERA'
      }));

      // Simpan data laporan di store
      dispatch(setReportData(reportRows));

      // Buka laporan dalam tab baru
      window.open('/reports/user', '_blank');
    } catch (error) {
      console.error('Error generating report:', error);
      alert({
        title: 'Failed to generate the report. Please try again.',
        variant: 'danger',
        submitText: 'ok'
      });
    } finally {
      dispatch(setProcessed()); // Hide loading overlay when the request is finished
    }
  };

  const handleExport = async () => {
    dispatch(setProcessing()); // Show loading overlay when the request starts
    try {
      const { page, limit, ...filtersWithoutLimit } = filters;
      const response = await exportUserFn(filtersWithoutLimit);

      // Buat link untuk mendownload file
      const link = document.createElement('a');
      const url = window.URL.createObjectURL(response);
      link.href = url;
      link.download = `laporan_user${Date.now()}.xlsx`; // Nama file yang diunduh
      link.click(); // Trigger download

      // Revoke URL setelah download
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting user data:', error);
    } finally {
      dispatch(setProcessed()); // Hide loading overlay when the request is finished
    }
  };
  const handleExportBySelect = async () => {
    dispatch(setProcessing()); // Show loading overlay when the request starts

    try {
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
      const response = await exportUserBySelectFn(jsonCheckedRows);

      // Buat link untuk mendownload file
      const link = document.createElement('a');
      const url = window.URL.createObjectURL(response);
      link.href = url;
      link.download = `laporan_user${Date.now()}.xlsx`; // Nama file yang diunduh
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
    } finally {
      dispatch(setProcessed()); // Hide loading overlay when the request is finished
    }
  };

  const handleClose = () => {
    setPopOver(false);
    setMode('');

    forms.reset();
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
        'GridUser',
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
    loadGridConfig(user.id, 'GridUser');
  }, []);

  function getRowClass(row: Row) {
    if (row.id === selectedId) {
      return 'selected-row'; // Kelas CSS untuk baris yang dipilih
    } else {
      return ''; // Kembalikan kelas kosong untuk baris lainnya
    }
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
  useEffect(() => {
    setIsFirstLoad(true);
  }, []);

  useEffect(() => {
    if (
      selectedRow !== null &&
      rows.length > 0 &&
      selectedRow >= 0 && // Pastikan selectedRow adalah indeks yang valid
      selectedRow < rows.length && // Pastikan selectedRow berada dalam rentang indeks yang valid
      mode !== 'add' // Only fill the form if not in addMode
    ) {
      const rowData = rows[selectedRow];
      forms.setValue('username', rowData.username);
      forms.setValue('name', rowData.name);
      forms.setValue('email', rowData.email);
      forms.setValue('statusaktif', Number(rowData.statusaktif));
      forms.setValue('statusaktif_text', rowData.text);
      forms.setValue('karyawan_id', rowData.karyawan_id);
      forms.setValue('namakaryawan', rowData.namakaryawan);
    } else if (mode === 'add') {
      // If in addMode, ensure the form values are cleared
      forms.reset(); // Reset the form to keep it empty when in add mode
    }
  }, [forms, selectedRow, rows, mode]);

  useEffect(() => {
    if (isFirstLoad && gridRef.current && rows.length > 0) {
      setSelectedRow(0);
      gridRef.current.selectCell({ rowIdx: 0, idx: 1 });
      setIsFirstLoad(false);
    }
  }, [rows, isFirstLoad]);
  useEffect(() => {
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  useEffect(() => {
    if (rows.length > 0 && selectedRow !== null) {
      const selectedRowData = rows[selectedRow];
    }
  }, [rows, selectedRow, dispatch]);

  useEffect(() => {
    if (!users || isFetchingManually || isDataUpdated) return;

    const newRows = users.data || [];

    setRows((prevRows) => {
      // Reset rows if any filter changes (including pagination to page 1)
      if (currentPage === 1 || filters !== prevFilters) {
        setCurrentPage(1); // Reset currentPage to 1
        setFetchedPages(new Set([1])); // Reset fetchedPages to [1]
        return newRows; // Use the fetched new rows directly
      }

      // Add new rows at the bottom for infinite scroll if the current page wasn't fetched before
      if (!fetchedPages.has(currentPage)) {
        return [...prevRows, ...newRows];
      }

      return prevRows;
    });

    if (users.pagination.totalPages) {
      setTotalPages(users.pagination.totalPages);
    }

    setHasMore(newRows.length === filters.limit);
    setFetchedPages((prev) => new Set(prev).add(currentPage));
    setPrevFilters(filters);
  }, [users, currentPage, filters, isFetchingManually, isDataUpdated]);
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
          rowClass={getRowClass}
          onCellClick={handleCellClick}
          rowHeight={27}
          headerRowHeight={70}
          onColumnResize={onColumnResize}
          onColumnsReorder={onColumnsReorder}
          onSelectedCellChange={(args) => {
            handleCellClick({ row: args.row });
          }}
          className="rdg-light fill-grid"
          // onCellKeyDown={handleKeyDown}
          onScroll={handleScroll}
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
          {isLoadingUser ? <LoadRowsRenderer /> : null}
        </div>
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
      <FormUser
        popOver={popOver}
        setPopOver={setPopOver}
        forms={forms}
        mode={mode}
        handleClose={handleClose}
        onSubmit={forms.handleSubmit(onSubmit)}
        isLoadingCreate={isLoadingCreate}
        isLoadingDelete={isLoadingDelete}
        isLoadingUpdate={isLoadingUpdate}
      />
    </div>
  );
};

export default GridUser;
