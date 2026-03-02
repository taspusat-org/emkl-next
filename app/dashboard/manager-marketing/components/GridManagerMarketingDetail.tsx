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
import { FaPen } from 'react-icons/fa';
import { ImSpinner2 } from 'react-icons/im';
import { Button } from '@/components/ui/button';
import { ManagerMarketingDetail } from '@/lib/types/managermarketingheader.type';
import { useGetManagerMarketingDetail } from '@/lib/server/useManagermarketing';
import {
  formatCurrency,
  handleContextMenu,
  loadGridConfig,
  resetGridConfig,
  saveGridConfig
} from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import DraggableColumn from '@/components/custom-ui/DraggableColumns';
import { highlightText } from '@/components/custom-ui/HighlightText';
import { useTheme } from 'next-themes';
import { EmptyRowsRenderer } from '@/components/EmptyRows';
import { LoadRowsRenderer } from '@/components/LoadRows';

const GridManagerMarketingDetail = () => {
  const { theme, resolvedTheme } = useTheme();
  const isDark = theme === 'dark' || resolvedTheme === 'dark';
  const headerData = useSelector((state: RootState) => state.header.headerData);
  const {
    data: detail,
    isLoading,
    refetch
  } = useGetManagerMarketingDetail(headerData?.id ?? 0);
  const [rows, setRows] = useState<ManagerMarketingDetail[]>([]);
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
  const columns = useMemo((): Column<ManagerMarketingDetail>[] => {
    return [
      {
        key: 'nominalawal',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div
            className="flex h-full w-full cursor-pointer flex-col justify-center px-2"
            onContextMenu={(event) => setContextMenu(handleContextMenu(event))}
          >
            <p className="text-sm font-normal">Nominal Awal</p>
          </div>
        ),
        name: 'nominal awal',
        renderCell: (props: any) => {
          const cellValue = props.row.nominalawal || '';
          return (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="m-0 flex h-full w-full cursor-pointer items-center justify-end p-0 text-xs">
                    {formatCurrency(props.row.nominalawal)}
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
        key: 'nominalakhir',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div
            className="flex h-full w-full cursor-pointer flex-col justify-center px-2"
            onContextMenu={(event) => setContextMenu(handleContextMenu(event))}
          >
            <p className="text-sm font-normal">Nominal Akhir</p>
          </div>
        ),
        name: 'nominal akhir',
        renderCell: (props: any) => {
          const cellValue =
            props.row.nominalakhir != null
              ? formatCurrency(props.row.nominalakhir)
              : '';
          return (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="m-0 flex h-full w-full cursor-pointer items-center justify-end p-0 text-xs">
                    {formatCurrency(props.row.nominalakhir)}
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
        key: 'persentase',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div
            className="flex h-full w-full cursor-pointer flex-col justify-center px-2"
            onContextMenu={(event) => setContextMenu(handleContextMenu(event))}
          >
            <p className="text-sm font-normal">Persentase</p>
          </div>
        ),
        name: 'persentase',
        renderCell: (props: any) => {
          const cellValue =
            props.row.persentase != null
              ? formatCurrency(props.row.persentase)
              : '';

          return (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="m-0 flex h-full w-full cursor-pointer items-center justify-end p-0 text-xs">
                    {formatCurrency(props.row.persentase)}
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
        key: 'statusaktif',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div
            className="flex h-full w-full cursor-pointer flex-col justify-center px-2"
            onContextMenu={(event) => setContextMenu(handleContextMenu(event))}
          >
            <p className="text-sm font-normal">status aktif</p>
          </div>
        ),
        name: 'status aktif',
        renderCell: (props: any) => {
          const memoData = props.row.memo ? JSON.parse(props.row.memo) : null;
          if (memoData) {
            return (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
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
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="rounded-none border border-zinc-400 bg-white text-sm text-zinc-900"
                  >
                    <p>{memoData.MEMO}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          }

          return <div className="text-xs text-gray-500">N/A</div>; // Tampilkan 'N/A' jika memo tidak tersedia
        }
      },

      {
        key: 'created_at',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 200,
        renderHeaderCell: () => (
          <div
            className="flex h-full w-full cursor-pointer flex-col justify-center px-2"
            onContextMenu={(event) => setContextMenu(handleContextMenu(event))}
          >
            <p className="text-sm font-normal">Created At</p>
          </div>
        ),
        name: 'Created At',
        renderCell: (props: any) => {
          const cellValue = props.row.created_at || '';
          return (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
                    {cellValue}
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
          <div
            className="flex h-full w-full cursor-pointer flex-col justify-center px-2"
            onContextMenu={(event) => setContextMenu(handleContextMenu(event))}
          >
            <p className="text-sm font-normal">Updated At</p>
          </div>
        ),
        name: 'Updated At',
        renderCell: (props: any) => {
          const cellValue = props.row.updated_at || '';
          return (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
                    {cellValue}
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
  }, [rows]);
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
        'GridManagerMarketingDetail',
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
        'GridManagerMarketingDetail',
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
      // filter key columns dengan key yg ada di columnsWidth
      const filteredColumns = columns.filter((col) =>
        Object.prototype.hasOwnProperty.call(columnsWidth, col.key)
      );
      // Mapping dan filter untuk menghindari undefined
      return columnsOrder
        .map((orderIndex) => filteredColumns[orderIndex])
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
    loadGridConfig(
      user.id,
      'GridManagerMarketingDetail',
      columns,
      setColumnsOrder,
      setColumnsWidth
    );
  }, []);
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
        managermarketing_id: item.managermarketing_id, // Updated to match the field name
        nominalawal: item.nominalawal, // Updated to match the field name
        nominalakhir: item.nominalakhir, // Updated to match the field name
        persentase: item.persentase, // Updated to match the field name
        statusaktif: item.statusaktif, // Updated to match the field name
        text: item.text, // Updated to match the field name
        memo: item.memo, // Updated to match the field name
        info: item.info, // Updated to match the field name
        modifiedby: item.modifiedby, // Updated to match the field name
        created_at: item.created_at, // Updated to match the field name
        updated_at: item.updated_at // Updated to match the field name
      }));

      setRows(formattedRows);
    } else if (!headerData?.id) {
      setRows([]);
    }
  }, [detail, headerData?.id]);

  async function handleKeyDown(
    args: CellKeyDownArgs<ManagerMarketingDetail>,
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
    if (headerData) {
      refetch();
    }
  }, [headerData]);

  return (
    <div className={`flex h-[100%] w-full justify-center`}>
      <div className="flex h-[100%] w-full flex-col rounded-sm border border-border bg-background">
        <div className="flex h-[38px] w-full flex-row items-center justify-between rounded-t-sm border-b border-border bg-background-grid-header px-2">
          <div className="flex flex-row items-center">
            {/* <label htmlFor="" className="text-xs">
              SEARCH :
            </label>
            <div className="relative flex w-[200px] flex-row items-center">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => {
                  handleInputChange(e);
                }}
                className="m-2 h-[28px] w-[200px] rounded-sm"
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
            </div> */}
          </div>
          <div className="flex flex-row items-center">
            <DraggableColumn
              defaultColumns={columns}
              saveColumns={finalColumns}
              userId={user.id}
              gridName="GridManagerMarketingDetail"
              setColumnsOrder={setColumnsOrder}
              setColumnsWidth={setColumnsWidth}
              onReset={() => {
                setDataGridKey((prevKey) => prevKey + 1);
                gridRef?.current?.selectCell({ rowIdx: 0, idx: 0 });
              }}
            />
          </div>
        </div>
        <DataGrid
          key={dataGridKey}
          ref={gridRef}
          columns={finalColumns}
          onColumnResize={onColumnResize}
          onColumnsReorder={onColumnsReorder}
          rows={rows ?? []}
          headerRowHeight={null}
          onCellKeyDown={handleKeyDown}
          rowHeight={30}
          renderers={{ noRowsFallback: <EmptyRowsRenderer /> }}
          className={`${isDark ? 'rdg-dark' : 'rdg-light'} fill-grid`}
          enableVirtualization={false}
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
            <Button
              variant="default"
              onClick={() => {
                resetGridConfig(
                  user.id,
                  'GridManagerMarketingDetail',
                  columns,
                  setColumnsOrder,
                  setColumnsWidth
                );
                setContextMenu(null);
                setDataGridKey((prevKey) => prevKey + 1);
                gridRef?.current?.selectCell({ rowIdx: 0, idx: 0 });
              }}
            >
              Reset
            </Button>
          </div>
        )}
        <div className="flex flex-row justify-between border border-x-0 border-b-0 border-border bg-background-grid-header p-2">
          {isLoading ? <LoadRowsRenderer /> : null}
        </div>
      </div>
    </div>
  );
};

export default GridManagerMarketingDetail;
