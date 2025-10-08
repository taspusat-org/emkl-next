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
  const CustomPrintModal = ({
    isOpen,
    onClose,
    docUrl
  }: {
    isOpen: boolean;
    onClose: () => void;
    docUrl: string;
  }) => {
    const [destination, setDestination] = useState<'save_as_pdf' | string>(
      'save_as_pdf'
    );
    const [printers, setPrinters] = useState<PrinterInfo[]>([]);
    const [loadingPrinters, setLoadingPrinters] = useState(false);

    // Form fields
    const [pages, setPages] = useState<string>(''); // e.g. "1-3,5"
    const [copies, setCopies] = useState<number>(1);
    const [layout, setLayout] = useState<'portrait' | 'landscape'>('portrait');
    const [colorMode, setColorMode] = useState<'color' | 'bw'>('color'); // bw -> monochrome=true
    const [paperSizes, setPaperSizes] = useState<PaperSize[]>([]);
    const [paperSize, setPaperSize] = useState<string>('');

    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Ambil daftar printer saat modal dibuka
    useEffect(() => {
      if (!isOpen) return;
      const fetchPrinters = async () => {
        try {
          setLoadingPrinters(true);
          const data = await getPrintersFn();
          setPrinters(data);
        } catch (error) {
          console.error('Gagal mengambil daftar printer:', error);
        } finally {
          setLoadingPrinters(false);
        }
      };
      fetchPrinters();
    }, [isOpen]);

    // Ambil paper sizes ketika memilih printer fisik
    useEffect(() => {
      const run = async () => {
        if (!isOpen) return;

        if (!destination || destination === 'save_as_pdf') {
          setPaperSizes([]);
          setPaperSize('');
          return;
        }

        try {
          const sizes = await getPaperSizesFn(destination);
          console.log('Raw API response:', sizes);

          // Mapping agar name selalu string
          const validSizes: PaperSize[] = (sizes || []).map(
            (item: any, index: number) => {
              return {
                id: item.id || index + 1,
                name: typeof item.name === 'object' ? item.name.name : item.name
              };
            }
          );

          console.log('Valid sizes after mapping:', validSizes);

          setPaperSizes(validSizes);

          // Cari default A4
          const defaultChoice =
            validSizes.find((s) => s.name === 'A4 210 x 297 mm') ||
            validSizes[0] ||
            null;

          console.log('Default paper size:', defaultChoice);

          setPaperSize(defaultChoice?.name || '');
        } catch (e) {
          console.error('Gagal ambil paper sizes:', e);
          setPaperSizes([]);
          setPaperSize('');
        }
      };

      run();
    }, [isOpen, destination]);

    if (!isOpen) return null;

    const handleCancel = () => onClose();

    const handleAction = async () => {
      if (destination === 'save_as_pdf') {
        // Save as PDF → download file lokal
        const link = document.createElement('a');
        link.href = docUrl;
        link.download = `Laporan-${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        onClose();
      } else {
        // Kirim job ke printer fisik via API eksternal
        try {
          console.log('✅ User memilih printer:', destination);

          const response = await fetch(docUrl);
          const fileBlob = await response.blob();

          const result = await printFileFn({
            file: fileBlob,
            options: {
              printer: destination,
              paperSize,
              pages: pages,
              monochrome: colorMode === 'bw',
              copies: copies || 1,
              orientation: 'portrait',
              scale: 'noscale'
            }
          });

          onClose();
        } catch (error: any) {
          console.error('Gagal mengirim dokumen ke printer:', error);
        }
      }
    };

    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="flex h-[90vh] w-[92vw] max-w-7xl flex-row overflow-hidden rounded-xl bg-white shadow-2xl">
          {/* Panel Kiri: Pengaturan Cetak */}
          <div className="flex w-[400px] flex-col border-r border-gray-200 p-6">
            <h2 className="mb-6 text-2xl font-semibold text-gray-800">Print</h2>

            {/* Destination */}
            <div className="mb-4">
              <label
                htmlFor="destination"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Destination
              </label>
              <select
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="save_as_pdf">Save as PDF</option>
                {loadingPrinters ? (
                  <option disabled>Loading printers…</option>
                ) : (
                  printers.map((p) => (
                    <option key={p.name} value={p.name.replace(/\\/g, '\\\\')}>
                      {p.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Pages */}
            <div className="mb-4">
              <label
                htmlFor="pages"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Pages (contoh: 1-3,5)
              </label>
              <input
                id="pages"
                placeholder="All"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Copies */}
            <div className="mb-4">
              <label
                htmlFor="copies"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Copies
              </label>
              <input
                id="copies"
                type="number"
                min={1}
                value={copies}
                onChange={(e) =>
                  setCopies(Math.max(1, Number(e.target.value || 1)))
                }
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Layout */}
            <div className="mb-4">
              <label
                htmlFor="layout"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Layout
              </label>
              <select
                id="layout"
                value={layout}
                onChange={(e) =>
                  setLayout(e.target.value as 'portrait' | 'landscape')
                }
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>

            {/* Color */}
            <div className="mb-4">
              <label
                htmlFor="color"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Color
              </label>
              <select
                id="color"
                value={colorMode}
                onChange={(e) => setColorMode(e.target.value as 'color' | 'bw')}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="color">Color</option>
                <option value="bw">Black &amp; White</option>
              </select>
            </div>

            {/* Paper Size */}
            <div className="mb-6">
              <label
                htmlFor="paper"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Paper size
              </label>
              <select
                id="paper"
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value)}
                disabled={
                  destination === 'save_as_pdf' || paperSizes.length === 0
                }
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
              >
                {destination === 'save_as_pdf' ? (
                  <option value="">(Tidak tersedia untuk Save as PDF)</option>
                ) : paperSizes.length === 0 ? (
                  <option value="">(Paper size tidak tersedia)</option>
                ) : (
                  paperSizes.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Tombol Aksi */}
            <div className="mt-auto flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="rounded-md bg-gray-200 px-5 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                {destination === 'save_as_pdf' ? 'Save' : 'Print'}
              </button>
            </div>
          </div>

          {/* Panel Kanan: Pratinjau Cetak */}
          <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
            <div className="h-full w-full overflow-hidden rounded-lg bg-white shadow">
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
