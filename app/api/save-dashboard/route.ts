import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Membaca seluruh body JSON dari request
    const data = await req.json();

    // Tentukan path file JSON yang akan disimpan
    const filePath = path.resolve(process.cwd(), 'public', 'data.json');

    // Menyimpan data ke file JSON
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    // Mengirimkan respon sukses
    return NextResponse.json(
      { message: 'Data berhasil disimpan', data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error menyimpan data:', error);
    return NextResponse.json(
      { message: 'Gagal menyimpan data' },
      { status: 500 }
    );
  }
}
