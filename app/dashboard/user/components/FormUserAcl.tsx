import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle
} from '@/components/ui/dialog';
import React, {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import DataGrid, {
  CellClickArgs,
  CellKeyDownArgs,
  Column,
  DataGridHandle
} from 'react-data-grid';
import { ImSpinner2 } from 'react-icons/im';
import { useGetAllAcos } from '@/lib/server/useAcos';
import { Checkbox } from '@/components/ui/checkbox';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { toast } from '@/hooks/use-toast';
import { api, api2 } from '@/lib/utils/AxiosInstance';
import { useGetUserAcl } from '@/lib/server/useUser';
import { FaSave, FaSort, FaSortDown, FaSortUp, FaTimes } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';

interface Row {
  id: number;
  class: string;
  method: string;
  nama: string;
}
interface Filter {
  page: number;
  limit: number;
  filters: {
    method: string;
    class: string;
    nama: string;
  };
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

const FormUserAcl = ({
  popOver,
  setPopOver,
  forms,
  onSubmit,
  deleteMode,
  handleClose,
  isLoadingCreate,
  isLoadingUpdate
}: any) => {
  const gridRef = useRef<DataGridHandle>(null);

  const [rows, setRows] = useState<Row[]>([]);
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const userAclDetail = useSelector((state: RootState) => state.user.value);
  const { data: useracl, isLoading: isLoadingUserAcl } = useGetUserAcl(
    userAclDetail?.id ?? 0 // Gunakan default 0 jika id undefined
  );
  console.log(userAclDetail);
  const [currentPage, setCurrentPage] = useState(1);
  const [fetchedPages, setFetchedPages] = useState(new Set([currentPage]));

  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState<Filter>({
    page: 1, // Pagination
    limit: 20,
    filters: {
      method: '',
      class: '',
      nama: ''
    },
    sortBy: 'method',
    sortDirection: 'asc'
  });
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [checkedRows, setCheckedRows] = useState<Set<number>>(new Set());
  const { data: acos, isLoading: isLoadingAcos } = useGetAllAcos(
    { ...filters, page: currentPage },
    popOver
  );

  const inputColRefs = {
    class: useRef<HTMLInputElement>(null),
    method: useRef<HTMLInputElement>(null),
    nama: useRef<HTMLInputElement>(null)
  };
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
    setCurrentPage(1);
    setFetchedPages(new Set([1])); // Reset fetchedPages to [1]
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
  const handleRowSelect = (rowId: number) => {
    setCheckedRows((prev) => {
      const updated = new Set(prev);
      if (updated.has(rowId)) {
        updated.delete(rowId);
      } else {
        updated.add(rowId);
      }
      const data = Array.from(updated).map(Number); // Ensure each ID is a number
      forms.setValue('data', data);
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
        `<span style="background-color: yellow; font-size: 11px">${match}</span>`
    );

    return (
      <span
        className="text-xs"
        dangerouslySetInnerHTML={{ __html: highlightedText }}
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
    }, 250);
    setSelectedRow(0);
    setCurrentPage(1);
    setRows([]);
  };

  const columns = useMemo((): Column<Row>[] => {
    return [
      {
        key: 'nomor',
        name: 'NO',
        width: 50,
        resizable: true,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div
            className="flex w-full cursor-pointer justify-center"
            onClick={() => {
              setFilters({
                ...filters,
                filters: {
                  method: '',
                  class: '',
                  nama: ''
                }
              }),
                setTimeout(() => {
                  gridRef?.current?.selectCell({ rowIdx: 0, idx: 1 });
                }, 0);
            }}
          >
            <FaTimes className="bg-red-500 text-white" />
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
        key: 'select',
        name: 'Select',
        width: 50,
        renderHeaderCell: () => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={() => handleSelectAll()}
              id="header-checkbox"
            />
          </div>
        ),
        renderCell: ({ row }: { row: Row }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={checkedRows.has(Number(row.id))}
              onCheckedChange={() => handleRowSelect(Number(row.id))}
              id={`row-checkbox-${row.id}`}
            />
          </div>
        )
      },
      {
        key: 'class',
        name: 'CLASS',
        resizable: true,
        width: 150,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('class')}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'class' ? 'font-bold' : 'font-normal'
                }`}
              >
                CLASS
              </p>
              <div className="ml-2">
                {filters.sortBy === 'class' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'class' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="text-red-500" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>
            <div className="relative h-[50%] w-full px-1">
              <Input
                ref={inputColRefs.class}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.class || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleColumnFilterChange('class', value);
                }}
              />
              {filters.filters.class && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('class', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.class || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-xs">
              {highlightText(props.row.class || '', columnFilter)}
            </div>
          );
        }
      },
      {
        key: 'method',
        name: 'Method',
        resizable: true,
        width: 150,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('method')}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'method' ? 'font-bold' : 'font-normal'
                }`}
              >
                Method
              </p>
              <div className="ml-2">
                {filters.sortBy === 'method' &&
                filters.sortDirection === 'asc' ? (
                  <FaSortUp className="text-red-500" />
                ) : filters.sortBy === 'method' &&
                  filters.sortDirection === 'desc' ? (
                  <FaSortDown className="text-red-500" />
                ) : (
                  <FaSort className="text-zinc-400" />
                )}
              </div>
            </div>
            <div className="relative h-[50%] w-full px-1">
              <Input
                ref={inputColRefs.method}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.method || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleColumnFilterChange('method', value);
                }}
              />
              {filters.filters.method && (
                <button
                  className="absolute right-2 top-2 text-xs text-gray-500"
                  onClick={() => handleColumnFilterChange('method', '')}
                  type="button"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const columnFilter = filters.filters.method || '';
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-xs">
              {highlightText(props.row.method || '', columnFilter)}
            </div>
          );
        }
      },
      {
        key: 'nama',
        name: 'Nama',
        resizable: true,
        width: 150,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div
              className="headers-cell h-[50%]"
              onClick={() => handleSort('nama')}
            >
              <p
                className={`text-sm ${
                  filters.sortBy === 'nama' ? 'font-bold' : 'font-normal'
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
                ref={inputColRefs.nama}
                className="filter-input z-[999999] h-8 rounded-none"
                value={filters.filters.nama || ''}
                onChange={(e) => {
                  const value = e.target.value;
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
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-xs">
              {highlightText(props.row.nama || '', columnFilter)}
            </div>
          );
        }
      }
    ];
  }, [filters, rows, checkedRows]);

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
    if (!popOver || isLoadingAcos || !hasMore || rows.length === 0) return;

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
  function handleCellClick(args: CellClickArgs<Row>) {
    const clickedRow = args.row;
    const rowIndex = rows.findIndex((r) => r.id === clickedRow.id);

    if (rowIndex !== -1) {
      setSelectedRow(rowIndex);
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
  function EmptyRowsRenderer() {
    return (
      <div style={{ textAlign: 'center', gridColumn: '1/-1' }}>
        NO ROWS DATA FOUND
      </div>
    );
  }

  useEffect(() => {
    setIsFirstLoad(true);
  }, []);
  useEffect(() => {
    // Tambahkan penundaan singkat untuk memastikan grid sudah dirender sepenuhnya
    if (isFirstLoad && gridRef.current && rows.length > 0) {
      setTimeout(() => {
        gridRef.current?.selectCell({ rowIdx: 0, idx: 0 });
        setIsFirstLoad(false); // Pastikan hanya dilakukan sekali pada load pertama
      }, 100); // Penundaan singkat untuk memastikan grid ter-render
    }
  }, [rows, isFirstLoad]);
  useEffect(() => {
    if (useracl && useracl.data) {
      // Ekstrak ID dari data useracl dan konversi ke number
      const userAclIds: number[] = useracl.data.map((item: any) =>
        Number(item.id)
      );

      setCheckedRows(new Set(userAclIds));
      forms.setValue('data', userAclIds);
    }
  }, [useracl, forms]);

  useEffect(() => {
    if (!popOver) return;
    if (!acos) return;

    const newRows = acos.data || [];

    setRows((prevRows) => {
      // Reset rows if any filter changes (including pagination to page 1)
      if (currentPage === 1) {
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

    if (acos.pagination.totalPages) {
      setTotalPages(acos.pagination.totalPages);
    }

    setHasMore(newRows.length === filters.limit);
    setFetchedPages((prev) => new Set(prev).add(currentPage));
  }, [acos, currentPage, filters, popOver]);

  return (
    <Dialog open={popOver} onOpenChange={setPopOver}>
      <DialogTitle hidden={true}>Title</DialogTitle>
      <DialogContent className="flex h-full min-w-full flex-col overflow-hidden border bg-white">
        <div className="flex items-center justify-between bg-[#e0ecff] px-2 py-2">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            User ACL Form
          </h2>
          <div
            className="cursor-pointer rounded-md border border-zinc-200 bg-red-500 p-0 hover:bg-red-400"
            onClick={() => {
              setPopOver(false);
              handleClose();
            }}
          >
            <IoMdClose className="h-5 w-5 font-bold text-white" />
          </div>
        </div>
        <div className="h-full flex-1 overflow-y-auto bg-zinc-200 pl-1 pr-2">
          <div className="h-full bg-white px-5 py-3">
            <Form {...forms}>
              <form onSubmit={onSubmit} className="flex h-full flex-col gap-6">
                <div className="grid grid-cols-1 gap-2">
                  <FormField
                    name="username"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200">
                          Username
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={userAclDetail?.username ?? ''}
                            type="text"
                            readOnly={true}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex h-[500px]  w-full flex-col rounded-sm border border-blue-500 bg-white">
                  <div
                    className="flex h-[38px] w-full flex-row items-center rounded-t-sm border-b border-blue-500 px-2"
                    style={{
                      background:
                        'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 100%)'
                    }}
                  >
                    <p className="font-bold text-zinc-500">ACOS</p>
                  </div>
                  <DataGrid
                    ref={gridRef}
                    columns={columns}
                    rows={rows}
                    rowKeyGetter={rowKeyGetter}
                    rowClass={getRowClass}
                    onCellClick={handleCellClick}
                    rowHeight={30}
                    headerRowHeight={70}
                    className="rdg-light fill-grid"
                    onCellKeyDown={handleKeyDown}
                    onScroll={handleScroll}
                    renderers={{
                      noRowsFallback: isLoadingAcos ? (
                        <LoadRowsRenderer />
                      ) : (
                        <EmptyRowsRenderer />
                      )
                    }}
                  />
                </div>
              </form>
            </Form>
          </div>
        </div>
        <div className="m-0 flex h-fit items-end gap-2 bg-zinc-200 px-3 py-2">
          <Button
            type="submit"
            onClick={onSubmit}
            className="flex w-fit items-center gap-1 text-sm"
          >
            <FaSave />
            <p className="text-center">{deleteMode ? 'DELETE' : 'SAVE'}</p>
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="flex w-fit items-center gap-1 bg-zinc-500 text-sm text-white hover:bg-zinc-400"
            onClick={handleClose}
          >
            <IoMdClose /> <p className="text-center text-white">Cancel</p>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormUserAcl;
