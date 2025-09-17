/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useState } from 'react';
import 'react-data-grid/lib/styles.scss';

import DataGrid, { CellClickArgs, CellKeyDownArgs } from 'react-data-grid';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import ActionButton from '@/components/custom-ui/ActionButton';
import FormRoleAcl from './FormRoleAcl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { setTriggerSelectRow } from '@/lib/store/roleaclSlice/roleaclSlice';
import { useDispatch } from 'react-redux';
import { useGetRoleAcl, useUpdateRoleAcl } from '@/lib/server/useRole';
import { RoleAclInput, roleAclSchema } from '@/lib/validations/role.validation';
import FormRoleAclTable from './FormRoleAclTable';
import { FaPen, FaPlus } from 'react-icons/fa';

interface Row {
  id: number;
  class: string;
  method: number;
  nama: string;
}

const GridRoleAcl = () => {
  const roleaclDetail = useSelector((state: RootState) => state.roleacl.value);

  const {
    data: roleacl,
    isLoading: isLoadingRoleacl,
    refetch
  } = useGetRoleAcl(
    roleaclDetail?.id || 0 // Berikan nilai default jika id tidak tersedia
  );
  const [rows, setRows] = useState<Row[]>([]);
  const dispatch = useDispatch();
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const { user } = useSelector((state: RootState) => state.auth);
  const [popOver, setPopOver] = useState<boolean>(false);
  const [popOverTable, setPopOverTable] = useState<boolean>(false);
  const { mutate: updateRoleAcl, isLoading: isLoadingUpdate } =
    useUpdateRoleAcl();

  const forms = useForm<RoleAclInput>({
    resolver: zodResolver(roleAclSchema),
    mode: 'onSubmit',
    defaultValues: {
      roleId: 0,
      data: []
    }
  });

  const columns = [
    {
      key: 'class',
      headerCellClass: 'column-headers',
      width: 200,
      renderHeaderCell: () => (
        <div className="flex w-full flex-col px-2">
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
      width: 200,
      renderHeaderCell: () => (
        <div className="flex w-full flex-col px-2">
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
  const handleClose = () => {
    setPopOver(false);
  };
  const handleCloseTable = () => {
    setPopOverTable(false);
    setPopOver(false);
  };
  const onSuccess = () => {
    setPopOver(false);
    forms.reset();
    dispatch(setTriggerSelectRow(true));
    refetch();
  };

  const onSubmit = (values: RoleAclInput) => {
    updateRoleAcl(values, {
      onSuccess
    });
  };

  const handleEdit = () => {
    if (selectedRow !== null) {
      const rowData = rows[selectedRow];
      forms.setValue('roleId', Number(roleaclDetail?.id));
    }
    setPopOver(true);
  };
  const handleEditTable = () => {
    setPopOverTable(true);
    setPopOver(false);
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

  useEffect(() => {
    if (roleaclDetail?.id) {
      if (roleacl) {
        const formattedRows = roleacl.data.map((item: any) => ({
          id: item.id,
          class: item.class,
          method: item.method,
          nama: item.nama
        }));

        setRows(formattedRows);
      }
    } else {
      setRows([]); // Reset rows jika roleaclDetail.id tidak valid
    }
  }, [roleacl, roleaclDetail?.id]);

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
      <div className="flex h-[100%]  w-full flex-col rounded-sm border border-blue-500 bg-white">
        <div
          className="flex h-[38px] w-full flex-row items-center rounded-t-sm border-b border-blue-500 px-2"
          style={{
            background: 'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 100%)'
          }}
        >
          <p className="font-bold text-zinc-600">Detail</p>
        </div>
        <DataGrid
          columns={columns}
          rows={rows}
          rowHeight={30}
          headerRowHeight={null}
          onCellKeyDown={handleKeyDown}
          onCellClick={handleCellClick}
          rowClass={getRowClass}
          renderers={{ noRowsFallback: <EmptyRowsRenderer /> }}
          className="rdg-light fill-grid text-xs"
        />
        <div
          className="border border-x-0 border-b-0 border-blue-500 p-2"
          style={{
            background: 'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 100%)'
          }}
        >
          <ActionButton module="ROLE-ACL" onEdit={handleEdit} />
          {/* <ActionButton module="ROLE" onEdit={handleEdit} /> */}
        </div>
      </div>
      <FormRoleAclTable
        popOverTable={popOverTable}
        setPopOverTable={setPopOverTable}
        handleCloseTable={handleCloseTable}
      />
      <FormRoleAcl
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

export default GridRoleAcl;
