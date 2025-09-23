import { api2 } from '../utils/AxiosInstance';

// Tipe data untuk printer (opsional, untuk TypeScript)
export interface PrinterInfo {
  name: string;
  status?: string;
  isDefault?: boolean;
}

// Payload untuk print dokumen
interface PrintPayload {
  printerName: string;
  file: File | Blob; // Menerima objek File atau Blob
}

/**
 * Ambil daftar printer yang tersedia dari backend NestJS
 */
export const getPrintersFn = async (): Promise<PrinterInfo[]> => {
  try {
    const response = await api2.get('/printers');
    return response.data; // hasil berupa array printer
  } catch (error) {
    console.error('Error fetching printers:', error);
    throw new Error('Gagal mengambil daftar printer');
  }
};

/**
 * Kirim file PDF ke backend untuk dicetak ke printer tertentu
 */
export const printDocumentFn = async (payload: PrintPayload): Promise<any> => {
  // 1. Buat objek FormData
  const formData = new FormData();

  // 2. Tambahkan data ke FormData
  // Nama field ('printerName' dan 'file') harus cocok dengan yang ada di backend
  formData.append('printerName', payload.printerName);

  // 'file' harus cocok dengan @UseInterceptors(FileInterceptor('file'))
  // 'document.pdf' adalah nama file yang akan diterima di backend
  formData.append('file', payload.file, 'document.pdf');

  try {
    // 3. Kirim FormData. Axios akan otomatis mengatur Content-Type menjadi multipart/form-data.
    const response = await api2.post('/printers/print', formData);
    return response.data;
  } catch (error) {
    console.error('Error printing document:', error);
    throw new Error('Gagal mengirim dokumen ke printer');
  }
};
