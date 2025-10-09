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
import { exportContainerFn } from '@/lib/apis/container.api';
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
  }, []);

  const handleExport = async () => {
    try {
      const exportPayload = { ...savedFilters };
      const response = await exportContainerFn(exportPayload);

      // Buat link download dari Blob
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `laporan_container_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();

      // Bersihkan URL object
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting container data:', error);
    }
  };

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  <CustomPrintModal
    isOpen={isPrintModalOpen}
    onClose={() => setIsPrintModalOpen(false)}
    docUrl={pdfUrl ?? ''}
    defaultOrientation="portrait"
  />;

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
    <div className="flex h-screen w-screen flex-col">
      <main className="flex-1 overflow-hidden">
        {pdfUrl && (
          <CustomPrintModal
            isOpen={isPrintModalOpen}
            onClose={() => setIsPrintModalOpen(false)}
            docUrl={pdfUrl}
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

// const ReportDesigner = () => {
//   const { token } = useSelector((state: RootState) => state.auth);
//   const [reportData, setReportData] = useState<any>(null);

//   useEffect(() => {
//     // Ambil data dari API
//     const fetchData = async () => {
//       try {
//         const res = await getShipperFn({ page: 1, limit: 50 }); // sesuaikan filter
//         setReportData(res.data); // simpan ke state
//       } catch (err) {
//         console.error('Gagal ambil data container:', err);
//       }
//     };
//     fetchData();
//   }, []);

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
