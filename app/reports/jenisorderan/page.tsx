'use client';
import React, { ReactElement, useEffect, useState, useRef } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { pdfjs } from 'react-pdf';

import {
  defaultLayoutPlugin,
  ToolbarProps,
  ToolbarSlot
} from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

import { printPlugin, RenderPrintProps } from '@react-pdf-viewer/print';
import '@react-pdf-viewer/print/lib/styles/index.css';

import { zoomPlugin, RenderZoomOutProps } from '@react-pdf-viewer/zoom';
import '@react-pdf-viewer/zoom/lib/styles/index.css';
import { MdOutlineZoomOut } from 'react-icons/md';
import { FaDownload, FaFileExport, FaPrint } from 'react-icons/fa';
import { exportJenisOrderanFn } from '@/lib/apis/jenisorderan.api';
import CustomPrintModal from '@/components/custom-ui/CustomPrint';
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

const ReportMenuPage: React.FC = () => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [savedFilters, setSavedFilters] = useState<any>({});
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const printPluginInstance = printPlugin();
  const { Print } = printPluginInstance;

  const zoomPluginInstance = zoomPlugin();
  const { ZoomPopover } = zoomPluginInstance;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
      }

      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
      }

      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
      }

      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        e.stopImmediatePropagation();
        setIsPrintModalOpen(true);
        return false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const beforePrint = (e: Event) => {
      e.preventDefault();
      e.stopImmediatePropagation();

      if (window.matchMedia) {
        window
          .matchMedia('print')
          .removeEventListener('change', beforePrint as any);
      }

      setTimeout(() => {
        setIsPrintModalOpen(true);
      }, 0);

      return false;
    };

    const afterPrint = (e: Event) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu);

    window.addEventListener('keydown', handleKeyDown, true);

    window.addEventListener('beforeprint', beforePrint, true);
    window.addEventListener('afterprint', afterPrint, true);

    if (window.matchMedia) {
      const printMediaQuery = window.matchMedia('print');
      printMediaQuery.addEventListener('change', (e) => {
        if (e.matches) {
          setIsPrintModalOpen(true);
        }
      });
    }

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('beforeprint', beforePrint, true);
      window.removeEventListener('afterprint', afterPrint, true);
    };
  }, []);

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
  }, []);

  const handleExport = async () => {
    try {
      const exportPayload = { ...savedFilters };
      const response = await exportJenisOrderanFn(exportPayload);

      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `laporan_jenisorderan_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting jenisorderan data:', error);
    }
  };

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
            CurrentScale,
            CurrentPageInput,
            Download,
            SwitchTheme,
            EnterFullScreen
          } = slots;
          return (
            <div className="relative grid w-full grid-cols-3 items-center gap-4 overflow-visible bg-white px-4 py-2 shadow dark:bg-red-500">
              <div className="flex items-center justify-start gap-2">
                <GoToFirstPage />
                <GoToPreviousPage />
                <CurrentPageInput />
                <GoToNextPage />
                <GoToLastPage />
              </div>

              <div className="relative flex items-center justify-center gap-2 text-black">
                <DefaultZoomOut />
                <ZoomPopover />
                <DefaultZoomIn />
              </div>

              <div className="flex items-center justify-end gap-2">
                <Download>
                  {(props) => (
                    <button
                      onClick={props.onClick}
                      className="flex flex-row items-center gap-2 rounded bg-green-600 px-3 py-1 text-white hover:bg-green-800"
                    >
                      <FaDownload /> Download
                    </button>
                  )}
                </Download>

                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  className="flex flex-row items-center gap-2 rounded bg-cyan-500 px-3 py-1 text-white hover:bg-cyan-700"
                >
                  <FaPrint /> Print
                </button>

                <button
                  onClick={() => handleExport()}
                  className="flex flex-row items-center gap-2 rounded bg-orange-500 px-3 py-1 text-white hover:bg-cyan-700"
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

  useEffect(() => {
    const stored = sessionStorage.getItem('pdfUrl');
    if (stored) setPdfUrl(stored);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    }
  }, []);

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          body::before {
            content: '' !important;
            visibility: visible !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: white !important;
            z-index: 9998 !important;
          }
          @page {
            margin: 0;
            size: auto;
          }
        }

        @media print {
          .print-warning-box {
            visibility: visible !important;
            display: block !important;
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: auto !important;
            max-width: 500px !important;
            padding: 0 !important;
            background: white !important;
            text-align: center !important;
            z-index: 10000 !important;
          }

          .print-warning-title {
            color: #dc2626 !important;
            font-size: 16px !important;
            font-weight: bold !important;
            margin-bottom: 12px !important;
            visibility: visible !important;
            display: block !important;
            line-height: 1.3 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          .print-warning-text {
            color: #000000 !important;
            font-size: 16px !important;
            font-weight: normal !important;
            margin-bottom: 15px !important;
            visibility: visible !important;
            display: block !important;
            line-height: 1.3 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          .print-warning-instruction-box {
            border: 2px solid #000000 !important;
            padding: 12px 16px !important;
            margin-top: 15px !important;
            margin-left: auto !important;
            margin-right: auto !important;
            visibility: visible !important;
            display: inline-block !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          .print-warning-instruction {
            color: #2563eb !important;
            font-size: 16px !important;
            font-weight: normal !important;
            visibility: visible !important;
            display: block !important;
            margin: 0 !important;
            line-height: 1.3 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      `}</style>

      <div className="print-warning-box" style={{ display: 'none' }}>
        <div className="print-warning-title">WARNING ( PERHATIAN )</div>
        <div className="print-warning-text">
          DILARANG MENCETAK LAPORAN MELALUI INI
        </div>
        <div className="print-warning-instruction-box">
          <div className="print-warning-instruction">
            GUNAKAN TOMBOL PRINT ATAU CTRL + P
          </div>
        </div>
      </div>
      <div className="flex h-screen w-screen flex-col">
        <main className="flex-1 overflow-hidden">
          {pdfUrl && (
            <CustomPrintModal
              isOpen={isPrintModalOpen}
              onClose={() => setIsPrintModalOpen(false)}
              docUrl={pdfUrl ?? ''}
              showPages={true}
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
    </>
  );
};

export default ReportMenuPage;
