import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback
} from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { TbLayoutNavbarFilled } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

import {
  setLookUpValue,
  setSearchTerm
} from '@/lib/store/searchLookupSlice/searchLookupSlice';
import { Label } from '../ui/label';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { ImSpinner2 } from 'react-icons/im';
import DataGrid, {
  CellKeyDownArgs,
  Column,
  DataGridHandle
} from 'react-data-grid';
import { api, api2 } from '@/lib/utils/AxiosInstance';
import {
  FaSort,
  FaSortDown,
  FaSortUp,
  FaTimes,
  FaTrashAlt
} from 'react-icons/fa';
import {
  clearOpenNameModal,
  setClearLookup,
  setOpenNameModal,
  setSubmitClicked,
  setType
} from '@/lib/store/lookupSlice/lookupSlice';
import { IoMdClose, IoMdRefresh } from 'react-icons/io';
import InputDatePicker from './InputDatePicker';
import { formatCurrency } from '@/lib/utils';
import LookUp from './LookUp';
import InputCurrency from './InputCurrency';

interface LookUpProps {
  endpoint?: string;
  label?: string;
  labelLookup?: string;
  filterby?: Record<string, any>;
  postData?: string;
  dataSortBy?: string;
  dataSortDirection?: string;
  existData?: string;
  mode?: string;
  rowIdx?: number;
  onSelectRow?: (selectedRowValue?: any | undefined) => void; // Make selectedRowValue optional
}
interface Filter {
  page: number;
  limit: number;
  filters: Record<string, string>;
  search: string;
  sortBy: string;
  sortDirection: string;
}
interface Row {
  id: string;
  [key: string]: any; // Add this line
}

export default function LookUpModalBiayaExtra({
  endpoint,
  label,
  labelLookup,
  dataSortBy,
  dataSortDirection,
  postData,
  filterby,
  existData,
  mode,
  rowIdx,
  onSelectRow
}: LookUpProps) {
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);
  const [isDisable, setIsDisable] = useState<boolean>(false);
  const [selectedCol, setSelectedCol] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const dispatch = useDispatch();
  const [hasMore, setHasMore] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [rowsBiayaExtra, setRowsBiayaExtra] = useState<Row[]>([]);
  const [errorNominal, setErrorNominal] = useState<Record<number, boolean>>({});
  const [showError, setShowError] = useState({
    label: label,
    status: false
  });

  const openNameModal = useSelector(
    (state: RootState) => state.lookup.openNameModal
  );
  const [fetchedPages, setFetchedPages] = useState<Set<number>>(new Set([1]));
  const collapse = useSelector((state: RootState) => state.collapse.value);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<Filter>({
    page: 1,
    limit: 20,
    filters: {},
    search: '',
    sortBy: dataSortBy ? dataSortBy : '',
    sortDirection: dataSortDirection ? dataSortDirection : 'asc'
  });
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Gabung params dari state & props
  const buildParams = useCallback(() => {
    const params: Record<string, any> = {
      page: 1,
      limit: filters.limit,
      search: filters.search || '',
      sortBy: filters.sortBy,
      sortDirection: filters.sortDirection
    };

    if (filters.filters) {
      for (const [k, v] of Object.entries(filters.filters)) params[k] = v;
    }
    if (filterby && !Array.isArray(filterby)) {
      // Pastikan filterby berfungsi dengan baik
      for (const [k, v] of Object.entries(filterby)) {
        params[k] = v; // menambahkan filterby ke params untuk API
      }
    }

    return params;
  }, [
    // currentPage,
    filters,
    filterby
  ]);

  const gridRef = useRef<DataGridHandle | null>(null);

  const handleSave = () => {
    // const obj = rowsBiayaExtra.reduce((acc, item) => {
    //   acc[item.biayaextra_id] = item;
    //   return acc;
    // }, {});
    // console.log('rowsBiayaExtra', rowsBiayaExtra, rowsBiayaExtra.toString())

    // return;
    onSelectRow?.(rowsBiayaExtra);
    dispatch(clearOpenNameModal());
    setOpen(false);
  };

  const handleInputChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setRowsBiayaExtra((prevRows: any) => {
      const updatedData = [...prevRows];

      updatedData[index][field] = value;

      if (
        updatedData[index].isNew &&
        Object.values(updatedData[index]).every((val) => val !== '')
      ) {
        updatedData[index].isNew = false;
      }

      return updatedData;
    });
  };

  const deleteRow = (index: number) => {
    // setRowsBiayaExtra(prev =>
    //   prev.filter((_, i) => i !== index)
    // );

    setRowsBiayaExtra(rowsBiayaExtra.filter((_: any, i: any) => i !== index));
  };

  const normalizeNumber = (val: any) => {
    if (!val) return 0;
    return Number(val.toString().replace(/,/g, ''));
  };

  const columnsBiayaExtra = useMemo((): Column<Row>[] => {
    return [
      {
        key: 'aksi',
        name: 'aksi',
        headerCellClass: 'column-headers',
        cellClass: 'form-input',
        width: 65,
        renderHeaderCell: () => (
          <div className="flex w-full cursor-pointer flex-col justify-center px-1">
            <p className="text-sm">aksi</p>
          </div>
        ),
        renderCell: (props: any) => {
          const rowIdx = props.rowIdx;

          const rowIndex = rows.findIndex(
            (row: any) => Number(row.id) === Number(props.row.id)
          );
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center justify-center p-0 text-xs">
              <button
                type="button"
                className="rounded bg-transparent text-xs text-red-500"
                onClick={() => {
                  deleteRow(rowIdx);
                }}
              >
                <FaTrashAlt className="text-2xl" />
              </button>
            </div>
          );
        }
      },
      {
        key: 'biayaextra_nobukti',
        name: 'biayaextra_nobukti',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center justify-center gap-1">
            <p className={`text-sm`}>NO BUKTI BIAYA EXTRA</p>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.isAddRow ? (
                ''
              ) : (
                <Input
                  type="text"
                  readOnly={true}
                  value={props.row.biayaextra_nobukti ?? ''}
                  className="h-2 min-h-9 w-full rounded border border-gray-300"
                />
              )}
            </div>
          );
        }
      },
      {
        key: 'estimasi',
        name: 'estimasi',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center justify-center gap-1">
            <p className={`text-sm`}>estimasi</p>
          </div>
        ),
        renderCell: (props: any) => {
          const rowIdx = props.rowIdx;
          let raw = props.row.estimasi ?? '';

          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.isAddRow ? (
                <div className="flex h-full w-full cursor-pointer items-center justify-end text-sm font-bold">
                  {formatCurrency(raw)}
                </div>
              ) : (
                <InputCurrency value={String(raw)} readOnly={true} />
              )}
            </div>
          );
        }
      },
      {
        key: 'nominal',
        name: 'nominal',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center justify-center gap-1">
            <p className={`text-sm`}>nominal</p>
          </div>
        ),
        renderCell: (props: any) => {
          const rowIdx = props.rowIdx;
          let raw = props.row.nominal ?? ''; // Nilai nominal awal

          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.isAddRow ? (
                <div className="flex h-full w-full cursor-pointer items-center justify-end text-sm font-bold">
                  {formatCurrency(raw)}
                </div>
              ) : (
                <div className="flex w-full flex-col">
                  <InputCurrency
                    value={String(raw)}
                    onValueChange={(value) => {
                      handleInputChange(rowIdx, 'nominal', value);
                      const valueNominal = normalizeNumber(value);
                      const valueEstimasi = normalizeNumber(props.row.estimasi);

                      if (valueNominal > valueEstimasi) {
                        setIsDisable(true);
                      } else {
                        setIsDisable(false);
                      }

                      setErrorNominal((prev: any) => ({
                        ...prev,
                        [rowIdx]: valueNominal > valueEstimasi
                      }));
                    }}
                  />
                  {errorNominal[rowIdx] && (
                    <p className="text-[0.8rem] text-destructive">
                      {`NOMINAL HARUS <= ESTIMASI`}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        }
      },
      {
        key: 'status',
        name: 'status',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center justify-center gap-1">
            <p className={`text-sm`}>status</p>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.isAddRow ? (
                ''
              ) : (
                <Input
                  type="text"
                  value={props.row.status || ''}
                  readOnly={true}
                  className="h-2 min-h-9 w-full rounded border border-gray-300"
                />
              )}
            </div>
          );
        }
      }
    ];
  }, [rowsBiayaExtra]);

  function isAtBottom(event: React.UIEvent<HTMLDivElement>): boolean {
    const { currentTarget } = event;
    if (!currentTarget) return false;

    return (
      currentTarget.scrollTop + currentTarget.clientHeight >=
      currentTarget.scrollHeight - 2
    );
  }

  async function handleScroll(event: React.UIEvent<HTMLDivElement>) {
    if (isLoading || !hasMore || rows.length === 0) return;

    const findUnfetchedPage = (pageOffset: number) => {
      let page = 1 + pageOffset;
      while (page > 0 && fetchedPages.has(page)) {
        page += pageOffset;
      }
      return page > 0 ? page : null;
    };

    if (isAtBottom(event)) {
      const nextPage = findUnfetchedPage(1);
      // if (nextPage && nextPage <= totalPages && !fetchedPages.has(nextPage)) {
      //   setCurrentPage(nextPage);
      // }
    }
  }

  document.querySelectorAll('.column-headers').forEach((element) => {
    element.classList.remove('c1kqdw7y7-0-0-beta-47');
  });

  const handleKeyDown = (
    args: CellKeyDownArgs<Row>,
    event: React.KeyboardEvent
  ) => {
    if (!openNameModal) {
      return;
    }
    const visibleRowCount = 8;
    const firstDataRowIndex = 0;
    const clickedRow = args.row;
    const rowIndex = rows.findIndex((r) => r.id === clickedRow.id);
    const classValue = clickedRow[postData as string];

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
        return Math.min(prev + 1, columnsBiayaExtra.length - 1);
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
    } else if (event.key === 'Enter') {
      dispatch(clearOpenNameModal());
      setInputValue(classValue);
      const value = clickedRow.id;
      onSelectRow?.(value); // cukup satu kali, tanpa else
      setOpen(false);
    }
  };

  async function fetchRows(signal?: AbortSignal): Promise<Row[]> {
    try {
      const response = await api2.get(`/${endpoint}`, {
        params: buildParams(),
        signal
      });

      const formattedRows = response.data.data.map((item: any) => ({
        id: Number(item.id),
        biayaextra_id: Number(item.biayaextra_id),
        biayaextra_nobukti: item.nobukti,
        estimasi: item.estimasi,
        nominal: item.estimasi,
        status: ''
      }));

      setRowsBiayaExtra([...formattedRows]);
      return formattedRows; // Return rows untuk digunakan di setRows
    } catch (error: any) {
      if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
        return [];
      }
      console.error('Failed to fetch rows', error);
      return [];
    }
  }

  function getRowClass(row: Row) {
    const rowIndex = rows.findIndex((r) => r.id === row.id);
    return rowIndex === selectedRow ? 'selected-row' : '';
  }

  function rowKeyGetter(row: any) {
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

  const handleInputKeydown = (event: any) => {
    if ((!open && !filters.filters) || !openNameModal) {
      return;
    }
    const rowData = rows[selectedRow];
    const totalRows = rows.length; // Ensure the data contains all rows
    const visibleRowCount = 12; // You can adjust this value based on your visible row count

    if (event.key === 'Enter') {
      dispatch(clearOpenNameModal());
      setInputValue(rowData[postData as string]);
      const value = rowData.id;
      onSelectRow?.(value); // cukup satu kali, tanpa else
      setOpen(false);
    }
    if (event.key === 'ArrowDown') {
      if (gridRef.current !== null) {
        // Only update selectedRow if we haven't reached the last row
        if (selectedRow < totalRows - 1) {
          setSelectedRow(selectedRow + 1);
          gridRef?.current?.selectCell({ rowIdx: selectedRow + 1, idx: 0 });
        }

        setTimeout(
          () => {
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }
          // type !== 'local' ? 300 : 150
        );
      }
    } else if (event.key === 'ArrowUp') {
      if (selectedRow === 0 && gridRef.current) {
        event.preventDefault();
      } else {
        setSelectedRow(selectedRow - 1);
        gridRef?.current?.selectCell({ rowIdx: selectedRow - 1, idx: 0 });

        setTimeout(
          () => {
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }
          // type !== 'local' ? 300 : 150
        );
      }
    } else if (event.key === 'PageDown') {
      setSelectedRow((prev) => {
        if (prev === null) return 0; // Start from the first row
        const nextRow = Math.min(prev + visibleRowCount, totalRows - 1);
        return nextRow;
      });
      const nextRow = Math.min(selectedRow + visibleRowCount, totalRows - 1);
      gridRef?.current?.selectCell({
        rowIdx: nextRow,
        idx: 0
      });
      // Ensure selectCell is updated after selectedRow change
      setTimeout(
        () => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }
        // type !== 'local' ? 300 : 150
      );
    } else if (event.key === 'PageUp') {
      setSelectedRow((prev) => {
        if (prev === null) return 0; // Start from the first row
        const newRow = Math.max(prev - visibleRowCount, 0);
        return newRow;
      });
      const newRow = Math.max(selectedRow - visibleRowCount, 0);
      gridRef?.current?.selectCell({
        rowIdx: newRow,
        idx: 0
      });
      // Ensure selectCell is updated after selectedRow change
      setTimeout(
        () => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }
        // type !== 'local' ? 300 : 150
      );
    }
  };

  const parseExistData = (existData?: string): any[] => {
    try {
      const parsed = JSON.parse(existData || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    setIsDisable(false);
    setIsLoading(true);
    abortRef.current?.abort('Effect re-run');
    const controller = new AbortController();
    abortRef.current = controller;

    (async () => {
      try {
        if (!open) return;

        const fetchedRows = await fetchRows(controller.signal);
        const savedData = parseExistData(existData);

        if (savedData.length > 0) {
          const savedMap = new Map(
            savedData.map((r: any) => [r.biayaextra_id, r])
          );

          // const mergedRows = fetchedRows.map(orig =>
          //   savedMap.get(orig.biayaextra_id)
          //     ? structuredClone(savedMap.get(orig.biayaextra_id))
          //     : structuredClone(orig)
          // );

          const mergedRows = fetchedRows.map((orig) => {
            const saved = savedMap.get(orig.biayaextra_id);

            return {
              ...(saved ? structuredClone(saved) : structuredClone(orig)),
              status: saved ? 'sudah ditambahkan' : ''
            };
          });

          setRowsBiayaExtra(mergedRows.sort((a, b) => a.id - b.id));
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch rows', err);
      } finally {
        setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, [open, endpoint]);

  useEffect(() => {
    const preventScrollOnSpace = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault(); // Mencegah scroll pada tombol space
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
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
    if (label === openNameModal) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [openNameModal, label]);

  useEffect(() => {
    const preventScrollOnSpace = (event: KeyboardEvent) => {
      if (inputRef.current) {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          // setSelectedRow(0); // Set selected row to the first row
          gridRef?.current?.selectCell({ rowIdx: 0, idx: 0 }); // Select the first cell in the grid
        }
        return; // Prevent propagation to other grid key handlers
      }
      document.addEventListener('keydown', preventScrollOnSpace);
    };
  }, [inputRef]);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTitle hidden={true}>Title</DialogTitle>

        <DialogContent className="flex h-full min-w-full flex-col overflow-hidden bg-black bg-opacity-50 p-10">
          <div className="flex items-center justify-between bg-[#e0ecff] px-2 py-2">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {labelLookup || label}
            </h2>
            <div
              className="cursor-pointer rounded-md border border-zinc-200 bg-red-500 p-0 hover:bg-red-400"
              onClick={() => {
                setOpen(false);
                setErrorNominal({});
                dispatch(clearOpenNameModal()); // Clear openNameModal ketika input dibersihkan
              }}
            >
              <IoMdClose className="h-5 w-5 font-bold text-white" />
            </div>
          </div>

          <div
            className={`${
              collapse === true ? 'w-full' : 'w-[100%]'
            } flex-grow overflow-hidden transition-all duration-300`}
          >
            <div className="h-full min-w-full border border-blue-500 bg-white p-6">
              <div className="my-4 h-[500px] w-full rounded-sm border border-blue-500">
                <DataGrid
                  ref={gridRef}
                  columns={columnsBiayaExtra}
                  rows={rowsBiayaExtra}
                  rowKeyGetter={rowKeyGetter}
                  onScroll={handleScroll}
                  rowClass={getRowClass}
                  rowHeight={50}
                  headerRowHeight={35}
                  className="rdg-light h-[450px]"
                  onCellKeyDown={handleKeyDown}
                  renderers={{
                    noRowsFallback: <EmptyRowsRenderer />
                  }}
                />
                {isLoading ? (
                  <div
                    className="flex w-full flex-row gap-2 py-1"
                    style={{
                      background:
                        'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 100%)'
                    }}
                  >
                    <LoadRowsRenderer />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className="m-0 flex h-fit items-end gap-2 bg-zinc-200 px-3 py-2">
            <Button
              type="button"
              variant="save"
              disabled={isDisable || mode == 'view' || mode == 'delete'}
              onClick={(e) => {
                handleSave();
              }}
            >
              <p className="text-center">SAVE</p>
            </Button>

            <Button
              type="button"
              variant="secondary"
              className="flex w-fit items-center gap-1 bg-zinc-500 text-sm text-white hover:bg-zinc-400"
              onClick={() => {
                setOpen(false);
                dispatch(clearOpenNameModal()); // Clear openNameModal ketika input dibersihkan
              }}
            >
              <IoMdClose /> <p className="text-center text-white">Cancel</p>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
