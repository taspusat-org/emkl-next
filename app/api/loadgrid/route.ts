import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const GRID_CONFIG_PATH = path.resolve('gridConfig.json');

interface GridConfig {
  columnsOrder: number[];
  columnsWidth: { [key: string]: number | string }; // Pastikan tipe sesuai data JSON
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const gridName = url.searchParams.get('gridName'); // Normalisasi ke lowercase
    const userId = url.searchParams.get('userId'); // Ambil userId dari parameter query
    if (!gridName || !userId) {
      return NextResponse.json(
        { message: 'Both grid name and user ID are required' },
        { status: 400 }
      );
    }

    if (fs.existsSync(GRID_CONFIG_PATH)) {
      const configData = fs.readFileSync(GRID_CONFIG_PATH, 'utf-8');
      const config = JSON.parse(configData);

      // Gabungkan gridName dan userId untuk membuat key unik
      const gridKey = `${gridName}-${userId}`;

      const gridConfig = config[gridKey];

      if (gridConfig) {
        return NextResponse.json(gridConfig, { status: 200 });
      } else {
        return NextResponse.json(
          { message: `Grid configuration for "${gridKey}" not found` },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { message: 'No configurations found', data: {} },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to load grid configuration', error },
      { status: 500 }
    );
  }
}
