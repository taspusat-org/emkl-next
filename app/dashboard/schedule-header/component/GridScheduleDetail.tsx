'use client';

import 'react-data-grid/lib/styles.scss';
import { useSelector } from 'react-redux';
import { ImSpinner2 } from 'react-icons/im';
import { RootState } from '@/lib/store/store';
import { Button } from '@/components/ui/button';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useGetScheduleDetail } from '@/lib/server/useSchedule';
import { ScheduleDetail } from '@/lib/types/scheduleheader.type';
import DataGrid, {
  CellKeyDownArgs,
  Column,
  DataGridHandle
} from 'react-data-grid';

interface GridConfig {
  columnsOrder: number[];
  columnsWidth: { [key: string]: number };
}

const GridScheduleDetail = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const headerData = useSelector((state: RootState) => state.header.headerData);
  const gridRef = useRef<DataGridHandle>(null);
  const resizeDebounceTimeout = useRef<NodeJS.Timeout | null>(null); // Timer debounce untuk resize
  const [dataGridKey, setDataGridKey] = useState(0);
  const [rows, setRows] = useState<ScheduleDetail[]>([]);
  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const [columnsOrder, setColumnsOrder] = useState<readonly number[]>([]);
  const [columnsWidth, setColumnsWidth] = useState<{ [key: string]: number }>(
    {}
  );
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const {
    data: allDataDetail,
    isLoading,
    refetch
  } = useGetScheduleDetail(headerData?.id ?? 0);
  // console.log('allDataDetail', allDataDetail);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY });
  };

  const columns = useMemo((): Column<ScheduleDetail>[] => {
    return [
      {
        key: 'nobukti',
        name: 'NO BUKTI',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 200,
        renderHeaderCell: () => (
          <div
            className="flex h-full w-full cursor-pointer flex-col justify-center px-2"
            onContextMenu={handleContextMenu}
          >
            <p className="text-sm font-normal">NO BUKTI</p>
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
        key: 'pelayaran',
        name: 'pelayaran',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div
            className="flex h-full w-full cursor-pointer flex-col justify-center px-2"
            onContextMenu={handleContextMenu}
          >
            <p className="text-sm font-normal">PElAYARAN</p>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.pelayaran_nama}
            </div>
          );
        }
      },
      {
        key: 'kapal',
        name: 'kapal',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div
            className="flex h-full w-full cursor-pointer flex-col justify-center px-2"
            onContextMenu={handleContextMenu}
          >
            <p className="text-sm font-normal">KAPAL</p>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.kapal_nama}
            </div>
          );
        }
      },
      {
        key: 'tujuan kapal',
        name: 'tujuan kapal',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div
            className="flex h-full w-full cursor-pointer flex-col justify-center px-2"
            onContextMenu={handleContextMenu}
          >
            <p className="text-sm font-normal">TUJUAN KAPAL</p>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.tujuankapal_nama}
            </div>
          );
        }
      },
      {
        key: 'tglberangkat',
        name: 'tglberangkat',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div
            className="flex h-full w-full cursor-pointer flex-col justify-center px-2"
            onContextMenu={handleContextMenu}
          >
            <p className="text-sm font-normal">TGL BERANGKAT</p>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.tglberangkat}
            </div>
          );
        }
      },
      {
        key: 'tgltiba',
        name: 'tgltiba',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div
            className="flex h-full w-full cursor-pointer flex-col justify-center px-2"
            onContextMenu={handleContextMenu}
          >
            <p className="text-sm font-normal">TGL TIBA</p>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.tgltiba}
            </div>
          );
        }
      },
      {
        key: 'etb',
        name: 'etb',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div
            className="flex h-full w-full cursor-pointer flex-col justify-center px-2"
            onContextMenu={handleContextMenu}
          >
            <p className="text-sm font-normal">ETB</p>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.etb}
            </div>
          );
        }
      },
      {
        key: 'eta',
        name: 'eta',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div
            className="flex h-full w-full cursor-pointer flex-col justify-center px-2"
            onContextMenu={handleContextMenu}
          >
            <p className="text-sm font-normal">ETA</p>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.eta}
            </div>
          );
        }
      },
      {
        key: 'etd',
        name: 'etd',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div
            className="flex h-full w-full cursor-pointer flex-col justify-center px-2"
            onContextMenu={handleContextMenu}
          >
            <p className="text-sm font-normal">ETD</p>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.etd}
            </div>
          );
        }
      },
      {
        key: 'voy berangkat',
        name: 'voy berangkat',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div
            className="flex h-full w-full cursor-pointer flex-col justify-center px-2"
            onContextMenu={handleContextMenu}
          >
            <p className="text-sm font-normal">VOY BERANGKAT</p>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.voyberangkat}
            </div>
          );
        }
      },
      {
        key: 'voytiba',
        name: 'voytiba',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div
            className="flex h-full w-full cursor-pointer flex-col justify-center px-2"
            onContextMenu={handleContextMenu}
          >
            <p className="text-sm font-normal">VOY TIBA</p>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.voytiba}
            </div>
          );
        }
      },
      {
        key: 'closing',
        name: 'closing',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div
            className="flex h-full w-full cursor-pointer flex-col justify-center px-2"
            onContextMenu={handleContextMenu}
          >
            <p className="text-sm font-normal">CLOSING</p>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.closing}
            </div>
          );
        }
      },
      {
        key: 'etatujuan',
        name: 'etatujuan',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div
            className="flex h-full w-full cursor-pointer flex-col justify-center px-2"
            onContextMenu={handleContextMenu}
          >
            <p className="text-sm font-normal">ETA TUJUAN</p>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.etatujuan}
            </div>
          );
        }
      },
      {
        key: 'etdtujuan',
        name: 'etdtujuan',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div
            className="flex h-full w-full cursor-pointer flex-col justify-center px-2"
            onContextMenu={handleContextMenu}
          >
            <p className="text-sm font-normal">ETD TUJUAN</p>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.etdtujuan}
            </div>
          );
        }
      },
      {
        key: 'keterangan',
        name: 'keterangan',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div
            className="flex h-full w-full cursor-pointer flex-col justify-center px-2"
            onContextMenu={handleContextMenu}
          >
            <p className="text-sm font-normal">keterangan</p>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.keterangan}
            </div>
          );
        }
      }
    ];
  }, [rows]);

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
        'GridScheduleDetail',
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
        'GridScheduleDetail',
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
        'GridScheduleDetail',
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

  async function handleKeyDown(
    args: CellKeyDownArgs<ScheduleDetail>,
    event: React.KeyboardEvent
  ) {
    if (event.key === 'ArrowUp' && args.rowIdx === 0) {
      event.preventDefault();
    }
  }

  useEffect(() => {
    // useEffect untuk trigger grid yg kesipan di config kalo ada
    loadGridConfig(user.id, 'GridScheduleDetail');
  }, []);

  useEffect(() => {
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (allDataDetail) {
      const formattedRows = allDataDetail?.data?.map((item: any) => ({
        id: item.id,
        schedule_id: item.schedule_id,
        nobukti: item.nobukti, // Updated to match the field name
        pelayaran_id: item.pelayaran_id, // Updated to match the field name
        pelayaran_nama: item.pelayaran_nama, // Updated to match the field name
        kapal_id: item.kapal_id, // Updated to match the field name
        kapal_nama: item.kapal_nama, // Updated to match the field name
        tujuankapal_id: item.tujuankapal_id, // Updated to match the field name
        tujuankapal_nama: item.kapal_nama, // Updated to match the field name
        tglberangkat: item.tglberangkat, // Updated to match the field name
        tgltiba: item.tgltiba, // Updated to match the field name
        etb: item.etb, // Updated to match the field name
        eta: item.eta, // Updated to match the field name
        etd: item.etd, // Updated to match the field name
        voyberangkat: item.voyberangkat, // Updated to match the field name
        voytiba: item.voytiba, // Updated to match the field name
        closing: item.closing, // Updated to match the field name
        etatujuan: item.etatujuan, // Updated to match the field name
        etdtujuan: item.etdtujuan, // Updated to match the field name
        keterangan: item.keterangan, // Updated to match the field name
        modifiedby: item.modifiedby, // Updated to match the field name
        created_at: item.created_at, // Updated to match the field name
        updated_at: item.updated_at // Updated to match the field name
      }));

      setRows(formattedRows);
    } else if (!headerData?.id) {
      setRows([]);
    }
  }, [allDataDetail, headerData?.id]);

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
      <div className="flex h-[100%] w-full flex-col rounded-sm border border-blue-500 bg-white">
        <div
          className="flex h-[38px] w-full flex-row items-center border-b border-blue-500 px-2"
          style={{
            background: 'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 100%)'
          }}
        ></div>
        <DataGrid
          key={dataGridKey}
          ref={gridRef}
          columns={finalColumns}
          onColumnResize={onColumnResize}
          onColumnsReorder={onColumnsReorder}
          rows={rows}
          headerRowHeight={null}
          onCellKeyDown={handleKeyDown}
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

export default GridScheduleDetail;
