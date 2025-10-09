'use client';
import React, { useEffect, useState, useRef } from 'react';
import {
  getPrintersFn,
  getPaperSizesFn,
  printFileFn,
  PrinterInfo
} from '@/lib/apis/print.api';

interface PaperSize {
  id: number;
  name: string;
}

interface CustomPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  docUrl: string;
  defaultOrientation?: 'portrait' | 'landscape';
  defaultScale?: 'fit' | 'noscale';
  defaultColorMode?: 'color' | 'bw';
}

const CustomPrintModal: React.FC<CustomPrintModalProps> = ({
  isOpen,
  onClose,
  docUrl,
  defaultOrientation = 'portrait',
  defaultScale = 'noscale',
  defaultColorMode = 'color'
}) => {
  const [destination, setDestination] = useState<string>('');
  const [printers, setPrinters] = useState<PrinterInfo[]>([]);
  const [loadingPrinters, setLoadingPrinters] = useState(false);

  const [pages, setPages] = useState<string>('');
  const [copies, setCopies] = useState<number>(1);
  const [layout, setLayout] = useState<'portrait' | 'landscape'>(
    defaultOrientation
  );
  const [colorMode, setColorMode] = useState<'color' | 'bw'>(defaultColorMode);
  const [paperSizes, setPaperSizes] = useState<PaperSize[]>([]);
  const [paperSize, setPaperSize] = useState<string>('');

  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetchPrinters = async () => {
      try {
        setLoadingPrinters(true);
        const data = await getPrintersFn();
        setPrinters(data);
      } catch (err) {
        console.error('Gagal mengambil daftar printer:', err);
      } finally {
        setLoadingPrinters(false);
      }
    };
    fetchPrinters();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const lastPrinter = localStorage.getItem('lastPrinter');
    const lastPaper = localStorage.getItem('lastPaper');
    if (lastPrinter) setDestination(lastPrinter);
    if (lastPaper) setPaperSize(lastPaper);
    setHasLoadedFromStorage(true);
  }, [isOpen]);

  useEffect(() => {
    const run = async () => {
      if (!isOpen || !hasLoadedFromStorage) return;

      if (!destination) {
        setPaperSizes([]);
        setPaperSize('');
        return;
      }

      try {
        const sizes = await getPaperSizesFn(destination);
        const validSizes: PaperSize[] = (sizes || [])
          .map((item: any, index: number) => ({
            id: item.id || index + 1,
            name: typeof item.name === 'object' ? item.name.name : item.name
          }))
          .filter(
            (item) =>
              item.name &&
              !String(item.name).toLowerCase().includes('user-defined')
          );

        setPaperSizes(validSizes);

        const storedPaper = localStorage.getItem('lastPaper');
        if (!storedPaper && validSizes.length > 0) {
          const defaultChoice =
            validSizes.find((s) => s.name === 'A4 210 x 297 mm') ||
            validSizes[0] ||
            null;
          setPaperSize(defaultChoice?.name || '');
        }
      } catch (err) {
        console.error('Gagal ambil paper sizes:', err);
        setPaperSizes([]);
        setPaperSize('');
      }
    };
    run();
  }, [isOpen, destination, hasLoadedFromStorage]);

  if (!isOpen) return null;

  const handleCancel = () => onClose();

  const handleAction = async () => {
    try {
      console.log('🖨️ Print to:', destination);
      const response = await fetch(docUrl);
      const fileBlob = await response.blob();

      await printFileFn({
        file: fileBlob,
        options: {
          printer: destination,
          paperSize,
          pages: pages,
          monochrome: colorMode === 'bw',
          copies: copies || 1,
          orientation: layout,
          scale: defaultScale
        }
      });

      localStorage.setItem('lastPrinter', destination);
      localStorage.setItem('lastPaper', paperSize);
      onClose();
    } catch (err) {
      console.error('Gagal mengirim dokumen ke printer:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="flex h-[90vh] w-[92vw] max-w-7xl border border-gray-300 bg-white">
        <div className="flex w-[420px] flex-col border-r border-gray-300 bg-[#f8f9fb] px-6 py-5">
          <h2 className="mb-5 text-xl font-semibold tracking-wide text-gray-800">
            PRINT
          </h2>
          <div className="mb-4">
            <label
              htmlFor="destination"
              className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-600"
            >
              Destination
            </label>
            <select
              id="destination"
              value={destination}
              onChange={(e) => {
                const val = e.target.value;
                setDestination(val);
                localStorage.setItem('lastPrinter', val);
              }}
              className="w-full border border-gray-400 bg-white px-2 py-1.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none"
            >
              {loadingPrinters ? (
                <option disabled>Loading printers…</option>
              ) : printers.length === 0 ? (
                <option disabled>Sedang mengambil data printer...</option>
              ) : (
                printers.map((p) => (
                  <option key={p.name} value={p.name.replace(/\\/g, '\\\\')}>
                    {p.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="mb-6">
            <label
              htmlFor="paper"
              className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-600"
            >
              Paper Size
            </label>
            <select
              id="paper"
              value={paperSize}
              onChange={(e) => {
                const val = e.target.value;
                setPaperSize(val);
                localStorage.setItem('lastPaper', val);
              }}
              disabled={!destination || paperSizes.length === 0}
              className="w-full border border-gray-400 bg-white px-2 py-1.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
            >
              {!destination ? (
                <option>(Pilih Printer terlebih dahulu ...)</option>
              ) : paperSizes.length === 0 ? (
                <option>(Paper size tidak tersedia ...)</option>
              ) : (
                paperSizes.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="mb-6">
            <label
              htmlFor="pages"
              className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-600"
            >
              Pages (contoh: 1-3,5)
            </label>
            <input
              id="pages"
              placeholder="All"
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              className="w-full border border-gray-400 bg-white px-2 py-1.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="mt-auto flex justify-end gap-3 border-t border-gray-300 pt-4">
            <button
              onClick={handleCancel}
              className="bg-gray-200 px-4 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleAction}
              className="bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Print
            </button>
          </div>
        </div>

        <div className="flex-1 bg-[#f0f3f7] p-2">
          <div className="h-full w-full border border-gray-300 bg-white">
            <iframe
              ref={iframeRef}
              src={`${docUrl}#toolbar=0&navpanes=0`}
              title="Print Preview"
              className="h-full w-full border-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomPrintModal;
