import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Tentukan path file JSON yang akan dibaca
    const filePath = path.resolve(process.cwd(), 'public', 'data.json');

    // Membaca file JSON
    const fileData = fs.readFileSync(filePath, 'utf-8');

    // Mengirimkan data JSON sebagai respons
    return NextResponse.json(JSON.parse(fileData), { status: 200 });
  } catch (error) {
    console.error('Error membaca data:', error);
    return NextResponse.json(
      { message: 'Gagal membaca data' },
      { status: 500 }
    );
  }
}
