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
import { FaDownload, FaFileExport, FaPrint, FaTimes } from 'react-icons/fa';

// Plugins
import {
  defaultLayoutPlugin,
  ToolbarProps,
  ToolbarSlot
} from '@react-pdf-viewer/default-layout';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import { printPlugin } from '@react-pdf-viewer/print';

// API
import {
  getPrintersFn,
  printDocumentFn,
  PrinterInfo
} from '@/lib/apis/print.api';
import { exportPengeluaranEmklHeaderFn } from '@/lib/apis/pengeluaranemklheader.api';

const ReportMenuPage: React.FC = () => {
  // ===== STATE =====
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [savedFilters, setSavedFilters] = useState<any>({});
  const [savedId, setSavedId] = useState<number | null>(null);

  // State untuk printer
  const [printers, setPrinters] = useState<PrinterInfo[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>('');
  const [loadingPrinters, setLoadingPrinters] = useState<boolean>(false);

  // State untuk dialog custom
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // ===== PLUGINS =====
  const zoomPluginInstance = zoomPlugin();
  const { ZoomPopover } = zoomPluginInstance;

  const printPluginInstance = printPlugin();

  // ===== FETCH DATA PRINTER =====
  useEffect(() => {
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
  }, []);

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

  // ===== EXPORT EXCEL =====
  const handleExport = async () => {
    try {
      const exportPayload = { ...savedFilters };
      const response = await exportPengeluaranEmklHeaderFn(
        Number(savedId),
        exportPayload
      );

      // Download file Excel
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `laporan_pengeluaran_emkl_header_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting pengeluaran emkl header data:', error);
    }
  };

  // ===== HANDLE DOWNLOAD DENGAN DIALOG CUSTOM =====
  const handleDownloadClick = () => {
    if (!pdfUrl) {
      alert('Tidak ada dokumen untuk diunduh!');
      return;
    }

    // Buat URL download
    const url = pdfUrl;
    setDownloadUrl(url);
    setShowSaveDialog(true);
  };

  const handleSaveConfirm = () => {
    // Lakukan download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `laporan_${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Tutup dialog
    setShowSaveDialog(false);
    setDownloadUrl('');
  };

  const handleSaveCancel = () => {
    // Tutup dialog tanpa download
    setShowSaveDialog(false);
    setDownloadUrl('');
  };

  // --- KOMPONEN MODAL CETAK KUSTOM ---
  const CustomPrintModal = ({
    isOpen,
    onClose,
    docUrl
  }: {
    isOpen: boolean;
    onClose: () => void;
    docUrl: string;
  }) => {
    const [destination, setDestination] = useState('save_as_pdf');
    const [printers, setPrinters] = useState<PrinterInfo[]>([]);
    const [loadingPrinters, setLoadingPrinters] = useState(false);

    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Ambil daftar printer dari backend saat modal dibuka
    useEffect(() => {
      if (!isOpen) return;

      const fetchPrinters = async () => {
        try {
          setLoadingPrinters(true);
          const data = await getPrintersFn();
          setPrinters(data); // hasil API simpan ke state
        } catch (error) {
          console.error('Gagal mengambil daftar printer:', error);
        } finally {
          setLoadingPrinters(false);
        }
      };

      fetchPrinters();
    }, [isOpen]);

    if (!isOpen) return null;

    const handleCancel = () => {
      console.log('❌ User membatalkan print (Cancel)');
      onClose();
    };

    const handleAction = async () => {
      if (destination === 'save_as_pdf') {
        // Jika pilih Save as PDF → download file lokal
        console.log('✅ User memilih SAVE AS PDF');
        const link = document.createElement('a');
        link.href = docUrl;
        link.download = `Laporan-${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        onClose();
      } else {
        // [DIUBAH] Logika untuk kirim ke printer fisik
        try {
          console.log('✅ User memilih printer:', destination);

          // 1. Fetch data dari docUrl untuk mendapatkan Blob
          const response = await fetch(docUrl);
          const fileBlob = await response.blob();

          // 2. Kirim Blob ke backend, bukan URL string
          const result = await printDocumentFn({
            printerName: destination,
            file: fileBlob // Kirim objek Blob
          });

          alert(`Dokumen berhasil dikirim ke printer! ${result.message || ''}`);
          onClose();
        } catch (error) {
          console.error('Gagal mengirim dokumen ke printer:', error);
          alert('Gagal mengirim dokumen ke printer.');
        }
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
        <div className="flex h-[90vh] w-[90vw] max-w-7xl flex-row rounded-lg bg-gray-50 shadow-2xl">
          {/* Panel Kiri: Pengaturan Cetak */}
          <div className="flex w-96 flex-col border-r border-gray-300 bg-white p-6">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">Print</h2>

            <div className="mb-5">
              <label
                htmlFor="destination"
                className="mb-1 block text-sm font-medium text-gray-600"
              >
                Destination
              </label>
              <select
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="save_as_pdf">Save as PDF</option>
                {loadingPrinters ? (
                  <option disabled>Loading printers...</option>
                ) : (
                  printers.map((printer) => (
                    <option key={printer.name} value={printer.name}>
                      {printer.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Tombol Aksi di Bagian Bawah */}
            <div className="mt-auto flex justify-end space-x-3 pt-4">
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
          <div className="flex-1 overflow-y-auto bg-gray-200 p-4">
            <div className="h-full w-full bg-white shadow-lg">
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

  // ===== PLUGIN LAYOUT =====
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

              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="flex flex-row items-center gap-2 rounded bg-cyan-500 px-3 py-1 text-white hover:bg-cyan-700"
              >
                <FaPrint /> Print
              </button>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={handleDownloadClick}
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
      {/* Dialog Custom untuk Save/Cancel */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Konfirmasi Download</h3>
              <button
                onClick={handleSaveCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            <p className="mb-6 text-gray-600">
              Apakah Anda yakin ingin mengunduh file PDF ini?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleSaveCancel}
                className="rounded border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfirm}
                className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

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
