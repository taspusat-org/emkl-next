'use client';

import { pdfjs } from 'react-pdf';
import { MdOutlineZoomOut } from 'react-icons/md';
import '@react-pdf-viewer/zoom/lib/styles/index.css';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/print/lib/styles/index.css';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { exportPindahBukuFn } from '@/lib/apis/pindahbuku.api';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import React, { ReactElement, useEffect, useState } from 'react';
import { FaDownload, FaFileExport, FaPrint } from 'react-icons/fa';
import { zoomPlugin, RenderZoomOutProps } from '@react-pdf-viewer/zoom';
import { printPlugin, RenderPrintProps } from '@react-pdf-viewer/print';
import {
  defaultLayoutPlugin,
  ToolbarProps,
  ToolbarSlot
} from '@react-pdf-viewer/default-layout';
import { HeaderPdfViewer } from '@/components/custom-ui/HeaderPdfViewer';
import CustomPrintModal from '@/components/custom-ui/CustomPrint';
import { setProcessed } from '@/lib/store/loadingSlice/loadingSlice';
import { useDispatch } from 'react-redux';
import { exportShippingInstructionFn } from '@/lib/apis/shippinginstruction.api';

const ReportMenuPage: React.FC = () => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<number | null>();
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [savedTglStatus, setSaveTglStatus] = useState<any>('');

  const dispatch = useDispatch();

  // Print plugin
  const printPluginInstance = printPlugin();
  const { Print } = printPluginInstance;

  // Zoom plugin
  const zoomPluginInstance = zoomPlugin();
  const { ZoomPopover } = zoomPluginInstance;

  // Function to handle print action
  const handlePrintAction = () => {
    console.log('user sedang print');

    // Add a small delay to ensure the print dialog opens first
    setTimeout(() => {
      // Close the page/tab after print dialog
      // window.close();
      console.log('ditutp');
    }, 1000);
  };

  // Default layout with custom toolbar
  useEffect(() => {
    const storedPdf = sessionStorage.getItem('pdfUrl');
    if (storedPdf) setPdfUrl(storedPdf);

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
      const response = await exportShippingInstructionFn(Number(savedId));

      // Buat link download dari Blob
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `laporan_shipping_instruction_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();

      // Bersihkan URL object
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  //   const layoutPluginInstance = defaultLayoutPlugin({
  //     sidebarTabs: (defaultTabs) => [defaultTabs[0]],
  //     renderToolbar: (Toolbar: React.ComponentType<ToolbarProps>) => (
  //       <Toolbar>
  //         {(slots: ToolbarSlot) => {
  //           const {
  //             GoToFirstPage,
  //             GoToPreviousPage,
  //             GoToNextPage,
  //             GoToLastPage,
  //             ZoomOut: DefaultZoomOut,
  //             ZoomIn: DefaultZoomIn,
  //             CurrentScale,
  //             CurrentPageInput,
  //             Download,
  //             SwitchTheme,
  //             EnterFullScreen
  //           } = slots;
  //           return (
  //             <div className="relative grid w-full grid-cols-3 items-center gap-4 overflow-visible bg-white px-4 py-2 shadow dark:bg-red-500">
  //               {/* Column 1: page navigation */}
  //               <div className="flex items-center justify-start gap-2">
  //                 <GoToFirstPage />
  //                 <GoToPreviousPage />
  //                 <CurrentPageInput />
  //                 <GoToNextPage />
  //                 <GoToLastPage />
  //               </div>

  //               {/* Column 2: zoom controls */}
  //               <div className="relative flex items-center justify-center gap-2 text-black">
  //                 <DefaultZoomOut />
  //                 <ZoomPopover />
  //                 <DefaultZoomIn />
  //                 {/* Zoom popover from zoom plugin */}
  //               </div>

  //               {/* Column 3: download, print, theme, fullscreen */}
  //               <div className="flex items-center justify-end gap-2">
  //                 <Download>
  //                   {(props) => (
  //                     <button
  //                       onClick={props.onClick}
  //                       className="flex flex-row items-center gap-2 rounded bg-green-600 px-3 py-1 text-white hover:bg-green-800"
  //                     >
  //                       <FaDownload /> Download
  //                     </button>
  //                   )}
  //                 </Download>

  //                 <Print>
  //                   {(props: RenderPrintProps) => (
  //                     <button
  //                       onClick={() => {
  //                         handlePrintAction();
  //                         props.onClick();
  //                       }}
  //                       className="flex flex-row items-center gap-2 rounded bg-cyan-500 px-3 py-1 text-white hover:bg-cyan-700"
  //                     >
  //                       <FaPrint /> Print
  //                     </button>
  //                   )}
  //                 </Print>

  //                 <button
  //                   onClick={() => handleExport()}
  //                   className="flex flex-row items-center gap-2 rounded bg-orange-500 px-3 py-1 text-white hover:bg-cyan-700"
  //                 >
  //                   <FaFileExport /> Export
  //                 </button>

  //                 <EnterFullScreen />
  //               </div>
  //             </div>
  //           );
  //         }}
  //       </Toolbar>
  //     )
  //   });

  const onPrint = () => {
    setIsPrintModalOpen(true);
  };

  const layoutPluginInstance = HeaderPdfViewer(
    handleExport, // Pass callback export dinamis
    onPrint,
    pdfUrl,
    printPluginInstance, // Pass instance print
    zoomPluginInstance // Pass instance zoom
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

  //   return (
  //     <div className="flex h-screen w-screen flex-col">
  //       <main className="flex-1 overflow-hidden">
  //         {pdfUrl ? (
  //           <Worker workerUrl="/pdf.worker.min.js">
  //             <Viewer
  //               fileUrl={pdfUrl}
  //               defaultScale={1}
  //               plugins={[
  //                 printPluginInstance,
  //                 layoutPluginInstance,
  //                 zoomPluginInstance
  //               ]}
  //               theme="light"
  //             />
  //           </Worker>
  //         ) : (
  //           <div className="flex h-full items-center justify-center text-gray-500">
  //             Loading PDF…
  //           </div>
  //         )}
  //       </main>
  //     </div>
  //   );

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
    </>
  );
};

export default ReportMenuPage;
