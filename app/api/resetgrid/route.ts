import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const GRID_CONFIG_PATH = path.resolve('gridConfig.json');

export async function DELETE(req: Request) {
  try {
    if (fs.existsSync(GRID_CONFIG_PATH)) {
      const data = JSON.parse(fs.readFileSync(GRID_CONFIG_PATH, 'utf-8'));

      // Ambil parameter key yang ingin dihapus dari request body atau query
      const { key } = await req.json();

      if (key && data[key]) {
        delete data[key]; // Hapus konfigurasi berdasarkan key

        // Simpan kembali perubahan ke dalam file
        fs.writeFileSync(GRID_CONFIG_PATH, JSON.stringify(data, null, 2));

        return NextResponse.json(
          { message: `Configuration for ${key} removed successfully` },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { message: 'Configuration key not found' },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { message: 'Configuration file not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to reset configuration', error },
      { status: 500 }
    );
  }
}
