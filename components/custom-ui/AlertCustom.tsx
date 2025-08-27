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
    );
  }, [dispatch, tableNameForceEdit, valueForceEdit]);
  const outerRef = React.useRef<HTMLDivElement>(null);
  const innerRef = React.useRef<HTMLDivElement>(null);
  const submitButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = React.useRef<HTMLDivElement | null>(null);

  // refs for drag state
  const dragging = React.useRef(false);
  const start = React.useRef({ x: 0, y: 0 });
  const pos = React.useRef({ x: 0, y: 0 });

  // Handle Escape and Enter key press
  React.useEffect(() => {
    if (!open) return;

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        onClose(); // Close the alert on Escape or Enter
      }
    };

    // Add event listener when alert is open
    window.addEventListener('keydown', handleKeydown);

    // Cleanup event listener when component is unmounted or alert is closed
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [open, onClose]); // Only run when 'open' state changes

  React.useEffect(() => {
    if (open) {
      setTimeout(() => submitButtonRef.current?.focus(), 300);
      pos.current = { x: 0, y: 0 };
      if (innerRef.current) {
        innerRef.current.style.transform = 'translate3d(0,0,0)';
      }
    }
  }, [open]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (
      e.target === submitButtonRef.current ||
      e.target === closeButtonRef.current
    ) {
      e.stopPropagation(); // Cegah event untuk bubble
      return;
    }

    if (e.button !== 0) return; // hanya untuk tombol kiri mouse
    dragging.current = true;
    start.current = {
      x: e.clientX - pos.current.x,
      y: e.clientY - pos.current.y
    };
    innerRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const x = e.clientX - start.current.x;
    const y = e.clientY - start.current.y;
    pos.current = { x, y };
    if (innerRef.current) {
      innerRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    dragging.current = false;
    innerRef.current?.releasePointerCapture(e.pointerId);
  };

  useDisableBodyScroll(open);
  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-[999999] flex items-center justify-center p-4 transition-all duration-300 md:items-center',
          open ? 'visible bg-transparent' : 'invisible'
        )}
      >
        <div
          ref={innerRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
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
              ref={closeButtonRef}
              className="w-fit rounded-sm bg-red-500"
              onPointerDown={(e) => e.stopPropagation()} // Stop propagation on close button click
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
              <h3 className="text-title text-base font-medium uppercase leading-6 text-zinc-900 md:text-3xl lg:text-xs">
                {title}
              </h3>
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
                ref={submitButtonRef}
                tabIndex={0}
                onPointerDown={(e) => e.stopPropagation()} // Stop propagation on submit button click
              >
                {submitText}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
