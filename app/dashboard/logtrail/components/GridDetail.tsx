'use client';
import React, { JSX, useEffect, useMemo, useRef, useState } from 'react';
import 'react-data-grid/lib/styles.scss';
import DataGrid, {
  CellClickArgs,
  CellKeyDownArgs,
  Column,
  DataGridHandle
} from 'react-data-grid';
import { ImSpinner2 } from 'react-icons/im';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { IUser, setUser } from '@/lib/store/userSlice/userSlice';
import { formatDateTime } from '@/lib/utils';
import { FaSort, FaSortDown, FaSortUp, FaTimes } from 'react-icons/fa';
import { Input } from '@/components/ui/input';
import {
  useGetLogtrail,
  useGetLogtrailDetail,
  useGetLogtrailHeader
} from '@/lib/server/useLogtrail';
import { Filter } from '@/lib/apis/logtrail.api';

interface Row {
  [key: string]: any;
}
interface InputColRefs {
  [key: string]: React.RefObject<HTMLInputElement>;
}

const GridDetail = () => {
  const idDetail = useSelector((state: RootState) => state.logtrail.detail);

  const [filters, setFilters] = useState<Filter>({
    id: 0,
    page: 1,
    limit: 20,
    filters: {},
    search: '',
    sortKey: 'id',
    sortOrder: 'asc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const { data: logtrail, isLoading: isLoadingLogtrail } = useGetLogtrailDetail(
    {
      ...filters,
      page: currentPage
    }
  );

  const inputColRefs = useRef<InputColRefs>({});
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [selectedCol, setSelectedCol] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [inputValue, setInputValue] = useState<string>('');
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isFetchingManually, setIsFetchingManually] = useState(false);
  const [fetchedPages, setFetchedPages] = useState(new Set([currentPage]));
  const [rows, setRows] = useState<Row[]>([]);
  const dispatch = useDispatch();

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
      filters.sortKey === column && filters.sortOrder === 'asc'
        ? 'desc'
        : 'asc';

    setFilters((prevFilters) => ({
      ...prevFilters,
      sortKey: column,
      sortOrder: newSortOrder,
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
  const columns = useMemo(() => {
    if (!logtrail || !logtrail.data || logtrail.data.length === 0) {
      return [];
    }

    const headers = Object.keys(logtrail.data[0]);

    return headers.map((header) => ({
      key: header,
      name: header.charAt(0).toUpperCase() + header.slice(1),
      width: 150,
      headerCellClass: 'column-headers',
      renderHeaderCell: () => (
        <div className="flex cursor-pointer flex-col items-center">
          <div
            className="flex w-full flex-row justify-between"
            onClick={() => handleSort(header)}
          >
            <span className="text-sm">
              {header.charAt(0).toUpperCase() + header.slice(1)}
            </span>
            <div className="ml-2">
              {filters.sortKey === header ? (
                filters.sortOrder === 'asc' ? (
                  <FaSortUp className="font-bold" />
                ) : (
                  <FaSortDown className="font-bold" />
                )
              ) : (
                <FaSort className="text-zinc-400" />
              )}
            </div>
          </div>
        </div>
      ),
      renderCell: ({ row }: any) => {
        const cellValue = row[header];
        const columnFilter = filters.filters[header] || '';
        return (
          <div className="m-0 flex h-full cursor-pointer items-center p-0 text-xs">
            {highlightText(
              cellValue !== null && cellValue !== undefined
                ? cellValue.toString()
                : '',
              filters.search,
              columnFilter
            )}
          </div>
        );
      }
    }));
  }, [logtrail, filters]);

  function isAtTop({ currentTarget }: React.UIEvent<HTMLDivElement>): boolean {
    return currentTarget.scrollTop <= 10;
  }
  document.querySelectorAll('.column-headers').forEach((element) => {
    element.classList.remove('c1kqdw7y7-0-0-beta-47');
  });
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
      dispatch(setUser(foundRow as unknown as IUser));
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
    if (rows.length > 0 && selectedRow !== null) {
      const selectedRowData = rows[selectedRow];
      dispatch(setUser(selectedRowData as unknown as IUser));
    }
  }, [rows, selectedRow, dispatch]);
  useEffect(() => {
    if (idDetail) {
      setFilters({ ...filters, id: idDetail });
    }
  }, [idDetail]);

  useEffect(() => {
    if (!logtrail || isFetchingManually) return;

    const newRows = logtrail.data || [];

    setRows((prevRows) => {
      if (currentPage === 1) {
        return newRows;
      }
      if (!fetchedPages.has(currentPage)) {
        return [...prevRows, ...newRows];
      }

      return prevRows;
    });

    setHasMore(newRows.length === filters.limit);
    setFetchedPages((prev) => new Set(prev).add(currentPage));
  }, [logtrail, currentPage, filters, isFetchingManually]);
  return (
    <div className={`flex h-[100%] w-full justify-center`}>
      <div className="flex h-[100%]  w-full flex-col rounded-sm border border-blue-500 bg-white">
        <div
          className="flex h-[38px] w-full flex-row items-center rounded-t-sm border-b border-blue-500 px-2"
          style={{
            background: 'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 100%)'
          }}
        >
          <p className="text-sm font-bold text-zinc-600">Detail</p>
        </div>
        <DataGrid
          ref={gridRef}
          columns={columns}
          rows={rows}
          rowKeyGetter={rowKeyGetter}
          rowClass={getRowClass}
          onCellClick={handleCellClick}
          headerRowHeight={40}
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

export default GridDetail;
