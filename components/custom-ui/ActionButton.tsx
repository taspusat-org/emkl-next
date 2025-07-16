import React, { useState } from 'react';
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

interface CustomAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'success' | 'warning' | 'destructive' | 'outline';
  className?: string;
  disabled?: boolean; // Add disabled property
}

interface DropdownAction {
  label: string;
  onClick: () => void;
  className?: string; // Add className for custom styling
}

interface DropdownMenuItem {
  label: string;
  actions: DropdownAction[]; // List of actions within a dropdown
  className?: string; // Add className for custom styling
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

  // tambahkan disable flag per aksi
  disableAdd?: boolean;
  disableEdit?: boolean;
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
  customActions = [],
  dropdownMenus = [], // Receive multiple dropdown menus
  disableAdd = false,
  disableEdit = false,
  disableDelete = false,
  disableView = false,
  disableExport = false,
  disableReport = false
}: BaseActionProps) => {
  const [openMenu, setOpenMenu] = useState<number | null>(null); // Track which dropdown is open

  const handleDropdownClick = (index: number) => {
    // Close the dropdown when a button inside it is clicked
    setOpenMenu(openMenu === index ? null : index);
  };
  return (
    <div className="flex w-full flex-row gap-1 overflow-scroll lg:overflow-hidden">
      {onAdd && (
        <Button
          onClick={onAdd}
          disabled={disableAdd}
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
          disabled={disableEdit}
          variant="warning"
          className="text-sm font-thin disabled:opacity-50"
        >
          <MdEdit /> <p className="text-center text-sm">Edit</p>
        </Button>
      )}

      {onDelete && (
        <Button
          onClick={onDelete}
          disabled={disableDelete}
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

      {/* Dynamic Dropdown Menus */}
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
                    action.onClick(); // Call action's onClick
                    handleDropdownClick(index); // Close the dropdown
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
    </div>
  );
};

export default ActionButton;
