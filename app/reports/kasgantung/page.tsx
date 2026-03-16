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
import { exportShipperFn } from '@/lib/apis/shipper.api';
import { exportKasGantungFn } from '@/lib/apis/kasgantungheader.api';
import { HeaderPdfViewer } from '@/components/custom-ui/HeaderPdfViewer';
import CustomPrintModal from '@/components/custom-ui/CustomPrint';
import { useDispatch } from 'react-redux';
import { setProcessed } from '@/lib/store/loadingSlice/loadingSlice';
const ReportMenuPage: React.FC = () => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [savedFilters, setSavedFilters] = useState<any>({});
  const [savedId, setSaveId] = useState<any>('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const dispatch = useDispatch();

  // Print plugin
  const printPluginInstance = printPlugin();
  const { Print } = printPluginInstance;

  // Zoom plugin
  const zoomPluginInstance = zoomPlugin();
  const { ZoomPopover } = zoomPluginInstance;

  // Default layout with custom toolbar
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
    const rowData = sessionStorage.getItem('dataId');
    if (rowData) {
      try {
        setSaveId(rowData);
      } catch {
        setSaveId('');
      }
    }
  }, []);

  const handleExport = async () => {
    try {
      const exportPayload = { ...savedFilters };
      const response = await exportKasGantungFn(savedId, exportPayload);

      // Buat link download dari Blob
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `laporan_kasgantung_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();

      // Bersihkan URL object
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting shipper data:', error);
    }
  };
  const onPrint = () => {
    setIsPrintModalOpen(true);
  };
  const layoutPluginInstance = HeaderPdfViewer(
    handleExport, // Pass callback export dinamis
    onPrint,
    printPluginInstance, // Pass instance print
    zoomPluginInstance, // Pass instance zoom
    pdfUrl
  );

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
        {pdfUrl && (
          <CustomPrintModal
            isOpen={isPrintModalOpen}
            onClose={() => {
              setIsPrintModalOpen(false);
              dispatch(setProcessed());
            }}
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
  );
};

export default ReportMenuPage;
