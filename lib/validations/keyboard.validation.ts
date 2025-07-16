import { z } from 'zod';

// Fungsi validasi karakter ASCII (32–126)
export const isValidAscii = (value: string) => {
  return [...value].every((char) => {
    const charCode = char.charCodeAt(0);
    return charCode >= 32 && charCode <= 126; // Validasi ASCII antara 32 dan 126
  });
};

// Fungsi validasi global untuk semua string dalam schema
const validateAsciiInSchema = (data: Record<string, any>) => {
  return Object.values(data).every((value) => {
    if (typeof value === 'string') {
      return isValidAscii(value); // Validasi hanya untuk field string
    }
    return true; // Tidak melakukan validasi untuk field non-string
  });
};

export { validateAsciiInSchema };
