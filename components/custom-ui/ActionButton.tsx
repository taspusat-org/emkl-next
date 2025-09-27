import React, { useEffect, useState, useMemo } from 'react';
import { MdDelete, MdEdit } from 'react-icons/md';
import { FaPlus } from 'react-icons/fa6';
import { Button } from '../ui/button';
import { BsEye, BsEyeFill } from 'react-icons/bs';
import { FaFileExport, FaPrint } from 'react-icons/fa';
import { IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { LoadingOverlay } from './LoadingOverlay';
import usePermissions from '@/hooks/hasPermission';
import { getParameterApprovalFn } from '@/lib/apis/parameter.api';
import { useApprovalDialog } from '@/lib/store/client/useDialogApproval';
import { getPermissionFn } from '@/lib/apis/menu.api';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { useLainnyaDialog } from '@/lib/store/client/useDialogLainnya';
// Import API untuk get permissions (sesuaikan dengan API Anda)

interface CustomAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'success' | 'warning' | 'destructive' | 'outline';
  className?: string;
  disabled?: boolean;
}

interface DropdownAction {
  label: string;
  onClick: () => void;
  className?: string;
}

interface DropdownMenuItem {
  label: string;
  actions: DropdownAction[];
  className?: string;
  icon?: React.ReactNode;
}

interface BaseActionProps {
  onDelete?: () => void;
  onEdit?: () => void;
  onAdd?: () => void;
  onExport?: () => void;
  onReport?: () => void;
  onView?: () => void;
  customActions?: CustomAction[];
  dropdownMenus?: DropdownMenuItem[];
  module?: string;
  checkedRows?: Set<number>;
  disableAdd?: boolean;
  disableEdit?: boolean;
  isApproval?: boolean;
  disableDelete?: boolean;
  disableView?: boolean;
  disableExport?: boolean;
  disableReport?: boolean;
}

const ActionButton = ({
  onDelete,
  onEdit,
  onAdd,
  onExport,
  onReport,
  onView,
  checkedRows,
  module = '',
  customActions = [],
  dropdownMenus = [],
  disableAdd = false,
  isApproval = false,
  disableEdit = false,
  disableDelete = false,
  disableView = false,
  disableExport = false,
  disableReport = false
}: BaseActionProps) => {
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const { hasPermission, loading } = usePermissions();
  const [dataParameter, setDataParameter] = useState<any>([]);
  const { openDialog: openDialog } = useApprovalDialog();
  const { open, openDialog: openDialogLainnya } = useLainnyaDialog();
  const { id } = useSelector((state: RootState) => state.auth);

  // State untuk permissions
  const [permissions, setPermissions] = useState<any[]>([]);
  const [hasApprovalPermission, setHasApprovalPermission] = useState(false);
  const [hasNonApprovalPermission, setHasNonApprovalPermission] =
    useState(false);
  const [hasDataLainnyaPermission, setHasDataLainnyaPermission] =
    useState(false);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);

  // State untuk memisahkan data APPROVAL dan NON APPROVAL
  const [approvalData, setApprovalData] = useState<any[]>([]);
  const [nonApprovalData, setNonApprovalData] = useState<any[]>([]);
  const [dataLainnya, setDataLainnya] = useState<any[]>([]);

  const handleDropdownClick = (index: number) => {
    setOpenMenu(openMenu === index ? null : index);
  };

  const formattedModule = module?.replace(/-/g, ' ');

  const onClick = (value: any) => {
    openDialog({
      module: module,
      mode: value,
      checkedRows: checkedRows
    });
  };

  const onClickLainnya = (value: any) => {
    openDialogLainnya({
      module: module,
      mode: value,
      checkedRows: checkedRows
    });
  };

  // Function untuk check permissions berdasarkan data permission user
  const checkPermissions = (permissionData: any[]) => {
    // Filter permissions yang relevant dengan module saat ini

    const relevantPermissions = permissionData.filter((permission) => {
      const formattedSubject = permission.subject?.replace(/-/g, ' ');
      // Sesuaikan logic ini dengan struktur data permission Anda
      return formattedSubject?.toUpperCase() === formattedModule?.toUpperCase();
    });
    // Check apakah ada permission dengan YA (untuk APPROVAL)
    const hasYA = relevantPermissions.some(
      (permission) =>
        permission.action &&
        (permission.action.includes('-> YA') ||
          permission.action.toUpperCase().includes('YA'))
    );

    // Check apakah ada permission dengan TIDAK (untuk NON APPROVAL)
    const hasTIDAK = relevantPermissions.some(
      (permission) =>
        permission.action &&
        (permission.action.includes('-> TIDAK') ||
          permission.action.toUpperCase().includes('TIDAK'))
    );

    const hasLAINNYA = relevantPermissions.some(
      (permission) =>
        permission.action &&
        (permission.action.includes('DATA LAINNYA -> YA') ||
          permission.action.toUpperCase().includes('DATA LAINNYA -> YA'))
    );

    setHasApprovalPermission(hasYA);
    setHasNonApprovalPermission(hasTIDAK);
    setHasDataLainnyaPermission(hasLAINNYA);

    return { hasYA, hasTIDAK, hasLAINNYA };
  };

  // Function untuk filter data parameter berdasarkan permissions
  const filterParameterByPermission = (
    data: any[],
    hasYA: boolean,
    hasTIDAK: boolean
  ) => {
    const approvalItems: any[] = [];
    const nonApprovalItems: any[] = [];

    data.forEach((item) => {
      // Categorize berdasarkan nama atau field tertentu
      // Sesuaikan logic ini dengan struktur data Anda
      if (
        item.memo_nama?.toUpperCase().includes('APPROVAL') &&
        !item.memo_nama?.toUpperCase().includes('NON')
      ) {
        if (hasYA) {
          approvalItems.push(item);
        }
      } else if (
        item.memo_nama?.toUpperCase().includes('NON APPROVAL') ||
        item.memo_nama?.toUpperCase().includes('UN')
      ) {
        if (hasTIDAK) {
          nonApprovalItems.push(item);
        }
      }
    });

    setApprovalData(approvalItems);
    setNonApprovalData(nonApprovalItems);
  };

  // Fetch all required data
  const fetchData = async () => {
    setIsLoadingPermissions(true);
    try {
      // 1. Fetch HAK APPROVAL data
      const hakApprovalResponse = await getParameterApprovalFn({
        filters: { grp: 'HAK APPROVAL' }
      });

      // 2. Fetch user permissions (gunakan API permission yang sesuai)
      // Sesuaikan dengan endpoint permission Anda
      const res = await getPermissionFn(String(id));
      if (hakApprovalResponse?.data) {
        setDataParameter(hakApprovalResponse.data);
      }

      if (res?.abilities) {
        setPermissions(res.abilities);
        const { hasYA, hasTIDAK, hasLAINNYA } = checkPermissions(res.abilities);
        // Filter data parameter berdasarkan permissions
        if (hakApprovalResponse?.data) {
          filterParameterByPermission(
            hakApprovalResponse.data,
            hasYA,
            hasTIDAK
          );
        }
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      // Set default jika error
      setHasApprovalPermission(false);
      setHasNonApprovalPermission(false);
      setHasDataLainnyaPermission(false);
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  useEffect(() => {
    if (formattedModule) {
      fetchData();
    }
  }, [formattedModule]);

  // Computed value untuk menentukan apakah show dropdown
  const showApprovalDropdown = useMemo(() => {
    return hasApprovalPermission || hasNonApprovalPermission;
  }, [hasApprovalPermission, hasNonApprovalPermission]);

  // Computed value untuk data yang akan ditampilkan di dropdown
  const filteredApprovalData = useMemo(() => {
    const combinedData: any[] = [];

    // Tambahkan APPROVAL items jika ada permission
    if (hasApprovalPermission && approvalData.length > 0) {
      combinedData.push(...approvalData);
    }

    // Tambahkan NON APPROVAL items jika ada permission
    if (hasNonApprovalPermission && nonApprovalData.length > 0) {
      combinedData.push(...nonApprovalData);
    }

    return combinedData;
  }, [
    hasApprovalPermission,
    hasNonApprovalPermission,
    approvalData,
    nonApprovalData
  ]);

  // Computed value untuk label button
  const approvalButtonLabel = useMemo(() => {
    if (hasApprovalPermission && hasNonApprovalPermission) {
      return 'APPROVAL/NON';
    } else if (hasApprovalPermission) {
      return 'APPROVAL';
    } else if (hasNonApprovalPermission) {
      return 'NON APPROVAL';
    }
    return 'APPROVAL/NON';
  }, [hasApprovalPermission, hasNonApprovalPermission]);

  return (
    <div className="flex w-full flex-row gap-1 overflow-scroll lg:overflow-hidden">
      {onAdd && (
        <Button
          onClick={onAdd}
          disabled={disableAdd || !hasPermission(module, 'POST')}
          variant="default"
          className="bg-[#0f82e1] text-sm font-thin hover:bg-[#105892] disabled:opacity-50"
        >
          <FaPlus />
          <p className="text-sm font-normal">Add</p>
        </Button>
      )}

      {onEdit && (
        <Button
          onClick={onEdit}
          disabled={disableEdit || !hasPermission(module, 'PUT')}
          variant="warning"
          className="text-sm font-thin disabled:opacity-50"
        >
          <MdEdit /> <p className="text-center text-sm">Edit</p>
        </Button>
      )}

      {onDelete && (
        <Button
          onClick={onDelete}
          disabled={disableDelete || !hasPermission(module, 'DELETE')}
          variant="destructive"
          className="gap-1 text-sm font-thin disabled:opacity-50"
        >
          <MdDelete />
          <p className="text-center text-sm">Delete</p>
        </Button>
      )}

      {onView && (
        <Button
          onClick={onView}
          disabled={disableView}
          variant="default"
          className="gap-1 bg-orange-500 text-sm font-thin hover:bg-orange-700 disabled:opacity-50"
        >
          <BsEyeFill />
          <p className="text-center text-sm">View</p>
        </Button>
      )}

      {onExport && (
        <Button
          onClick={onExport}
          disabled={disableExport}
          variant="default"
          className="gap-1 bg-green-600 text-sm font-thin hover:bg-green-700 disabled:opacity-50"
        >
          <FaFileExport />
          <p className="text-center text-sm">Export</p>
        </Button>
      )}

      {onReport && (
        <Button
          onClick={onReport}
          disabled={disableReport}
          variant="default"
          className="gap-1 bg-cyan-500 text-sm font-thin hover:bg-cyan-700 disabled:opacity-50"
        >
          <FaPrint />
          <p className="text-center text-sm">Report</p>
        </Button>
      )}

      {customActions.map((action, idx) => (
        <Button
          key={idx}
          onClick={action.onClick}
          disabled={action.disabled ?? false}
          variant={action.variant || 'default'}
          className={`gap-1 text-sm font-thin ${action.className || ''} ${
            action.disabled ? 'disabled:opacity-50' : ''
          }`}
        >
          {action.icon} <p className="text-center text-sm">{action.label}</p>
        </Button>
      ))}

      {dropdownMenus.length > 0 &&
        dropdownMenus.map((menu, index) => (
          <DropdownMenu
            key={index}
            open={openMenu === index}
            onOpenChange={() => setOpenMenu(openMenu === index ? null : index)}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                className={`w-fit gap-1 text-sm font-normal ${
                  menu.className || ''
                }`}
              >
                {menu.icon}
                {menu.label} <IoMdArrowDropup />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="flex flex-col gap-1 border border-blue-500"
              side="top"
            >
              {menu.actions.map((action, actionIndex) => (
                <Button
                  key={actionIndex}
                  onClick={() => {
                    action.onClick();
                    handleDropdownClick(index);
                  }}
                  variant="default"
                  className={`w-full p-2 text-left text-sm font-thin ${
                    action.className || ''
                  }`}
                >
                  <p className="text-center text-sm font-normal">
                    {action.label}
                  </p>
                </Button>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}

      {/* APPROVAL/NON APPROVAL Dropdown - Only show if has permission */}
      {showApprovalDropdown && !isLoadingPermissions && (
        <DropdownMenu
          open={openMenu === 999} // Use unique index for approval dropdown
          onOpenChange={() => setOpenMenu(openMenu === 999 ? null : 999)}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="default"
              className={`w-fit gap-1 bg-purple-700 text-sm font-normal hover:bg-purple-800`}
            >
              {approvalButtonLabel}
              <IoMdArrowDropup />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="flex flex-col gap-1 border border-blue-500"
            side="top"
          >
            {filteredApprovalData.length > 0 ? (
              filteredApprovalData.map((item: any, index: number) => (
                <Button
                  key={`approval-${index}`}
                  onClick={() => {
                    onClick(item.memo_nama);
                    handleDropdownClick(999);
                  }}
                  variant="default"
                  style={{
                    backgroundColor: item?.warna,
                    color: item.warna_tulisan
                  }}
                  className={`w-full p-2 text-left text-sm font-thin`}
                >
                  <p className="text-center text-sm font-normal">
                    {item.memo_nama}
                  </p>
                </Button>
              ))
            ) : (
              <div className="p-2 text-center text-sm text-gray-500">
                Tidak ada opsi tersedia
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {hasDataLainnyaPermission && !isLoadingPermissions && (
        <Button
          key={`lainnya`}
          variant="default"
          className={`w-fit gap-1 bg-gray-500 text-sm font-normal hover:bg-gray-600`}
          onClick={() => {
            onClickLainnya('lainnya');
          }}
        >
          LAINNYA
          <IoMdArrowDropup />
        </Button>
      )}
    </div>
  );
};

export default ActionButton;
