'use client';
import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  getPrintersFn,
  printFileFn,
  PrinterInfo,
  PrinterDefault
} from '@/lib/apis/print.api';
import { IoMdClose } from 'react-icons/io';
import { FaPrint, FaTimes } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import useDisableBodyScroll from '@/lib/hooks/useDisableBodyScroll';
import { useAlert } from '@/lib/store/client/useAlert';
import {
  setProcessing,
  setProcessed
} from '@/lib/store/loadingSlice/loadingSlice';
import { useDispatch } from 'react-redux';

interface CustomPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  docUrl: string;
  defaultScale?: 'fit' | 'noscale';
  defaultColorMode?: 'color' | 'bw';
  showPages?: true | false;
}

const isMobileDevice = (): boolean => {
  const userAgent =
    navigator.userAgent || navigator.vendor || (window as any).opera;

  const mobileRegex =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;

  const isMobilePlatform = /Android|iOS|iPhone|iPad|iPod/.test(
    navigator.platform
  );

  const isTouchDevice =
    'ontouchstart' in window || navigator.maxTouchPoints > 0;

  const hasOrientation = typeof window.orientation !== 'undefined';

  return (
    mobileRegex.test(userAgent) ||
    isMobilePlatform ||
    (isTouchDevice && hasOrientation)
  );
};

const CustomPrintModal: React.FC<CustomPrintModalProps> = ({
  isOpen,
  onClose,
  docUrl,
  defaultScale = 'noscale',
  defaultColorMode = 'color',
  showPages = true
}) => {
  const [mounted, setMounted] = useState(false);
  const [destination, setDestination] = useState('');
  const [printers, setPrinters] = useState<PrinterInfo[]>([]);
  const [loadingPrinters, setLoadingPrinters] = useState(false);
  const [layout, setLayout] = useState<'portrait' | 'landscape'>('portrait');
  const [paperSize, setPaperSize] = useState('');
  const [colorMode, setColorMode] = useState<'color' | 'bw'>(defaultColorMode);
  const [isCheckingPrinters, setIsCheckingPrinters] = useState(false);

  const [pageOption, setPageOption] = useState<
    'all' | 'odd' | 'even' | 'custom'
  >('all');
  const [customPages, setCustomPages] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPrinterCheckComplete, setIsPrinterCheckComplete] = useState(false);

  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const printButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLDivElement | null>(null);

  const dragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });

  const { alert } = useAlert();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isOpen) return;

    // Hanya ambil printer jika modal benar-benar dibuka & pengecekan belum selesai
    if (isCheckingPrinters || isPrinterCheckComplete) return;

    const isMobile = isMobileDevice();
    if (isMobile) {
      alert({
        title: 'Silahkan gunakan perangkat Laptop / PC untuk mencetak dokumen',
        variant: 'danger',
        submitText: 'OK'
      });
      onClose();
      return;
    }

    const checkPrinters = async () => {
      try {
        setIsCheckingPrinters(true);
        dispatch(setProcessing());
        setLoadingPrinters(true);

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 10000)
        );
        const printersPromise = getPrintersFn();
        const data = (await Promise.race([
          printersPromise,
          timeoutPromise
        ])) as PrinterInfo[];

        setPrinters(data);
        const onlinePrinters = data.filter((p) => p.status === 'Online');

        if (onlinePrinters.length === 0) {
          alert({
            title: 'Printer Belum ada, silahkan install terlebih dahulu',
            variant: 'danger',
            submitText: 'OK',
            link: true
          });
          onClose();
          setIsPrinterCheckComplete(false);
          // Reset printers agar modal tidak dirender
          setPrinters([]);
        } else {
          setIsPrinterCheckComplete(true);
        }
      } catch (err) {
        alert({
          title: 'Printer Belum ada, silahkan install terlebih dahulu',
          variant: 'danger',
          submitText: 'OK',
          link: true
        });
        onClose();
        setIsPrinterCheckComplete(false);
        setPrinters([]);
      } finally {
        setLoadingPrinters(false);
        setIsCheckingPrinters(false);
        dispatch(setProcessed());
      }
    };

    checkPrinters();
  }, [
    isOpen,
    alert,
    onClose,
    dispatch,
    isCheckingPrinters,
    isPrinterCheckComplete
  ]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('contextmenu', handleContextMenu, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('contextmenu', handleContextMenu, true);
    };
  }, [isOpen]);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeydown = (e: KeyboardEvent) => {
      if (isLoading) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        handleAction();
      }
    };

    window.addEventListener('keydown', handleKeydown, true);
    return () => window.removeEventListener('keydown', handleKeydown, true);
  }, [isOpen, onClose, isLoading]);

  useEffect(() => {
    if (isOpen && !isLoading && isPrinterCheckComplete) {
      const timer = setTimeout(() => {
        printButtonRef.current?.focus();
      }, 100);

      pos.current = { x: 0, y: 0 };
      if (innerRef.current) {
        innerRef.current.style.transform = 'translate3d(0,0,0)';
      }

      return () => clearTimeout(timer);
    }
  }, [isOpen, isLoading, isPrinterCheckComplete]);

  useEffect(() => {
    const readPaperSizeFromPDF = async () => {
      try {
        const response = await fetch(docUrl);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const text = new TextDecoder('latin1').decode(uint8Array);

        const mediaBoxMatch = text.match(
          /\/MediaBox\s*\[\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\]/
        );

        if (mediaBoxMatch) {
          const width =
            parseFloat(mediaBoxMatch[3]) - parseFloat(mediaBoxMatch[1]);
          const height =
            parseFloat(mediaBoxMatch[4]) - parseFloat(mediaBoxMatch[2]);

          let pageWidth = Math.round(width * 0.352778 * 10) / 10;
          let pageHeight = Math.round(height * 0.352778 * 10) / 10;

          let selectedPaper = 'CUSTOM_A4';
          let selectedLayout: 'portrait' | 'landscape' = 'portrait';

          if (pageHeight == 210.1 || pageHeight == 296.9) {
            selectedPaper = 'CUSTOM_A4';
          } else if (pageHeight == 279.4) {
            selectedPaper = 'CUSTOM_LETTER';
          } else if (pageHeight == 139.7) {
            selectedPaper = 'CUSTOM_FAKTUR';
            selectedLayout = 'landscape';
          } else if (pageHeight >= 350 && pageHeight <= 360) {
            selectedPaper = 'CUSTOM_LEGAL';
          } else {
            selectedLayout = pageWidth > pageHeight ? 'landscape' : 'portrait';
          }

          setPaperSize(selectedPaper);
          setLayout(selectedLayout);
        } else {
          setPaperSize('CUSTOM_A4');
          setLayout('portrait');
        }
      } catch (err) {
        console.error('âš  Gagal membaca ukuran kertas dari PDF:', err);
        setPaperSize('CUSTOM_A4');
        setLayout('portrait');
      }
    };

    if (isOpen && docUrl && isPrinterCheckComplete) {
      readPaperSizeFromPDF();
    }
  }, [isOpen, docUrl, isPrinterCheckComplete]);

  useEffect(() => {
    if (!isOpen || !isPrinterCheckComplete) return;

    const lastPrinter = localStorage.getItem('lastPrinter');

    if (lastPrinter) {
      const isLastPrinterOnline = printers.some(
        (p) =>
          p.name.replace(/\\/g, '\\\\') === lastPrinter && p.status === 'Online'
      );

      if (isLastPrinterOnline) {
        setDestination(lastPrinter);
        return;
      } else {
        localStorage.removeItem('lastPrinter');
      }
    }

    const defaultPrinter = printers.find(
      (p) => p.isDefault === true && p.status === 'Online'
    );

    if (defaultPrinter) {
      setDestination(defaultPrinter.name.replace(/\\/g, '\\\\'));
      return;
    }

    setDestination('');
  }, [isOpen, isPrinterCheckComplete, printers]);

  const onPointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;

    if (target.tagName === 'BUTTON' || isLoading) {
      e.stopPropagation();
      return;
    }

    if (e.button !== 0) return;

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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const handleAction = async () => {
    if (isLoading || isCheckingPrinters) return;

    try {
      setIsLoading(true);
      const response = await fetch(docUrl);
      const fileBlob = await response.blob();

      let subset: 'odd' | 'even' | undefined;
      if (pageOption === 'odd') subset = 'odd';
      if (pageOption === 'even') subset = 'even';

      await printFileFn({
        file: fileBlob,
        options: {
          printer: destination,
          paperSize,
          pages: pageOption === 'custom' ? customPages : '',
          subset,
          monochrome: colorMode === 'bw',
          copies: 1,
          orientation: layout,
          scale: defaultScale,
          dpi: 300
        }
      });

      localStorage.setItem('lastPrinter', destination);
      onClose();
    } catch (err) {
      console.error('Gagal mengirim dokumen ke printer:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useDisableBodyScroll(isOpen);

  useEffect(() => {
    if (!isOpen) {
      // Reset semua state printer-related ketika modal ditutup
      setPrinters([]);
      setIsPrinterCheckComplete(false);
      setDestination('');
    }
  }, [isOpen]);

  if (!isOpen) return null;
  if (!isPrinterCheckComplete) return null; // atau true jika ingin spinner, tapi UI tidak diubah
  const modalContent = (
    <>
      <div
        ref={outerRef}
        className={cn(
          'fixed inset-0 z-[2147483640]',
          isOpen ? 'visible bg-black/30' : 'invisible bg-transparent'
        )}
        style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
        onClick={handleBackdropClick}
        aria-hidden={!isOpen}
      />

      <div
        className={cn(
          'fixed inset-0 z-[2147483641] flex items-center justify-center p-4',
          isOpen ? 'visible' : 'invisible'
        )}
        style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="print-dialog-title"
      >
        <div
          ref={innerRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className={cn(
            'relative flex w-full cursor-move flex-col overflow-hidden rounded-sm border border-blue-500 px-1 py-1 shadow-2xl md:w-[400px] lg:w-[400px]',
            isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
            isLoading && 'cursor-not-allowed'
          )}
          style={{
            background: 'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 10%)',
            pointerEvents: 'auto',
            isolation: 'isolate'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-1 mr-3 flex w-full flex-row items-center justify-between">
            <h2 className="ml-4 text-sm font-semibold uppercase tracking-wider text-gray-800">
              Print Dialog
            </h2>
            <div
              ref={closeButtonRef}
              className="w-fit rounded-sm bg-red-500 p-1"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <FaTimes
                className="cursor-pointer text-white"
                onClick={!isLoading ? onClose : undefined}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 border border-blue-500 border-b-[#dddddd] bg-white px-4 py-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                Destination
              </label>
              <select
                value={destination}
                onChange={(e) => {
                  const val = e.target.value;
                  setDestination(val);
                  localStorage.setItem('lastPrinter', val);
                }}
                disabled={isLoading}
                className="w-full border border-gray-400 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none disabled:opacity-50"
              >
                <option value="" hidden>
                  -- Pilih Printer --
                </option>
                {loadingPrinters ? (
                  <option disabled>Loading printersâ€¦</option>
                ) : printers.filter((p) => p.status === 'Online').length ===
                  0 ? (
                  <option disabled>Tidak ada printer online</option>
                ) : (
                  printers
                    .filter((p) => p.status === 'Online')
                    .map((p) => (
                      <option
                        key={p.name}
                        value={p.name.replace(/\\/g, '\\\\')}
                      >
                        {p.name}
                      </option>
                    ))
                )}
              </select>
            </div>

            {showPages && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Pages
                </label>
                <select
                  value={pageOption}
                  onChange={(e) => setPageOption(e.target.value as any)}
                  disabled={isLoading}
                  className="w-full border border-gray-400 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                >
                  <option value="all">All</option>
                  <option value="odd">Odd pages only</option>
                  <option value="even">Even pages only</option>
                  <option value="custom">Customised</option>
                </select>

                {pageOption === 'custom' && (
                  <Input
                    type="text"
                    placeholder="Contoh: 1-5, 7, 10"
                    value={customPages}
                    onChange={(e) => setCustomPages(e.target.value)}
                    disabled={isLoading}
                    className="mt-2 w-full border border-gray-400 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                  />
                )}
              </div>
            )}

            {isLoading && (
              <div className="flex justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
              </div>
            )}
          </div>

          <div className="flex items-start gap-4 border-x border-b border-blue-500 border-t-[#dddddd] bg-[#f4f4f4] py-2 md:flex-row">
            <Button
              type="submit"
              className="ml-4 flex w-fit items-center gap-1 text-sm"
              onClick={handleAction}
              ref={printButtonRef}
              tabIndex={0}
              disabled={isLoading}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="Print"
            >
              <FaPrint />
              {isLoading ? 'Printing...' : 'Print'}
            </Button>
            <Button
              type="button"
              variant="cancel"
              onClick={!isLoading ? onClose : undefined}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  if (!mounted || typeof window === 'undefined') return null;

  let portalRoot = document.getElementById('print-modal-root');
  if (!portalRoot) {
    portalRoot = document.createElement('div');
    portalRoot.id = 'print-modal-root';
    portalRoot.style.position = 'fixed';
    portalRoot.style.top = '0';
    portalRoot.style.left = '0';
    portalRoot.style.right = '0';
    portalRoot.style.bottom = '0';
    portalRoot.style.pointerEvents = 'none';
    portalRoot.style.zIndex = '2147483647';
    document.body.appendChild(portalRoot);
  }

  return createPortal(modalContent, portalRoot);
};

export default CustomPrintModal;
