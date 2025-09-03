// src/lib/terbilang.ts

export interface TerbilangOptions {
  // Gunakan "SERATUS" & "SERIBU" (true) atau "SATU RATUS" & "SATU RIBU" (false)
  preferSeForSeratusSeribu?: boolean; // default: true
  // Kata untuk negatif dan desimal
  negativeWord?: string; // default: "MINUS"
  decimalWord?: string; // default: "KOMA"
}

const DIGITS = [
  'NOL',
  'SATU',
  'DUA',
  'TIGA',
  'EMPAT',
  'LIMA',
  'ENAM',
  'TUJUH',
  'DELAPAN',
  'SEMBILAN'
] as const;

const SCALES = [
  '', // 10^0
  'RIBU', // 10^3
  'JUTA', // 10^6
  'MILIAR', // 10^9
  'TRILIUN', // 10^12
  'KUADRILIUN', // 10^15
  'KUINTILIUN', // 10^18
  'SEKSTILIUN', // 10^21
  'SEPTILIUN', // 10^24
  'OKTILIUN', // 10^27
  'NONILIUN', // 10^30
  'DESILIUN' // 10^33
];

function threeDigitsToWords(n: number, preferSeForSeratus: boolean): string {
  if (n === 0) return '';

  const parts: string[] = [];
  const hundreds = Math.floor(n / 100);
  const tensUnits = n % 100;
  const tens = Math.floor(tensUnits / 10);
  const units = tensUnits % 10;

  // Ratusan
  if (hundreds > 0) {
    if (hundreds === 1) {
      parts.push(preferSeForSeratus ? 'SERATUS' : 'SATU RATUS');
    } else {
      parts.push(`${DIGITS[hundreds]} RATUS`);
    }
  }

  // Puluhan & satuan
  if (tensUnits > 0) {
    if (tensUnits < 10) {
      parts.push(DIGITS[units]);
    } else if (tensUnits === 10) {
      parts.push('SEPULUH');
    } else if (tensUnits === 11) {
      parts.push('SEBELAS');
    } else if (tensUnits < 20) {
      // 12..19
      parts.push(`${DIGITS[units]} BELAS`);
    } else {
      // 20,30,...,90 + satuan
      parts.push(`${DIGITS[tens]} PULUH`);
      if (units > 0) parts.push(DIGITS[units]);
    }
  }

  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function splitByThousands(intStr: string): string[] {
  const groups: string[] = [];
  for (let i = intStr.length; i > 0; i -= 3) {
    const start = Math.max(0, i - 3);
    groups.unshift(intStr.slice(start, i));
  }
  return groups;
}

function integerToWords(
  intStr: string,
  opts: Required<Pick<TerbilangOptions, 'preferSeForSeratusSeribu'>>
): string {
  // Hilangkan leading zeros
  intStr = intStr.replace(/^0+(?=\d)/, '');
  if (intStr === '' || /^0+$/.test(intStr)) return 'NOL';

  const groups = splitByThousands(intStr);
  const parts: string[] = [];

  groups.forEach((grp, idx) => {
    const scaleIdx = groups.length - 1 - idx; // 0 untuk satuan, 1 untuk RIBU, dst.
    const n = parseInt(grp, 10);
    if (n === 0) return;

    if (scaleIdx === 1 && n === 1) {
      // 1 ribu -> SERIBU (atau SATU RIBU jika preferSeForSeratusSeribu=false)
      parts.push(opts.preferSeForSeratusSeribu ? 'SERIBU' : 'SATU RIBU');
      return;
    }

    if (n === 1 && scaleIdx >= 2) {
      // 1 juta/miliar/triliun/... -> "SATU JUTA", bukan "SEJUTA"
      parts.push(`SATU ${SCALES[scaleIdx]}`);
      return;
    }

    const chunkWords = threeDigitsToWords(n, opts.preferSeForSeratusSeribu);
    const scaleWord = SCALES[scaleIdx];
    parts.push(scaleWord ? `${chunkWords} ${scaleWord}` : chunkWords);
  });

  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function detectAndNormalize(input: string): {
  negative: boolean;
  integer: string;
  fraction: string;
} {
  let s = input.trim();

  // Deteksi negatif
  let negative = false;
  if (s.startsWith('-')) {
    negative = true;
    s = s.slice(1);
  }

  // Buang spasi/underscore dan simbol non-digit kecuali .,,
  s = s.replace(/[\s_]/g, '');
  // Jika ada huruf/simbol lain (mis. Rp), buang saja
  s = s.replace(/[^\d.,]/g, '');

  const dotCount = (s.match(/\./g) || []).length;
  const commaCount = (s.match(/,/g) || []).length;

  let decimalSep: '.' | ',' | null = null;

  if (dotCount > 0 && commaCount > 0) {
    // Jika ada keduanya, anggap separator desimal adalah yang paling kanan
    const lastDot = s.lastIndexOf('.');
    const lastComma = s.lastIndexOf(',');
    decimalSep = lastDot > lastComma ? '.' : ',';
  } else if (dotCount === 1 && commaCount === 0) {
    // Satu titik: bisa desimal
    const pos = s.indexOf('.');
    decimalSep = pos > 0 && pos < s.length - 1 ? '.' : null;
  } else if (commaCount === 1 && dotCount === 0) {
    // Satu koma: bisa desimal (gaya ID)
    const pos = s.indexOf(',');
    decimalSep = pos > 0 && pos < s.length - 1 ? ',' : null;
  } else {
    // Tidak bisa pastikan desimal
    decimalSep = null;
  }

  let integer = s;
  let fraction = '';

  if (decimalSep) {
    const [lhs, rhs] = s.split(decimalSep);
    integer = lhs;
    fraction = rhs || '';
  }

  // Buang semua pemisah ribuan dari integer
  integer = integer.replace(/[.,]/g, '');
  // Fraksi: buang semua pemisah (harusnya tidak ada)
  fraction = fraction.replace(/[.,]/g, '');

  // Normalisasi integer kosong -> "0"
  if (integer === '') integer = '0';

  // Hapus leading zeros pada fraction (kita tetap butuh nol di tengah/akhir)
  // Catatan: untuk pelafalan, setiap digit fraksi tetap dibaca apa adanya, termasuk nol awal.
  return { negative, integer, fraction };
}

export function numberToTerbilang(
  value: number | string,
  options?: TerbilangOptions
): string {
  const opts: Required<TerbilangOptions> = {
    preferSeForSeratusSeribu: options?.preferSeForSeratusSeribu ?? true,
    negativeWord: options?.negativeWord ?? 'MINUS',
    decimalWord: options?.decimalWord ?? 'KOMA'
  };

  // Jika number, ubah ke string tanpa notasi ilmiah
  let raw = typeof value === 'number' ? value.toString() : String(value);

  const { negative, integer, fraction } = detectAndNormalize(raw);

  const intWords = integerToWords(integer, {
    preferSeForSeratusSeribu: opts.preferSeForSeratusSeribu
  });
  const parts: string[] = [];

  if (negative && !(integer === '0' && fraction.replace(/0+/g, '') === '')) {
    parts.push(opts.negativeWord);
  }

  parts.push(intWords);

  if (fraction && fraction.length > 0) {
    // Desimal: baca per digit
    const fracParts = Array.from(fraction).map(
      (ch) => DIGITS[parseInt(ch, 10) || 0]
    );
    parts.push(opts.decimalWord, ...fracParts);
  }

  return parts.join(' ').replace(/\s+/g, ' ').trim();
}
