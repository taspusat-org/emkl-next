export interface PrinterInfo {
  name: string;
  isDefault?: boolean;
  status?: string;
}

export interface PrintOptions {
  printer?: string;
  paperSize?: string;
  pages?: string;
  subset?: 'odd' | 'even';
  orientation?: 'portrait' | 'landscape';
  scale?: 'noscale' | 'shrink' | 'fit';
  monochrome?: boolean; // true = B/W (Color off)
  side?: 'duplex' | 'duplexshort' | 'duplexlong' | 'simplex';
  bin?: string;
  silent?: boolean;
  printDialog?: boolean;
  copies?: number;
}

export interface PrintFileBody {
  file: File | Blob;
  options: PrintOptions;
}

export interface PrinterDefault {
  name: string;
}

const BASE = 'http://localhost:3004/api/printer';

export async function getPrintersFn(): Promise<PrinterInfo[]> {
  try {
    const url = `${BASE}`;

    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Failed to fetch printers:', errorText);
      throw new Error(
        `Failed to fetch printers: ${errorText || res.statusText}`
      );
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error('Invalid printer list response, expected an array');
    }

    const formattedData = data.map((printer: any) => ({
      name: printer.name || '',
      isDefault: printer.isDefault || false,
      status: printer.status || 'Unknown'
    }));

    return formattedData;
  } catch (error: any) {
    console.error('Error fetching printers:', error.message || error);
    throw new Error(error.message || 'Gagal mengambil daftar printer');
  }
}

export async function getPaperSizesFn(printerName: string): Promise<string[]> {
  const formatPrinterName = (name: string): string => {
    if (name.startsWith('\\\\')) {
      return name;
    }

    const ipPattern = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/;

    if (ipPattern.test(name)) {
      const formatted = name.replace(ipPattern, (_, ip) => `${ip}\\`);
      return `\\\\${formatted}`;
    }

    return name;
  };

  const safePrinterName = formatPrinterName(printerName);

  const url = `${BASE}/paper-sizes?printerName=${encodeURIComponent(
    safePrinterName
  )}`;

  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error('Failed to fetch paper sizes');
  }

  return res.json();
}

export async function printFileFn(
  body: PrintFileBody
): Promise<{ success: boolean; message: string }> {
  const fixedOptions = {
    ...body.options,
    printer: body.options.printer?.replace(/\\\\/g, '\\')
  };

  const formData = new FormData();
  formData.append('file', body.file, 'document.pdf');
  formData.append('options', JSON.stringify(fixedOptions));

  const res = await fetch(`${BASE}/print-file`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(t || 'Failed to send print job');
  }

  return res.json();
}
