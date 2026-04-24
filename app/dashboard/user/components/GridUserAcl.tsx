/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import 'react-data-grid/lib/styles.scss';

import DataGrid, {
  CellClickArgs,
  CellKeyDownArgs,
  Column,
  DataGridHandle
} from 'react-data-grid';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import ActionButton from '@/components/custom-ui/ActionButton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import FormUserAcl from './FormUserAcl';
import { UserAclInput, userAclSchema } from '@/lib/validations/user.validation';
import { useGetUserAcl, useUpdateUserAcl } from '@/lib/server/useUser';
import { Button } from '@/components/ui/button';
import { ImSpinner2 } from 'react-icons/im';
import { useTheme } from 'next-themes';
import { EmptyRowsRenderer } from '@/components/EmptyRows';
import { LoadRowsRenderer } from '@/components/LoadRows';
import {
  handleContextMenu,
  loadGridConfig,
  resetGridConfig,
  saveGridConfig
} from '@/lib/utils';
interface Row {
  id: number;
  class: string;
  method: string;
  nama: string;
}

const GridUserAcl = () => {
  const { theme, resolvedTheme } = useTheme();
  const isDark = theme === 'dark' || resolvedTheme === 'dark';
  const userAclDetail = useSelector((state: RootState) => state.user.value);
  const {
    data: useracl,
    isLoading: isLoadingUserAcl,
    refetch
  } = useGetUserAcl(userAclDetail?.id ?? 0);
  const [rows, setRows] = useState<Row[]>([]);
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const { user } = useSelector((state: RootState) => state.auth);
  const [popOver, setPopOver] = useState<boolean>(false);
  const { mutate: updateUserAcl, isLoading: isLoadingUpdate } =
    useUpdateUserAcl();
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
  const forms = useForm<UserAclInput>({
    resolver: zodResolver(userAclSchema),
    mode: 'onTouched',
    defaultValues: {
      userId: 0,
      data: []
    }
  });

  const columns = useMemo((): Column<Row>[] => {
    return [
      {
        key: 'class',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: (column: any) => (
          <div
            className="flex h-full w-full cursor-pointer flex-col justify-center px-2"
            onContextMenu={(event) => setContextMenu(handleContextMenu(event))}
          >
            <p className="text-sm font-normal">CLASS</p>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              <p className="text-sm font-normal">{props.row.class}</p>
            </div>
          );
        },
        name: 'CLASS'
      },
      {
        key: 'method',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: (column: any) => (
          <div
            className="flex h-full w-full cursor-pointer flex-col justify-center px-2"
            onContextMenu={(event) => setContextMenu(handleContextMenu(event))}
          >
            <p className="text-sm font-normal">METHOD</p>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              <p className="text-sm font-normal">{props.row.method}</p>
            </div>
          );
        },
        name: 'METHOD'
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
      saveGridConfig(user.id, 'GridUserAcl', [...columnsOrder], newWidthMap);
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

      saveGridConfig(user.id, 'GridUserAcl', [...newOrder], columnsWidth);
      return newOrder;
    });
  };

  const handleClose = () => {
    setPopOver(false);
    forms.reset();
  };
  const onSuccess = () => {
    setPopOver(false);
    forms.reset();
    refetch();
  };
  const onSubmit = (values: UserAclInput) => {
    updateUserAcl(values, {
      onSuccess
    });
  };

  const handleEdit = () => {
    if (selectedRow !== null) {
      const rowData = rows[selectedRow];
      forms.setValue('userId', Number(userAclDetail?.id));
    }
    setPopOver(true);
  };

  function handleCellClick(args: CellClickArgs<Row>) {
    const clickedRow = args.row;
    const rowIndex = rows.findIndex((r) => r.id === clickedRow.id);
    if (rowIndex !== -1) {
      setSelectedRow(rowIndex);
    }
  }
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
      'GridUserAcl',
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
    if (useracl) {
      const formattedRows = useracl.data.map((item: any) => ({
        id: item.id,
        class: item.class,
        method: item.method,
        nama: item.nama,
        created_at: item.created_at,
        modifiedby: item.modifiedby,
        updated_at: item.updated_at
      }));

      setRows(formattedRows);
    } else if (!userAclDetail?.id) {
      setRows([]);
    }
  }, [useracl, userAclDetail?.id]);

  async function handleKeyDown(
    args: CellKeyDownArgs<Row>,
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
  return (
    <div className={`flex h-[100%] w-full justify-center`}>
      <div className="flex h-[100%] w-full flex-col border border-border bg-background">
        <DataGrid
          key={dataGridKey}
          ref={gridRef}
          columns={finalColumns}
          onColumnResize={onColumnResize}
          onColumnsReorder={onColumnsReorder}
          rows={rows}
          onCellClick={handleCellClick}
          headerRowHeight={null}
          onCellKeyDown={handleKeyDown}
          rowHeight={30}
          renderers={{ noRowsFallback: <EmptyRowsRenderer /> }}
          className={`${isDark ? 'rdg-dark' : 'rdg-light'} fill-grid text-xs`}
          enableVirtualization={false}
        />
        {contextMenu && (
          <div
            ref={contextMenuRef}
            className="bg-background-input"
            style={{
              position: 'fixed', // Fixed agar koordinat sesuai dengan viewport
              top: contextMenu.y, // Pastikan contextMenu.y berasal dari event.clientY
              left: contextMenu.x, // Pastikan contextMenu.x berasal dari event.clientX
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
                  'GridUserAcl',
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
          <ActionButton module="USER-ACL" onEdit={handleEdit} />
          {isLoadingUserAcl ? <LoadRowsRenderer /> : null}
        </div>
      </div>
      <FormUserAcl
        popOver={popOver}
        handleClose={handleClose}
        setPopOver={setPopOver}
        forms={forms}
        onSubmit={forms.handleSubmit(onSubmit)}
        isLoadingUpdate={isLoadingUpdate}
      />
    </div>
  );
};

export default GridUserAcl;
