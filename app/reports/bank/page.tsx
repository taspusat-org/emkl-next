'use client';
import React, { ReactElement, useEffect, useState } from 'react';
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
import { exportBankFn } from '@/lib/apis/bank.api';

const ReportMenuPage: React.FC = () => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [savedFilters, setSavedFilters] = useState<any>({});
  // Print plugin
  const printPluginInstance = printPlugin();
  const { Print } = printPluginInstance;

  // Zoom plugin
  const zoomPluginInstance = zoomPlugin();
  const { ZoomPopover } = zoomPluginInstance;

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
      const response = await exportBankFn(exportPayload);

      // Buat link download dari Blob
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `laporan_bank_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();

      // Bersihkan URL object
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting bank data:', error);
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
              {/* Column 1: page navigation */}
              <div className="flex items-center justify-start gap-2">
                <GoToFirstPage />
                <GoToPreviousPage />
                <CurrentPageInput />
                <GoToNextPage />
                <GoToLastPage />
              </div>

              {/* Column 2: zoom controls */}
              <div className="relative flex items-center justify-center gap-2 text-black">
                <DefaultZoomOut />
                <ZoomPopover />
                <DefaultZoomIn />
                {/* Zoom popover from zoom plugin */}
              </div>

              {/* Column 3: download, print, theme, fullscreen */}
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

                <Print>
                  {(props: RenderPrintProps) => (
                    <button
                      onClick={props.onClick}
                      className="flex flex-row items-center gap-2 rounded bg-cyan-500 px-3 py-1 text-white hover:bg-cyan-700"
                    >
                      <FaPrint /> Print
                    </button>
                  )}
                </Print>
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
    <div className="flex h-screen w-screen flex-col">
      <main className="flex-1 overflow-hidden">
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
