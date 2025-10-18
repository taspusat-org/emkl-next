import fs from 'fs';
import path from 'path';

export interface ReportSetting {
  paperSize: string;
  orientation: 'portrait' | 'landscape';
}

export function getReportConfig(reportName: string): ReportSetting {
  try {
    const configPath = process.env.NEXT_PUBLIC_REPORT_CONFIG_PATH;
    if (!configPath) {
      throw new Error('NEXT_PUBLIC_REPORT_CONFIG_PATH tidak ditemukan');
    }

    const absolutePath = path.join(process.cwd(), configPath);

    const raw = fs.readFileSync(absolutePath, 'utf-8');
    const configJson = JSON.parse(raw);

    const report = configJson[reportName];
    if (!report) {
      console.warn(`Konfigurasi '${reportName}' tidak ditemukan`);
      return { paperSize: 'A4', orientation: 'portrait' };
    }

    return {
      paperSize: report.paperSize || 'A4',
      orientation:
        (report.orientation || 'portrait').toLowerCase() === 'landscape'
          ? 'landscape'
          : 'portrait'
    };
  } catch (err) {
    console.error('Gagal membaca konfigurasi laporan:', err);
    return { paperSize: 'A4', orientation: 'portrait' };
  }
}
