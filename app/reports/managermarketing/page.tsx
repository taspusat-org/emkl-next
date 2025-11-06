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
import { exportManagerMarketingFn } from '@/lib/apis/managermarketingheader.api';
import CustomPrintModal from '@/components/custom-ui/CustomPrint';
import {
  getPrintersFn,
  getPaperSizesFn,
  printFileFn,
  PrinterInfo
} from '@/lib/apis/print.api';
import { HeaderPdfViewer } from '@/components/custom-ui/HeaderPdfViewer';

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
      const response = await exportManagerMarketingFn(exportPayload);

      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `laporan_managermarketing_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting managermarketing data:', error);
    }
  };
  const onPrint = () => {
    setIsPrintModalOpen(true);
  };
  const layoutPluginInstance = HeaderPdfViewer(
    handleExport, // Pass callback export dinamis
    onPrint,
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

// 'use client';

// import 'stimulsoft-reports-js/Css/stimulsoft.designer.office2013.whiteblue.css';
// import 'stimulsoft-reports-js/Css/stimulsoft.viewer.office2013.whiteblue.css';
// import React, { useEffect, useState } from 'react';
// import { useSelector } from 'react-redux';
// import { RootState } from '@/lib/store/store';
// import { getTujuankapalFn } from '@/lib/apis/tujuankapal.api';
// import { getContainerFn } from '@/lib/apis/container.api';
// import { getMenuFn } from '@/lib/apis/menu.api';
// import { getAlatbayarFn } from '@/lib/apis/alatbayar.api';
// import { getHargatruckingFn } from '@/lib/apis/hargatrucking.api';
// import { getShipperFn } from '@/lib/apis/shipper.api';
// import {
//   getManagerMarketingDetailFn,
//   getManagerMarketingHeaderFn
// } from '@/lib/apis/managermarketingheader.api';
// export interface MasterManagerMarketing {
//   nama: string;
//   keterangan: string;
//   minimalprofit: string;
//   statusmentor_text: string;
//   statusleader_text: string;
//   text: string;
// }

// export interface DetailManagerMarketing {
//   nominalawal: string;
//   nominalakhir: string;
//   persentase: string;
//   text: string;
// }

// export interface ReportItem {
//   master: MasterManagerMarketing;
//   detail: DetailManagerMarketing[];
// }
// const ReportDesigner = () => {
//   const { token } = useSelector((state: RootState) => state.auth);
//   const [reportData, setReportData] = useState<any>(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await getManagerMarketingHeaderFn({
//           page: 1,
//           limit: 50
//         });

//         const formatted = await Promise.all(
//           response.data.map(async (data: any) => {
//             const detailItems = await getManagerMarketingDetailFn(data.id);

//             return {
//               detail: detailItems.data.map((d: any) => ({
//                 nama: data.nama,
//                 keterangan: data.keterangan,
//                 minimalprofit: data.minimalprofit,
//                 statusmentor_text: data.statusmentor_text,
//                 statusleader_text: data.statusleader_text,
//                 text_master: data.text,
//                 nominalawal: d.nominalawal,
//                 nominalakhir: d.nominalakhir,
//                 persentase: d.persentase,
//                 text: d.text
//               }))
//             };
//           })
//         );

//         setReportData(formatted);
//       } catch (err) {
//         console.error('Gagal ambil data:', err);
//       }
//     };

//     fetchData();
//   }, []);
//
//   useEffect(() => {
//     if (!reportData) return;

//     // Render report jika data sudah ada
//     import('stimulsoft-reports-js/Scripts/stimulsoft.blockly.editor')
//       .then((module) => {
//         const { Stimulsoft } = module;

//         // Set license
//         Stimulsoft.Base.StiLicense.Key =
//           '6vJhGtLLLz2GNviWmUTrhSqnOItdDwjBylQzQcAOiHksEid1Z5nN/hHQewjPL/4/AvyNDbkXgG4Am2U6dyA8Ksinqp' +
//           '6agGqoHp+1KM7oJE6CKQoPaV4cFbxKeYmKyyqjF1F1hZPDg4RXFcnEaYAPj/QLdRHR5ScQUcgxpDkBVw8XpueaSFBs' +
//           'JVQs/daqfpFiipF1qfM9mtX96dlxid+K/2bKp+e5f5hJ8s2CZvvZYXJAGoeRd6iZfota7blbsgoLTeY/sMtPR2yutv' +
//           'gE9TafuTEhj0aszGipI9PgH+A/i5GfSPAQel9kPQaIQiLw4fNblFZTXvcrTUjxsx0oyGYhXslAAogi3PILS/DpymQQ' +
//           '0XskLbikFsk1hxoN5w9X+tq8WR6+T9giI03Wiqey+h8LNz6K35P2NJQ3WLn71mqOEb9YEUoKDReTzMLCA1yJoKia6Y' +
//           'JuDgUf1qamN7rRICPVd0wQpinqLYjPpgNPiVqrkGW0CQPZ2SE2tN4uFRIWw45/IITQl0v9ClCkO/gwUtwtuugegrqs' +
//           'e0EZ5j2V4a1XDmVuJaS33pAVLoUgK0M8RG72';

//         // Viewer
//         const viewerOptions = new Stimulsoft.Viewer.StiViewerOptions();
//         const viewer = new Stimulsoft.Viewer.StiViewer(
//           viewerOptions,
//           'StiViewer',
//           false
//         );

//         // Report
//         const report = new Stimulsoft.Report.StiReport();
//         report.loadFile('/reports/LaporanManagermarketing.mrt');

//         // Designer
//         const options = new Stimulsoft.Designer.StiDesignerOptions();
//         options.appearance.fullScreenMode = true;
//         const designer = new Stimulsoft.Designer.StiDesigner(
//           options,
//           'Designer',
//           false
//         );

//         // Dataset
//         const dataSet = new Stimulsoft.System.Data.DataSet('Data');
//         dataSet.readJson({ data: reportData });
//         report.dictionary.dataSources.clear();
//         report.regData(dataSet.dataSetName, '', dataSet);
//         report.dictionary.synchronize();

//         // Render
//         viewer.renderHtml('content');
//         designer.report = report;
//         designer.renderHtml('content');
//         viewer.report = report;
//       })
//       .catch((error) => {
//         console.error('Failed to load Stimulsoft:', error);
//       });
//   }, [reportData, token]);

//   return (
//     <div
//       id="content"
//       className="report"
//       style={{ textTransform: 'none', fontSize: 'unset' }}
//     />
//   );
// };

// export default ReportDesigner;
