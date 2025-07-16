import { type ClassValue, clsx } from 'clsx';
import { format } from 'date-fns';
import { twMerge } from 'tailwind-merge';
import { GetParams } from './types/all.type';
import { REQUIRED_FIELD } from '@/constants/validation';

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
  console.log('str', str);
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
