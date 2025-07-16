'use client';
import { Button } from '@/components/ui/button';
// pages/reports/menu.tsx
import { useEffect, useState } from 'react';
import { FaPrint } from 'react-icons/fa';

const ReportMenuPage: React.FC = () => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    // Retrieve the PDF URL from sessionStorage
    const storedPdfUrl = sessionStorage.getItem('pdfUrl');
    if (storedPdfUrl) {
      setPdfUrl(storedPdfUrl + '#toolbar=0&navpanes=0&scrollbar=0'); // Set the URL in the state
    }
  }, []);

  // Function to handle the PDF printing
  const handlePrint = () => {
    const iframe = document.getElementById('pdfIframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.contentWindow?.print();
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        margin: 0,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Top content (buttons for download and print) */}
      <div className="flex flex-row items-center justify-end gap-2 px-4 py-2">
        <Button
          onClick={() => {
            const link = document.createElement('a');
            link.href = pdfUrl || '';
            link.download = 'report.pdf'; // Download filename
            link.click();
          }}
          className="flex cursor-pointer flex-row items-center gap-1 rounded-sm border-none bg-[#4CAF50] px-2 py-1 text-sm text-white hover:bg-[#54cd58]"
        >
          <FaPrint />
          <p className="text-sm">Download</p>
        </Button>
        <Button
          onClick={handlePrint}
          className="flex cursor-pointer flex-row items-center gap-1 rounded-sm border-none bg-[#008CBA] px-2 py-1 text-sm text-white"
        >
          <FaPrint />
          <p className="text-sm">Print</p>
        </Button>
      </div>

      {/* Scrollable content area */}
      <div style={{ flexGrow: 1, overflowY: 'auto' }}>
        {pdfUrl ? (
          <iframe
            id="pdfIframe"
            src={pdfUrl}
            width="100%" // Fill the available width
            height="100%" // Fill the available height
            style={{ border: 'none' }}
            title="PDF Report"
          />
        ) : (
          <p>Loading PDF...</p>
        )}
      </div>
    </div>
  );
};

export default ReportMenuPage;
