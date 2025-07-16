import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const GRID_CONFIG_PATH = path.resolve('gridConfig.json');

interface GridConfig {
  columnsOrder: number[];
  columnsWidth: { [key: string]: number | string };
}

interface GridConfigFile {
  [key: string]: GridConfig;
}

export async function POST(req: Request) {
  try {
    const body: { userId: string; gridName: string; config: GridConfig } =
      await req.json();
    const { userId, gridName, config } = body;

    if (!userId || !gridName || !config) {
      return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
    }

    let currentConfig: GridConfigFile = {};

    // Baca file konfigurasi saat ini, dengan penanganan error parsing
    if (fs.existsSync(GRID_CONFIG_PATH)) {
      const fileContent = fs.readFileSync(GRID_CONFIG_PATH, 'utf-8');
      try {
        currentConfig = JSON.parse(fileContent) as GridConfigFile;
      } catch (parseError) {
        console.error('Error parsing JSON file:', parseError);
        currentConfig = {};
      }
    }

    // Update konfigurasi dengan grid baru berdasarkan userId
    const gridKey = `${gridName}-${userId}`;
    currentConfig[gridKey] = config;

    // Tulis kembali file konfigurasi
    fs.writeFileSync(
      GRID_CONFIG_PATH,
      JSON.stringify(currentConfig, null, 2),
      'utf-8'
    );

    return NextResponse.json(
      { message: 'Configuration saved successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving configuration:', error);
    return NextResponse.json(
      { message: 'Failed to save grid configuration', error },
      { status: 500 }
    );
  }
}
