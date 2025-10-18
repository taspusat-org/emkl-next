import { type ClassValue, clsx } from 'clsx';
import { format } from 'date-fns';
import { twMerge } from 'tailwind-merge';
import { GetParams } from './types/all.type';
import { REQUIRED_FIELD } from '@/constants/validation';

interface GridConfig {
  columnsOrder: number[];
  columnsWidth: { [key: string]: number };
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function formatBytes(
  bytes: number,
  opts: {
    decimals?: number;
    sizeType?: 'accurate' | 'normal';
  } = {}
) {
  const { decimals = 0, sizeType = 'normal' } = opts;

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const accurateSizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${
    sizeType === 'accurate' ? accurateSizes[i] ?? 'Bytes' : sizes[i] ?? 'Bytes'
  }`;
}
export function formatDateTime(timestamp: string): string | null {
  if (!timestamp) {
    return null; // Jika tidak ada timestamp, kembalikan null
  }

  try {
    // Buat objek Date dari timestamp
    const date = new Date(timestamp);

    // Pastikan timestamp valid
    if (isNaN(date.getTime())) {
      throw new Error('Invalid timestamp');
    }

    // Ambil hari, bulan, tahun, jam, menit, dan detik
    const day = String(date.getUTCDate()).padStart(2, '0'); // Gunakan UTC untuk mencegah perubahan zona waktu
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    // Gabungkan ke format yang diinginkan
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return null; // Jika error, kembalikan null
  }
}

export function formatDate(timestamp: string): string {
  // Mengonversi string timestamp ke objek Date
  const date = new Date(timestamp);

  // Mendapatkan hari, bulan, tahun, jam, menit, dan detik
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0
  const year = date.getFullYear();

  // Mengembalikan format yang diinginkan
  return `${day}-${month}-${year}`;
}
export function formatDateToDDMMYYYY(dateString: any) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export const formatDateCalendar = (date: Date) => {
  return format(date, 'dd-MM-yyyy'); // Mengubah format menjadi yyyy-mm-dd
};
export function parseDateFromDDMMYYYY(str: string) {
  // str = "dd-mm-yyyy"
  const [day, month, year] = str.split('-');
  return new Date(`${year}-${month}-${day}`); // Mengubah ke format yyyy-mm-dd
}

// Make the function more reusable by accepting any custom filters or parameters
export const buildQueryParams = ({
  limit,
  page,
  filters = {},
  sortBy = '',
  isLookUp = '',
  sortDirection = 'asc',
  search = ''
}: GetParams) => {
  return {
    page,
    limit,
    search,
    isLookUp,
    sortBy,
    sortDirection,
    ...filters // Spread filters directly here (e.g., title, parentId, icon)
  };
};
export function isLeapYear(year: any) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
export function dynamicRequiredMessage(fieldName: string) {
  return `${fieldName.toUpperCase()} ${REQUIRED_FIELD}`;
}
export const parseCurrency = (value: string): number => {
  // Convert value to string and trim any whitespace before processing
  const stringValue = String(value).trim();

  if (!stringValue || stringValue === '') return 0; // Return 0 if the value is empty or invalid

  return parseFloat(stringValue.replace(/,/g, '')) || 0;
};

export const formatCurrency = (value: number | string): string => {
  if (typeof value === 'string' && value.trim() === '') return ''; // Handle empty input

  const number = typeof value === 'string' ? parseCurrency(value) : value;

  if (isNaN(number)) return ''; // Return empty if it's not a valid number

  // Format angka sebagai currency dengan ribuan dan dua desimal
  return number.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const cancelPreviousRequest = (abortControllerRef: any) => {
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }
  abortControllerRef.current = new AbortController(); // Buat AbortController baru untuk request berikutnya
};

export const handleContextMenu = (event: React.MouseEvent) => {
  event.preventDefault();
  return { x: event.clientX, y: event.clientY };
};

export const saveGridConfig = async (
  userId: string, // userId sebagai identifier
  gridName: string,
  columnsOrder: number[],
  columnsWidth: { [key: string]: number }
) => {
  try {
    const response = await fetch('/api/savegrid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        gridName,
        config: { columnsOrder, columnsWidth }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save grid configuration');
    }
  } catch (error) {
    console.error('Failed to save grid configuration:', error);
  }
};

export const loadGridConfig = async (
  userId: string,
  gridName: string,
  columns: any,
  setColumnsOrder: React.Dispatch<React.SetStateAction<readonly number[]>>,
  setColumnsWidth: React.Dispatch<
    React.SetStateAction<{ [key: string]: number }>
  >
) => {
  try {
    const response = await fetch(
      `/api/loadgrid?userId=${userId}&gridName=${gridName}`
    );
    if (!response.ok) {
      throw new Error('Failed to load grid configuration');
    }

    const { columnsOrder, columnsWidth }: GridConfig = await response.json();

    setColumnsOrder(
      columnsOrder && columnsOrder.length
        ? columnsOrder
        : columns.map((_: any, index: number) => index)
    );
    setColumnsWidth(
      columnsWidth && Object.keys(columnsWidth).length
        ? columnsWidth
        : columns.reduce(
            (acc: any, column: any) => ({
              ...acc,
              [column.key]: columnsWidth[column.key] || column.width // Use width from columnsWidth or fallback to default column width
            }),
            {}
          )
    );
  } catch (error) {
    console.error('Failed to load grid configuration:', error);

    // If configuration is not available or error occurs, fallback to original column widths
    setColumnsOrder(columns.map((_: any, index: number) => index));
    setColumnsWidth(
      columns.reduce(
        (acc: any, column: any) => {
          // Use the original column width instead of '1fr' when configuration is missing or error occurs
          acc[column.key] = typeof column.width === 'number' ? column.width : 0; // Ensure width is a number or default to 0
          return acc;
        },
        {} as { [key: string]: number }
      )
    );
  }
};

export const resetGridConfig = (
  userId: string,
  gridName: string,
  columns: any,
  setColumnsOrder: React.Dispatch<React.SetStateAction<readonly number[]>>,
  setColumnsWidth: React.Dispatch<
    React.SetStateAction<{ [key: string]: number }>
  >
) => {
  // Nilai default untuk columnsOrder dan columnsWidth
  const defaultColumnsOrder = columns.map((_: any, index: number) => index);
  const defaultColumnsWidth = columns.reduce(
    (acc: any, column: any) => {
      acc[column.key] = typeof column.width === 'number' ? column.width : 0;
      return acc;
    },
    {} as { [key: string]: number }
  );

  // Set state kembali ke nilai default
  setColumnsOrder(defaultColumnsOrder);
  setColumnsWidth(defaultColumnsWidth);
  // setContextMenu(null);
  // setDataGridKey((prevKey) => prevKey + 1);

  // gridRef?.current?.selectCell({ rowIdx: 0, idx: 0 });

  // Simpan konfigurasi reset ke server (atau backend)
  if (userId) {
    saveGridConfig(userId, gridName, defaultColumnsOrder, defaultColumnsWidth);
  }
};
