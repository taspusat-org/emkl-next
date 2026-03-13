'use client';
import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getPrintersFn, printFileFn, PrinterInfo } from '@/lib/apis/print.api';
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
import { extractPaperSizeFromPDF } from '@/lib/utils/paperSizeUtils';

const PRINTER_API_BASE = 'http://localhost:3004';

interface CustomPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  docUrl: string;
  defaultScale?: 'fit' | 'noscale';
  defaultColorMode?: 'color' | 'bw';
  showPages?: true | false;
}

const isMobileDevice = (): boolean => {
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(
      ua
    ) ||
    /Android|iOS|iPhone|iPad|iPod/.test(navigator.platform) ||
    ('ontouchstart' in window && typeof window.orientation !== 'undefined')
  );
};

async function callRestartSpooler(
  printerHost: string | null,
  printerName: string
): Promise<{ cooldownSeconds: number; endsAt: number }> {
  const isShared = printerHost !== null;
  const url = isShared
    ? `http://${printerHost}:3004/api/printer/restart-spooler`
    : `${PRINTER_API_BASE}/api/printer/restart-spooler`;

  const body = isShared ? { sharedPrinters: [printerName] } : {};

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Restart spooler gagal');
  return {
    cooldownSeconds: data.cooldownSeconds || 30,
    endsAt: data.endsAt || Date.now() + 30000
  };
}

// ============================================================
// Main Component
// ============================================================
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
  const [colorMode] = useState<'color' | 'bw'>(defaultColorMode);
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
  const dragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });

  const { alert } = useAlert();
  const dispatch = useDispatch();

  // Check printers on open
  useEffect(() => {
    if (!isOpen) return;
    if (isCheckingPrinters || isPrinterCheckComplete) return;

    if (isMobileDevice()) {
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

        const data = (await Promise.race([
          getPrintersFn(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 30000)
          )
        ])) as PrinterInfo[];

        setPrinters(data);
        const online = data.filter((p) => p.status === 'Online');
        if (online.length === 0) {
          alert({
            title: 'Printer Belum ada, silahkan install terlebih dahulu',
            variant: 'danger',
            submitText: 'OK',
            link: true
          });
          onClose();
          setIsPrinterCheckComplete(false);
          setPrinters([]);
        } else {
          setIsPrinterCheckComplete(true);
        }
      } catch {
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

  // Block Ctrl+P & F12
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (((e.ctrlKey || e.metaKey) && e.key === 'p') || e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
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

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;
    const handleKeydown = (e: KeyboardEvent) => {
      if (isLoading) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleAction();
      }
    };
    window.addEventListener('keydown', handleKeydown, true);
    return () => window.removeEventListener('keydown', handleKeydown, true);
  }, [isOpen, onClose, isLoading]);

  // Focus print button
  useEffect(() => {
    if (isOpen && !isLoading && isPrinterCheckComplete) {
      const t = setTimeout(() => printButtonRef.current?.focus(), 100);
      pos.current = { x: 0, y: 0 };
      if (innerRef.current)
        innerRef.current.style.transform = 'translate3d(0,0,0)';
      return () => clearTimeout(t);
    }
  }, [isOpen, isLoading, isPrinterCheckComplete]);

  // Detect paper size from PDF
  useEffect(() => {
    if (!isOpen || !docUrl || !isPrinterCheckComplete) return;
    (async () => {
      try {
        const result = await extractPaperSizeFromPDF(docUrl);
        if (result) {
          setPaperSize(result.paperSize);
          setLayout(result.layout);
        } else {
          setPaperSize('CUSTOM_A4');
          setLayout('portrait');
        }
      } catch {
        setPaperSize('CUSTOM_A4');
        setLayout('portrait');
      }
    })();
  }, [isOpen, docUrl, isPrinterCheckComplete]);

  // Restore last printer
  useEffect(() => {
    if (!isOpen || !isPrinterCheckComplete) return;
    const last = localStorage.getItem('lastPrinter');
    if (
      last &&
      printers.some(
        (p) => p.name.replace(/\\/g, '\\\\') === last && p.status === 'Online'
      )
    ) {
      setDestination(last);
      return;
    } else if (last) {
      localStorage.removeItem('lastPrinter');
    }
    const def = printers.find((p) => p.isDefault && p.status === 'Online');
    if (def) {
      setDestination(def.name.replace(/\\/g, '\\\\'));
      return;
    }
    setDestination('');
  }, [isOpen, isPrinterCheckComplete, printers]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setPrinters([]);
      setIsPrinterCheckComplete(false);
      setDestination('');
    }
  }, [isOpen]);

  // Drag handlers
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
    if (innerRef.current)
      innerRef.current.style.transform = `translate3d(${x}px,${y}px,0)`;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    dragging.current = false;
    innerRef.current?.releasePointerCapture(e.pointerId);
  };
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) onClose();
  };

  // ============================================================
  // handleAction: kirim print, tangkap error kertas_hilang
  // ============================================================
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
          scale: defaultScale
        }
      });

      localStorage.setItem('lastPrinter', destination);
      onClose();
    } catch (err: any) {
      console.error('Print error:', err);

      let errorData: any = null;
      try {
        if (err?.response?.data) errorData = err.response.data;
        else if (err?.message) {
          try {
            errorData = JSON.parse(err.message);
          } catch {
            /* not json */
          }
        }
      } catch {
        /* ignore */
      }

      const status = errorData?.status;

      // ✅ KERTAS HILANG — langsung restart spooler, tampilkan hasil lewat useAlert
      if (status === 'kertas_hilang') {
        const printerHost: string | null = errorData.printerHost || null;
        const printerDest = destination;

        // Tutup print modal dulu agar alert dari useAlert tampil bebas tanpa z-index bentrok
        onClose();

        try {
          await callRestartSpooler(printerHost, printerDest);
          alert({
            variant: 'success',
            title:
              'Kertas hilang terdeteksi. Spooler telah di-restart, printer akan siap dalam 30 detik. Silakan cetak ulang.',
            submitText: 'OK'
          });
        } catch (restartErr: any) {
          alert({
            variant: 'danger',
            title: `Kertas hilang terdeteksi. Gagal restart spooler: ${restartErr.message}`,
            submitText: 'OK'
          });
        }
        return;
      }

      // ✅ COOLDOWN AKTIF
      if (status === 'spooler_cooldown') {
        const remaining = errorData?.remainingSeconds || 30;
        onClose();
        alert({
          variant: 'danger',
          title: `Printer sedang restart. Mohon tunggu ${remaining} detik lagi.`,
          submitText: 'OK'
        });
        return;
      }

      // Error umum
      onClose();
      alert({
        title: 'Gagal mengirim dokumen ke printer. Silahkan hubungi Tim IT',
        variant: 'danger',
        submitText: 'OK'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useDisableBodyScroll(isOpen);

  if (!isOpen) return null;
  if (!isPrinterCheckComplete) return null;

  const modalContent = (
    <>
      {/* Backdrop */}
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

      {/* Print Modal */}
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
            {/* Destination */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                Destination
              </label>
              <select
                value={destination}
                onChange={(e) => {
                  const v = e.target.value;
                  setDestination(v);
                  localStorage.setItem('lastPrinter', v);
                }}
                disabled={isLoading}
                className="w-full border border-gray-400 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none disabled:opacity-50"
              >
                <option value="" hidden>
                  -- Pilih Printer --
                </option>
                {loadingPrinters ? (
                  <option disabled>Loading printers…</option>
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

            {/* Pages */}
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

            {/* Loading spinner */}
            {isLoading && (
              <div className="flex justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
              </div>
            )}
          </div>

          {/* Actions */}
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
    Object.assign(portalRoot.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      pointerEvents: 'none',
      zIndex: '2147483647'
    });
    document.body.appendChild(portalRoot);
  }

  return createPortal(modalContent, portalRoot);
};

export default CustomPrintModal;
