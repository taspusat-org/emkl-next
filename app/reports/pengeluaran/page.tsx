'use client';
import React, { useEffect, useState, useRef } from 'react';
import { pdfjs } from 'react-pdf';
import { Worker, Viewer } from '@react-pdf-viewer/core';

// Styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/zoom/lib/styles/index.css';
import '@react-pdf-viewer/print/lib/styles/index.css';

// Icons
import { FaDownload, FaFileExport, FaPrint } from 'react-icons/fa';

// Plugins
import {
  defaultLayoutPlugin,
  ToolbarProps,
  ToolbarSlot
} from '@react-pdf-viewer/default-layout';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import { printPlugin } from '@react-pdf-viewer/print';
import CustomPrintModal from '@/components/custom-ui/CustomPrint';

// API
import {
  getPrintersFn,
  getPaperSizesFn,
  printFileFn,
  PrinterInfo,
  PrintOptions
} from '@/lib/apis/print.api';
import { exportPengeluaranEmklHeaderFn } from '@/lib/apis/pengeluaranemklheader.api';
import { exportPengeluaranFn } from '@/lib/apis/pengeluaranheader.api';
interface PaperSize {
  id: number;
  name: string;
}

const ReportMenuPage: React.FC = () => {
  // ===== STATE =====
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [savedFilters, setSavedFilters] = useState<any>({});
  const [savedId, setSavedId] = useState<number | null>(null);

  // ===== PLUGINS =====
  const zoomPluginInstance = zoomPlugin();
  const { ZoomPopover } = zoomPluginInstance;
  const printPluginInstance = printPlugin();

  // ===== FETCH DATA PDF DAN FILTER =====
  useEffect(() => {
    const storedPdf = sessionStorage.getItem('pdfUrl');
    if (storedPdf) setPdfUrl(storedPdf);

    const storedFilters = sessionStorage.getItem('filtersWithoutLimit');
    if (storedFilters) {
      try {
        setSavedFilters(JSON.parse(storedFilters));
      } catch {
        setSavedFilters({});
      }
    }

    const storedId = sessionStorage.getItem('dataId');
    if (storedId) {
      try {
        setSavedId(Number(storedId));
      } catch {
        setSavedId(null);
      }
    }
  }, []);

  const handleExport = async () => {
    try {
      const exportPayload = { ...savedFilters };
      const response = await exportPengeluaranFn(
        Number(savedId),
        exportPayload
      );
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `laporan_pengeluaran${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting pengeluaran emkl header data:', error);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) {
      return;
    }
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `laporan_${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const layoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [defaultTabs[0]],
    renderToolbar: (Toolbar: React.ComponentType<ToolbarProps>) => (
      <Toolbar>
        {(slots: ToolbarSlot) => {
          const {
            GoToFirstPage,
            GoToPreviousPage,
            GoToNextPage,
            GoToLastPage,
            ZoomOut: DefaultZoomOut,
            ZoomIn: DefaultZoomIn,
            CurrentPageInput,
            EnterFullScreen
          } = slots;

          return (
            <div className="relative grid w-full grid-cols-3 items-center gap-4 bg-white px-4 py-2 shadow">
              {/* Column 1: Navigation */}
              <div className="flex items-center justify-start gap-2">
                <GoToFirstPage />
                <GoToPreviousPage />
                <CurrentPageInput />
                <GoToNextPage />
                <GoToLastPage />
              </div>

              {/* Column 2: Zoom */}
              <div className="relative flex items-center justify-center gap-2 text-black">
                <DefaultZoomOut />
                <ZoomPopover />
                <DefaultZoomIn />
              </div>

              {/* Column 3: Actions */}
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  className="flex flex-row items-center gap-2 rounded bg-cyan-500 px-3 py-1 text-white hover:bg-cyan-700"
                >
                  <FaPrint /> Print
                </button>

                <button
                  onClick={handleDownload}
                  className="flex flex-row items-center gap-2 rounded bg-green-600 px-3 py-1 text-white hover:bg-green-800"
                >
                  <FaDownload /> Download
                </button>

                <button
                  onClick={handleExport}
                  className="flex flex-row items-center gap-2 rounded bg-orange-500 px-3 py-1 text-white hover:bg-orange-700"
                >
                  <FaFileExport /> Export
                </button>

                <EnterFullScreen />
              </div>
            </div>
          );
        }}
      </Toolbar>
    )
  });

  // ===== PDF WORKER =====
  useEffect(() => {
    if (typeof window !== 'undefined') {
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    }
  }, []);

  // ===== RENDER =====
  return (
    <div className="flex h-screen w-screen flex-col">
      <main className="flex-1 overflow-hidden">
        {pdfUrl && (
          <CustomPrintModal
            isOpen={isPrintModalOpen}
            onClose={() => setIsPrintModalOpen(false)}
            docUrl={pdfUrl ?? ''}
            reportName="LaporanPengeluaran"
          />
        )}

        {pdfUrl ? (
          <Worker workerUrl="/pdf.worker.min.js">
            <Viewer
              fileUrl={pdfUrl}
              defaultScale={1}
              plugins={[
                printPluginInstance,
                layoutPluginInstance,
                zoomPluginInstance
              ]}
              theme="light"
            />
          </Worker>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            Loading PDF…
          </div>
        )}
      </main>
    </div>
  );
};

export default ReportMenuPage;
