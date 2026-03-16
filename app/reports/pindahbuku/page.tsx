'use client';

import React, { useEffect, useState } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { pdfjs } from 'react-pdf';

import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/print/lib/styles/index.css';
import '@react-pdf-viewer/zoom/lib/styles/index.css';

import { printPlugin } from '@react-pdf-viewer/print';
import { zoomPlugin } from '@react-pdf-viewer/zoom';

import { exportPindahBukuFn } from '@/lib/apis/pindahbuku.api';
import CustomPrintModal from '@/components/custom-ui/CustomPrint';
import { HeaderPdfViewer } from '@/components/custom-ui/HeaderPdfViewer';
import { setProcessed } from '@/lib/store/loadingSlice/loadingSlice';
import { useDispatch } from 'react-redux';

type Filters = Record<string, unknown>;

const ReportMenuPage: React.FC = () => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [savedFilters, setSavedFilters] = useState<Filters>({});
  const [savedId, setSavedId] = useState<string>('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const dispatch = useDispatch();

  const printPluginInstance = printPlugin();
  const zoomPluginInstance = zoomPlugin();

  useEffect(() => {
    const storedPdf = sessionStorage.getItem('pdfUrl');
    if (storedPdf) setPdfUrl(storedPdf);

    const storedFilters = sessionStorage.getItem('filtersWithoutLimit');
    if (storedFilters) {
      try {
        setSavedFilters(JSON.parse(storedFilters) as Filters);
      } catch {
        setSavedFilters({});
      }
    }

    const rowData = sessionStorage.getItem('dataId');
    if (rowData) setSavedId(rowData);
  }, []);

  const handleExport = async (): Promise<void> => {
    try {
      if (!savedId) return;
      const exportPayload = { ...savedFilters };
      const response = await exportPindahBukuFn(savedId, exportPayload);

      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `laporan_pindah_buku_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting pindah buku data:', error);
    }
  };

  const onPrint = (): void => {
    setIsPrintModalOpen(true);
  };

  const layoutPluginInstance = HeaderPdfViewer(
    handleExport,
    onPrint,
    printPluginInstance,
    zoomPluginInstance,
    pdfUrl
  );

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
              onClose={() => {
                setIsPrintModalOpen(false);
                dispatch(setProcessed());
              }}
              docUrl={pdfUrl}
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

// 'use client';

// import { pdfjs } from 'react-pdf';
// import { MdOutlineZoomOut } from 'react-icons/md';
// import '@react-pdf-viewer/zoom/lib/styles/index.css';
// import '@react-pdf-viewer/core/lib/styles/index.css';
// import '@react-pdf-viewer/print/lib/styles/index.css';
// import { Worker, Viewer } from '@react-pdf-viewer/core';
// import '@react-pdf-viewer/default-layout/lib/styles/index.css';
// import { exportPindahBukuFn } from '@/lib/apis/pindahbuku.api';
// import React, { ReactElement, useEffect, useState } from 'react';
// import { FaDownload, FaFileExport, FaPrint } from 'react-icons/fa';
// import { zoomPlugin, RenderZoomOutProps } from '@react-pdf-viewer/zoom';
// import { printPlugin, RenderPrintProps } from '@react-pdf-viewer/print';
// import {
//   defaultLayoutPlugin,
//   ToolbarProps,
//   ToolbarSlot
// } from '@react-pdf-viewer/default-layout';

// const ReportMenuPage: React.FC = () => {
//   const [pdfUrl, setPdfUrl] = useState<string | null>(null);
//   const [savedFilters, setSavedFilters] = useState<any>({});
//   const [savedNobukti, setSaveNobukti] = useState<number | null>();

//   // Print plugin
//   const printPluginInstance = printPlugin();
//   const { Print } = printPluginInstance;

//   // Zoom plugin
//   const zoomPluginInstance = zoomPlugin();
//   const { ZoomPopover } = zoomPluginInstance;

//   // Function to handle print action
//   const handlePrintAction = () => {
//

//     let printStartTime = Date.now();

//     const handleBeforePrint = () => {
//       printStartTime = Date.now();
//
//     };

//     const handleAfterPrint = () => {
//       const duration = Date.now() - printStartTime;

//       // Delay untuk beri waktu user kembali fokus ke tab
//       setTimeout(() => {
//         if (document.hasFocus()) {
//           if (duration < 800) {
//             ');
//           } else {
//             ');
//           }
//         } else {
//           ');
//         }
//       }, 500);

//       window.removeEventListener('beforeprint', handleBeforePrint);
//       window.removeEventListener('afterprint', handleAfterPrint);
//     };

//     window.addEventListener('beforeprint', handleBeforePrint);
//     window.addEventListener('afterprint', handleAfterPrint);
//   };

//   // Handle keyboard shortcut Ctrl+P
//   useEffect(() => {
//     const handleKeyDown = (event: KeyboardEvent) => {
//       if (event.ctrlKey && event.key === 'p') {
//         event.preventDefault(); // Prevent default browser print
//         handlePrintAction();

//         // Trigger the print functionality
//         window.print();
//       }
//     };

//     document.addEventListener('keydown', handleKeyDown);

//     return () => {
//       document.removeEventListener('keydown', handleKeyDown);
//     };
//   }, []);

//   // Default layout with custom toolbar
//   useEffect(() => {
//     const storedPdf = sessionStorage.getItem('pdfUrl');
//     if (storedPdf) setPdfUrl(storedPdf);

//     const storedFilters = sessionStorage.getItem('filtersWithoutLimit');
//     if (storedFilters) {
//       try {
//         setSavedFilters(JSON.parse(storedFilters));
//       } catch {
//         setSavedFilters({});
//       }
//     }
//     const storedId = sessionStorage.getItem('dataNobukti');
//     if (storedId) {
//       try {
//         setSaveNobukti(Number(storedId));
//       } catch {
//         setSaveNobukti(null);
//       }
//     }
//
//   }, []);

//   const handleExport = async () => {
//     try {
//       const exportPayload = { ...savedFilters };
//       const response = await exportPindahBukuFn(
//         Number(savedNobukti),
//         exportPayload
//       );

//       // Buat link download dari Blob
//       const url = window.URL.createObjectURL(new Blob([response]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = `laporan_pindah_buku_${Date.now()}.xlsx`;
//       document.body.appendChild(link);
//       link.click();

//       // Bersihkan URL object
//       window.URL.revokeObjectURL(url);
//       document.body.removeChild(link);
//     } catch (error) {
//       console.error('Error exporting data:', error);
//     }
//   };

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

//   useEffect(() => {
//     const stored = sessionStorage.getItem('pdfUrl');
//     if (stored) setPdfUrl(stored);
//   }, []);

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
//     }
//   }, []);

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
// };

// export default ReportMenuPage;
