import { HiCheckCircle, HiExclamationTriangle } from 'react-icons/hi2';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import * as React from 'react';
import useDisableBodyScroll from '@/lib/hooks/useDisableBodyScroll';
import { FaTimes } from 'react-icons/fa';
import DialogForceEdit from './DialogForceEdit';
import { useDispatch } from 'react-redux';
import { setForceEdit } from '@/lib/store/forceEditSlice/forceEditSlice';
import { useForceEditDialog } from '@/lib/store/client/useForceEdit';

export interface AlertOptions {
  title: string;
  variant: 'success' | 'danger';
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  catchOnCancel?: boolean;
  isForceEdit?: boolean;
  clickableText?: string;
  tableNameForceEdit?: string;
  valueForceEdit?: string | number;
  onTextClick?: () => void;
}

interface BaseAlertProps extends AlertOptions {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onCancel?: () => void;
}

export default function Alert({
  open,
  onClose,
  onSubmit,
  clickableText,
  onTextClick,
  isForceEdit,
  valueForceEdit,
  tableNameForceEdit,
  ...rest
}: BaseAlertProps) {
  const [isDialogOpen, setDialogOpen] = React.useState(false);
  const dispatch = useDispatch();
  const { title, variant, submitText } = rest;
  const { openDialog } = useForceEditDialog();
  const handleTextClick = () => {
    if (isForceEdit) {
      // 1) Buka dialog GLOBAL dengan data yang dibutuhkan
      openDialog({
        tableName: tableNameForceEdit!, // pastikan tidak undefined
        value: valueForceEdit!
        // onSuccess: () => { ... } // opsional
      });
      onTextClick?.();
      // 2) Tutup Alert TANPA khawatir dialog ikut unmount
      onClose();
      return;
    }

    onTextClick?.();
    onClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false); // Close the dialog
  };

  const handleLoginSubmit = (username: string, password: string) => {
    console.log('Logging in with', username, password);
    // Here you can handle the actual login logic (API calls, validation, etc.)
    handleDialogClose(); // Close the dialog after successful login
  };
  useDisableBodyScroll(open);
  React.useEffect(() => {
    dispatch(
      setForceEdit({
        tableName: String(tableNameForceEdit),
        tableValue: String(valueForceEdit)
      })
    ); // Dispatch action to set force edit state
  }, [dispatch, tableNameForceEdit, valueForceEdit]);

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-[999999] flex items-center justify-center p-4 transition-all duration-300 md:items-center',
          open ? 'visible bg-transparent' : 'invisible'
        )}
      >
        <div
          className={cn(
            'flex w-full cursor-move flex-col overflow-hidden rounded-sm border border-blue-500 px-1 py-1 shadow-xl md:w-[300px] lg:w-[300px]',
            open ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          )}
          style={{
            background: 'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 10%)'
          }}
        >
          <div className="z-[99999] mb-1 mt-2 flex w-full flex-row items-center justify-end">
            <div
              className="w-fit rounded-sm bg-red-500"
              onPointerDown={(e) => e.stopPropagation()}
            >
              {variant === 'danger' && (
                <FaTimes
                  className="cursor-pointer text-white"
                  onClick={onClose}
                />
              )}
            </div>
          </div>
          <div className="flex flex-col items-center border border-blue-500 border-b-[#dddddd] bg-white px-2 py-4">
            {variant === 'danger' && (
              <HiExclamationTriangle className="text-yellow-500" size={35} />
            )}
            {variant === 'success' && (
              <HiCheckCircle className="text-green-700" size={35} />
            )}
            <div className="mt-1 text-center">
              <h3 className="text-title text-base font-medium uppercase leading-6 text-zinc-900 md:text-xs lg:text-xs">
                {title}
              </h3>
              {/* {clickableText && (
                <p
                  className="mt-2 cursor-pointer text-sm font-semibold text-blue-600 hover:underline"
                  onClick={handleTextClick}
                >
                  {clickableText}
                </p>
              )} */}
            </div>
          </div>
          {(variant === 'danger' || variant === 'success') && (
            <div className="flex flex-col-reverse items-center justify-center gap-4 border-x border-b border-blue-500 border-t-[#dddddd] bg-[#f4f4f4] py-2 md:flex-row">
              {rest.cancelText && (
                <Button
                  variant="secondary"
                  className="z-[9999999] w-fit rounded-sm border border-blue-500 bg-white px-3 py-2 font-bold capitalize text-blue-500 hover:bg-blue-500 hover:text-white md:w-fit"
                  onClick={rest.onCancel ?? onClose}
                >
                  {rest.cancelText}
                </Button>
              )}
              <Button
                variant="destructive"
                className="text-red z-[9999999] w-fit rounded-sm border border-blue-500 bg-white px-3 py-2 font-bold capitalize text-blue-500 hover:bg-blue-500 hover:text-white md:w-fit"
                onClick={onSubmit}
              >
                {submitText}
              </Button>
              {cancelText && (
                <Button
                  variant="secondary"
                  className="w-fit rounded-sm border border-blue-500 bg-white px-3 py-2 font-bold capitalize text-blue-500 transition-all hover:bg-blue-500 hover:text-white md:w-fit"
                  onClick={onClose}
                >
                  {cancelText}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
