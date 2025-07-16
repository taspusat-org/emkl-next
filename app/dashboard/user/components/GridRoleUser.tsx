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
import FormUserRole from './FormUserRole';
import { useGetUserRole, useUpdateUserRole } from '@/lib/server/useUser';
import {
  UserRoleInput,
  userRoleSchema
} from '@/lib/validations/user.validation';
import { formatDateTime } from '@/lib/utils';
import { ImSpinner2 } from 'react-icons/im';
import { resetUser, setUser } from '@/lib/store/userSlice/userSlice';
import { Button } from '@/components/ui/button';
interface Row {
  id: number;
  rolename: string;
  modifiedby: string;
  created_at: string;
  updated_at: string;
}
interface GridConfig {
  columnsOrder: number[];
  columnsWidth: { [key: string]: number };
}
const GridRoleUser = () => {
  const roleUserDetail = useSelector((state: RootState) => state.user.value);
  const {
    data: userrole,
    isLoading: isLoadingUserRole,
    refetch
  } = useGetUserRole(roleUserDetail?.id ?? 0);
  const dispatch = useDispatch();
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
  const [rows, setRows] = useState<Row[]>([]);
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const { user } = useSelector((state: RootState) => state.auth);
  const [popOver, setPopOver] = useState<boolean>(false);
  const { mutate: updateUserRole, isLoading: isLoadingUpdate } =
    useUpdateUserRole();

  const forms = useForm<UserRoleInput>({
    resolver: zodResolver(userRoleSchema),
    mode: 'onSubmit',
    defaultValues: {
      userId: 0,
      username: '',
      roleIds: []
    }
  });
  const columns = useMemo((): Column<Row>[] => {
    return [
      {
        key: 'rolename',
        headerCellClass: 'column-headers',
        name: 'Nama Role',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div
            className="flex h-full w-full cursor-pointer flex-col justify-center px-2"
            onContextMenu={handleContextMenu}
          >
            <p className="text-sm font-normal">Nama Role</p>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              <p className="text-sm font-normal">{props.row.rolename}</p>
            </div>
          );
        }
      },
      {
        key: 'modifiedby',
        width: 150,
        resizable: true,
        draggable: true,
        headerCellClass: 'column-headers',
        name: 'Modified By',
        renderHeaderCell: () => (
          <div
            className="flex h-full w-full cursor-pointer flex-col justify-center px-2"
            onContextMenu={handleContextMenu}
          >
            <p className="text-sm font-normal">Modified By</p>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full cursor-pointer items-center p-0 text-sm">
              <p className="text-sm font-normal">{props.row.modifiedby}</p>
            </div>
          );
        }
      },
      {
        key: 'created_at',
        width: 250,
        resizable: true,
        draggable: true,
        headerCellClass: 'column-headers',
        name: 'Created At',
        renderHeaderCell: () => (
          <div
            className="flex h-full w-full cursor-pointer flex-col justify-center px-2"
            onContextMenu={handleContextMenu}
          >
            <p className="text-sm font-normal">Created At</p>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-sm">
              {formatDateTime(props.row.created_at) === null
                ? '0'
                : formatDateTime(props.row.created_at)}
            </div>
          );
        }
      },
      {
        key: 'updated_at',
        name: 'Updated At',
        width: 250,
        resizable: true,
        draggable: true,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div
            className="flex h-full w-full cursor-pointer flex-col justify-center px-2"
            onContextMenu={handleContextMenu}
          >
            <p className="text-sm font-normal">Updated At</p>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-sm">
              {formatDateTime(props.row.updated_at) === null
                ? '0'
                : formatDateTime(props.row.updated_at)}
            </div>
          );
        }
      }
    ];
  }, [rows]);
  function handleCellClick(args: CellClickArgs<Row>) {
    const clickedRow = args.row;
    const rowIndex = rows.findIndex((r) => r.id === clickedRow.id);
    if (rowIndex !== -1) {
      setSelectedRow(rowIndex);
    }
  }
  function getRowClass(row: Row) {
    const rowIndex = rows.findIndex((r) => r.id === row.id);
    return rowIndex === selectedRow ? 'selected-row' : '';
  }
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
      saveGridConfig(user.id, 'GridRoleUser', [...columnsOrder], newWidthMap);
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

      saveGridConfig(user.id, 'GridRoleUser', [...newOrder], columnsWidth);
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
    // Memanggil refetch untuk mengambil data terbaru setelah update
    refetch();
  };

  const onSubmit = (values: UserRoleInput) => {
    updateUserRole(values, {
      onSuccess
    });
  };

  const handleEdit = () => {
    if (selectedRow !== null) {
      const rowData = rows[selectedRow];

      forms.setValue('userId', Number(roleUserDetail?.id));
      forms.setValue('username', roleUserDetail?.username as unknown as string);
    }
    setPopOver(true);
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
        'GridRoleUser',
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
    loadGridConfig(user.id, 'GridRoleUser');
  }, []);

  useEffect(() => {
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  useEffect(() => {
    if (roleUserDetail?.id && userrole) {
      // Check if userrole exists and map to rows only when roleUserDetail.id is available
      const formattedRows = userrole.data.map((item: any) => ({
        id: item.id,
        rolename: item.rolename,
        created_at: item.created_at,
        modifiedby: item.modifiedby,
        updated_at: item.updated_at // Ensure this matches the expected type
      }));

      setRows(formattedRows); // Set data yang sudah diformat ke rows
    } else {
      setRows([]); // Clear rows if roleUserDetail.id is not set
    }
  }, [userrole, roleUserDetail?.id]); // Trigger only when roleUserDetail.id changes or userrole changes
  async function handleKeyDown(
    args: CellKeyDownArgs<Row>,
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
  useEffect(() => {
    const headerCells = document.querySelectorAll('.rdg-header-row .rdg-cell');
    headerCells.forEach((cell) => {
      cell.setAttribute('tabindex', '-1');
    });
  }, []);
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

  return (
    <div className={`flex h-[100%] w-full justify-center`}>
      <div className="flex h-[100%] w-full flex-col border border-blue-500 bg-white">
        <DataGrid
          key={dataGridKey}
          ref={gridRef}
          columns={finalColumns}
          rowClass={getRowClass}
          onColumnResize={onColumnResize}
          onColumnsReorder={onColumnsReorder}
          rows={rows}
          headerRowHeight={null}
          rowHeight={30}
          onCellClick={handleCellClick}
          onCellKeyDown={handleKeyDown}
          renderers={{
            noRowsFallback: <EmptyRowsRenderer />
          }}
          className="rdg-light fill-grid"
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
          <ActionButton onEdit={handleEdit} />
          {isLoadingUserRole ? <LoadRowsRenderer /> : null}
        </div>
      </div>
      <FormUserRole
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

export default GridRoleUser;
