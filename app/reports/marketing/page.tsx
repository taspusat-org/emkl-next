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
import { exportScheduleFn } from '@/lib/apis/schedule.api';
import { exportMarketingFn } from '@/lib/apis/marketingheader.api';
const ReportMenuPage: React.FC = () => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [savedFilters, setSavedFilters] = useState<any>({});
  const [savedId, setSavedId] = useState<any>('');

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
    const storedId = sessionStorage.getItem('headerId');

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
      const response = await exportMarketingFn(exportPayload);

      // Buat link download dari Blob
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `laporan_marketing${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();

      // Bersihkan URL object
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting marketing data:', error);
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

// 'use client';

// import 'stimulsoft-reports-js/Css/stimulsoft.designer.office2013.whiteblue.css';
// import 'stimulsoft-reports-js/Css/stimulsoft.viewer.office2013.whiteblue.css';
// import React, { useEffect, useState } from 'react';
// import { useSelector } from 'react-redux';
// import { RootState } from '@/lib/store/store';
// import { getMarketingBiayaFn, getMarketingDetailFn, getMarketingHeaderFn, getMarketingManagerFn, getMarketingOrderanFn, getMarketingProsesFeeFn } from '@/lib/apis/marketingheader.api';

// const ReportDesigner = () => {
//   const { token } = useSelector((state: RootState) => state.auth);
//   const [reportMarketingOrderanData, setReportMarketingOrderanData] = useState<any>(null);
//   const [reportMarketingBiayaData, setReportMarketingBiayaData] = useState<any>(null);
//   const [reportMarketingManagerData, setReportMarketingManagerData] = useState<any>(null);
//   const [reportMarketingBProsesFeeData, setReportMarketingBProsesFeeData] = useState<any>(null);
//   const [reportMarketingDetailData, setReportMarketingDetailData] = useState<any>(null);

//   useEffect(() => {
//     // Ambil data dari API
//     const fetchData = async () => {
//       try {
//         const master = await getMarketingHeaderFn({page: 1, limit: 50}); // sesuaikan filter

//         const marketingWithOrderan = await Promise.all(
//           master.data.map(async (data: any) => {
//             const marketingorderan = await getMarketingOrderanFn(data.id);

//             return {
//               marketingorderan: marketingorderan.data.map((details: any) => ({
//                 nama: data.nama,
//                 keterangan: data.keterangan,
//                 statusaktif_nama: data.statusaktif_nama,
//                 email: data.email,
//                 karyawan_nama: data.karyawan_nama,
//                 tglmasuk: data.tglmasuk,
//                 cabang_nama: data.cabang_nama,
//                 statustarget_nama: data.statustarget_nama,
//                 statusbagifee_nama: data.statusbagifee_nama,
//                 statusfeemanager_nama: data.statusfeemanager_nama,
//                 marketinggroup_nama: data.marketinggroup_nama,
//                 statusprafee_nama: data.statusprafee_nama,
//                 namadetailorderan: details.nama,
//                 keterangandetailorderan: details.keterangan,
//                 singkatandetailorderan: details.singkatan,
//                 statusaktifdetailorderan: details.statusaktif_nama,
//               })),
//             };
//           })
//         );

//         const marketingWithBiaya = await Promise.all(
//           master.data.map(async (data: any) => {
//             const marketingbiaya = await getMarketingBiayaFn(data.id);

//             return {
//               marketingbiaya: marketingbiaya.data.map((details: any) => ({
//                 nama: data.nama,
//                 keterangan: data.keterangan,
//                 statusaktif_nama: data.statusaktif_nama,
//                 email: data.email,
//                 karyawan_nama: data.karyawan_nama,
//                 tglmasuk: data.tglmasuk,
//                 cabang_nama: data.cabang_nama,
//                 statustarget_nama: data.statustarget_nama,
//                 statusbagifee_nama: data.statusbagifee_nama,
//                 statusfeemanager_nama: data.statusfeemanager_nama,
//                 marketinggroup_nama: data.marketinggroup_nama,
//                 statusprafee_nama: data.statusprafee_nama,
//                 jenisbiayamarketing_namadetailbiaya: details.jenisbiayamarketing_nama,
//                 nominaldetailbiaya: details.nominal,
//                 statusaktifdetailbiaya: details.statusaktif_nama,
//               })),
//             };
//           })
//         );

//         const marketingWithManager = await Promise.all(
//           master.data.map(async (data: any) => {
//             const marketingmanager = await getMarketingManagerFn(data.id);

//             return {
//               marketingmanager: marketingmanager.data.map((details: any) => ({
//                 nama: data.nama,
//                 keterangan: data.keterangan,
//                 statusaktif_nama: data.statusaktif_nama,
//                 email: data.email,
//                 karyawan_nama: data.karyawan_nama,
//                 tglmasuk: data.tglmasuk,
//                 cabang_nama: data.cabang_nama,
//                 statustarget_nama: data.statustarget_nama,
//                 statusbagifee_nama: data.statusbagifee_nama,
//                 statusfeemanager_nama: data.statusfeemanager_nama,
//                 marketinggroup_nama: data.marketinggroup_nama,
//                 statusprafee_nama: data.statusprafee_nama,
//                 managermarketing_namadetailmanager: details.managermarketing_nama,
//                 tglapprovaldetailmanager: details.tglapproval,
//                 statusapprovaldetailmanager: details.statusapproval_nama,
//                 userapprovaldetailmanager: details.userapproval,
//                 statusaktifdetailmanager: details.statusaktif_nama,
//               })),
//             };
//           })
//         );

//         const marketingWithProsesFee = await Promise.all(
//           master.data.map(async (data: any) => {
//             const marketinprosesfee = await getMarketingProsesFeeFn(data.id);

//             return {
//               marketinprosesfee: marketinprosesfee.data.map((details: any) => ({
//                 nama: data.nama,
//                 keterangan: data.keterangan,
//                 statusaktif_nama: data.statusaktif_nama,
//                 email: data.email,
//                 karyawan_nama: data.karyawan_nama,
//                 tglmasuk: data.tglmasuk,
//                 cabang_nama: data.cabang_nama,
//                 statustarget_nama: data.statustarget_nama,
//                 statusbagifee_nama: data.statusbagifee_nama,
//                 statusfeemanager_nama: data.statusfeemanager_nama,
//                 marketinggroup_nama: data.marketinggroup_nama,
//                 statusprafee_nama: data.statusprafee_nama,
//                 namadetailorderan: details.nama,
//                 jenisprosesfee_namadetailprosesfee: details.jenisprosesfee_nama,
//                 statuspotongbiayakantor_namadetailprosesfee: details.statuspotongbiayakantor_nama,
//                 statusaktifdetailprosesfee: details.statusaktif_nama,
//               })),
//             };
//           })
//         );

//         // const marketingWithProsesFee = await Promise.all(
//         //   master.data.map(async (data: any) => {
//         //     const marketingprosesfee = await getMarketingProsesFeeFn(data.id);

//         //     marketingprosesfee.data.map(async (details: any) => {
//         //       const marketingdetail = await getMarketingDetailFn(data.id)

//         //       if (marketingdetail.data.length !== 0) {
//         //         return {
//         //           marketingdetail: marketingdetail.data.map((d: any) => ({
//         //             nama: data.nama,
//         //             keterangan: data.keterangan,
//         //             statusaktif_nama: data.statusaktif_nama,
//         //             email: data.email,
//         //             karyawan_nama: data.karyawan_nama,
//         //             tglmasuk: data.tglmasuk,
//         //             cabang_nama: data.cabang_nama,
//         //             statustarget_nama: data.statustarget_nama,
//         //             statusbagifee_nama: data.statusbagifee_nama,
//         //             statusfeemanager_nama: data.statusfeemanager_nama,
//         //             marketinggroup_nama: data.marketinggroup_nama,
//         //             statusprafee_nama: data.statusprafee_nama,
//         //             jenisprosesfee_namadetailprosesfee: details.jenisprosesfee_nama,
//         //             statuspotongbiayakantor_namadetailprosesfee: details.statuspotongbiayakantor_nama,
//         //             statusaktifdetailprosesfee: details.statusaktif_nama,
//         //             nominalawal_detail: d?.nominalawal,
//         //             nominalakhir_detail: d?.nominalakhir,
//         //             persentase_detail: d?.persentase,
//         //             statusaktif_nama_detail: d?.statusaktif_nama,

//         //           }))
//         //         }
//         //       } else {
//         //         return {
//         //           marketingdetail: marketingdetail.data.map((d: any) => ({
//         //             nama: data.nama,
//         //             keterangan: data.keterangan,
//         //             statusaktif_nama: data.statusaktif_nama,
//         //             email: data.email,
//         //             karyawan_nama: data.karyawan_nama,
//         //             tglmasuk: data.tglmasuk,
//         //             cabang_nama: data.cabang_nama,
//         //             statustarget_nama: data.statustarget_nama,
//         //             statusbagifee_nama: data.statusbagifee_nama,
//         //             statusfeemanager_nama: data.statusfeemanager_nama,
//         //             marketinggroup_nama: data.marketinggroup_nama,
//         //             statusprafee_nama: data.statusprafee_nama,
//         //             jenisprosesfee_namadetailprosesfee: details.jenisprosesfee_nama,
//         //             statuspotongbiayakantor_namadetailprosesfee: details.statuspotongbiayakantor_nama,
//         //             statusaktifdetailprosesfee: details.statusaktif_nama,
//         //             nominalawal_detail: '',
//         //             nominalakhir_detail: '',
//         //             persentase_detail:'',
//         //             statusaktif_nama_detail: '',
//         //           }))
//         //         }
//         //       }

//         //     })
//         //   })
//         // );

//         setReportMarketingOrderanData(marketingWithOrderan);
//         setReportMarketingBiayaData(marketingWithBiaya);
//         setReportMarketingManagerData(marketingWithManager);
//         setReportMarketingBProsesFeeData(marketingWithProsesFee);

//       } catch (err) {
//         console.error('Gagal ambil data marketing dan detailnya:', err);
//       }
//     };
//     fetchData();
//   }, []);

//   useEffect(() => {
//     console.log('reportMarketingBProsesFeeData', reportMarketingBProsesFeeData);

//     if (!reportMarketingOrderanData && !reportMarketingBiayaData && !reportMarketingManagerData && !reportMarketingBProsesFeeData) return;

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
//         report.loadFile('/reports/LaporanMarketing.mrt');

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
//         dataSet.readJson({ data: reportMarketingOrderanData });
//         dataSet.readJson({ mbiaya: reportMarketingBiayaData });
//         dataSet.readJson({ mManager: reportMarketingManagerData });
//         dataSet.readJson({ mProsesFee: reportMarketingBProsesFeeData });
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
//   }, [reportMarketingOrderanData, reportMarketingBiayaData, reportMarketingManagerData, reportMarketingBProsesFeeData, token]);

//   return (
//     <div
//       id="content"
//       className="report"
//       style={{ textTransform: 'none', fontSize: 'unset' }}
//     />
//   );
// };

// export default ReportDesigner;
