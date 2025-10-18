'use client';
import React, { useEffect, useState, useRef } from 'react';
import { getPrintersFn, printFileFn, PrinterInfo } from '@/lib/apis/print.api';

interface CustomPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  docUrl: string;
  reportName: string;
  defaultScale?: 'fit' | 'noscale';
  defaultColorMode?: 'color' | 'bw';
}

const CustomPrintModal: React.FC<CustomPrintModalProps> = ({
  isOpen,
  onClose,
  docUrl,
  reportName,
  defaultScale = 'noscale',
  defaultColorMode = 'color'
}) => {
  const [destination, setDestination] = useState('');
  const [printers, setPrinters] = useState<PrinterInfo[]>([]);
  const [loadingPrinters, setLoadingPrinters] = useState(false);
  const [layout, setLayout] = useState<'portrait' | 'landscape'>('portrait');
  const [paperSize, setPaperSize] = useState('');
  const [colorMode, setColorMode] = useState<'color' | 'bw'>(defaultColorMode);
  const [pageOption, setPageOption] = useState<
    'all' | 'odd' | 'even' | 'custom'
  >('all');
  const [customPages, setCustomPages] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const loadFromMRT = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_MRT_BASE_URL || '/reports';
        const mrtUrl = `${base}/${reportName}.mrt`;

        console.log('🔍 Membaca MRT dari:', mrtUrl);

        const res = await fetch(mrtUrl, { cache: 'no-store' });

        if (!res.ok) {
          console.warn(`⚠️ Gagal fetch file MRT (${res.status})`);
          return;
        }

        const text = await res.text();
        let pageHeight = 0;
        let pageWidth = 0;

        try {
          const json = JSON.parse(text);

          const pages = json.Pages;
          const firstPage = pages?.['0'] || pages?.[0];

          pageHeight = firstPage?.PageHeight ?? json.PageHeight ?? 0;
          pageWidth = firstPage?.PageWidth ?? json.PageWidth ?? 0;

          console.log('📊 Parsed JSON structure:', {
            hasPages: !!pages,
            firstPageKeys: firstPage ? Object.keys(firstPage) : [],
            pageHeight,
            pageWidth
          });
        } catch {
          const matchH = text.match(/"PageHeight"\s*:\s*([\d.]+)/);
          const matchW = text.match(/"PageWidth"\s*:\s*([\d.]+)/);
          if (matchH) pageHeight = parseFloat(matchH[1]);
          if (matchW) pageWidth = parseFloat(matchW[1]);
        }

        console.log('📄 MRT Loaded:', { reportName, pageHeight, pageWidth });

        let selectedPaper = 'CUSTOM_A4';
        let selectedLayout: 'portrait' | 'landscape' = 'portrait';

        if (pageHeight === 210.1 || pageHeight === 296.9) {
          selectedPaper = 'CUSTOM_A4';
        } else if (pageHeight === 279.4) {
          selectedPaper = 'CUSTOM_LETTER';
        } else if (pageHeight === 139.7) {
          selectedPaper = 'CUSTOM_FAKTUR';
          selectedLayout = 'landscape';
        } else if (pageHeight >= 350 && pageHeight <= 360) {
          selectedPaper = 'CUSTOM_LEGAL';
        } else {
          selectedLayout = pageWidth > pageHeight ? 'landscape' : 'portrait';
        }

        setPaperSize(selectedPaper);
        setLayout(selectedLayout);

        console.log(
          `✅ Ditetapkan dari MRT: ${selectedPaper}, ${selectedLayout}`
        );
      } catch (err) {
        console.error('❌ Gagal membaca MRT:', err);
      }
    };

    if (isOpen && reportName) loadFromMRT();
  }, [isOpen, reportName]);

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
    if (lastPrinter) setDestination(lastPrinter);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAction = async () => {
    try {
      const response = await fetch(docUrl);
      const fileBlob = await response.blob();

      let subset: 'odd' | 'even' | undefined;
      if (pageOption === 'odd') subset = 'odd';
      if (pageOption === 'even') subset = 'even';

      console.log('🖨️ Final Print Options:', {
        printer: destination,
        paperSize,
        pages: pageOption === 'custom' ? customPages : '',
        subset,
        orientation: layout
      });

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
    } catch (err) {
      console.error('Gagal mengirim dokumen ke printer:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="flex h-[90vh] w-[92vw] max-w-7xl border border-gray-300 bg-white">
        {/* Sidebar kiri */}
        <div className="flex w-[420px] flex-col border-r border-gray-300 bg-[#f8f9fb] px-6 py-5">
          <h2 className="mb-5 text-xl font-semibold tracking-wide text-gray-800">
            PRINT
          </h2>

          {/* Destination */}
          <div className="mb-4">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-600">
              Destination
            </label>
            <select
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
              ) : printers.filter((p) => p.status === 'Online').length === 0 ? (
                <option disabled>Tidak ada printer online</option>
              ) : (
                printers
                  .filter((p) => p.status === 'Online')
                  .map((p) => (
                    <option key={p.name} value={p.name.replace(/\\/g, '\\\\')}>
                      {p.name}
                    </option>
                  ))
              )}
            </select>
          </div>

          {/* Pages */}
          <div className="mb-4">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-600">
              Pages
            </label>
            <select
              value={pageOption}
              onChange={(e) => setPageOption(e.target.value as any)}
              className="w-full border border-gray-400 bg-white px-2 py-1.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All</option>
              <option value="odd">Odd pages only</option>
              <option value="even">Even pages only</option>
              <option value="custom">Customised</option>
            </select>
            {pageOption === 'custom' && (
              <input
                type="text"
                placeholder="Contoh: 1-5, 7, 10"
                value={customPages}
                onChange={(e) => setCustomPages(e.target.value)}
                className="mt-2 w-full border border-gray-400 bg-white px-2 py-1.5 text-sm text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            )}
          </div>

          {/* Tombol */}
          <div className="mt-auto flex justify-end gap-3 border-t border-gray-300 pt-4">
            <button
              onClick={onClose}
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

        {/* Preview kanan */}
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
