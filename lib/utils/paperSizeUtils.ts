interface PaperSizeConfig {
  name: string;
  layout: 'portrait' | 'landscape';
  description: string;
}

interface PaperSizeData {
  paperSizes: Record<string, PaperSizeConfig>;
  default: {
    name: string;
    layout: 'portrait' | 'landscape';
  };
  tolerance: number;
}

let paperSizeCache: PaperSizeData | null = null;

export async function loadPaperSizeConfig(): Promise<PaperSizeData> {
  if (paperSizeCache) {
    return paperSizeCache;
  }

  try {
    const response = await fetch('/config/papersize.json');
    if (!response.ok) {
      throw new Error('Failed to load paper size config');
    }
    paperSizeCache = await response.json();
    return paperSizeCache!;
  } catch (error) {
    console.error('Error loading paper size config:', error);
    return {
      paperSizes: {},
      default: {
        name: 'CUSTOM_A4',
        layout: 'portrait'
      },
      tolerance: 2
    };
  }
}

function createSizeKey(width: number, height: number): string {
  return `${width}x${height}`;
}

function isWithinTolerance(
  value1: number,
  value2: number,
  tolerance: number
): boolean {
  return Math.abs(value1 - value2) <= tolerance;
}

function findMatchingSize(
  width: number,
  height: number,
  config: PaperSizeData
): PaperSizeConfig | null {
  const tolerance = config.tolerance || 2;

  for (const [sizeKey, paperConfig] of Object.entries(config.paperSizes)) {
    const [configWidth, configHeight] = sizeKey.split('x').map(Number);

    if (
      isWithinTolerance(width, configWidth, tolerance) &&
      isWithinTolerance(height, configHeight, tolerance)
    ) {
      return paperConfig;
    }
  }

  return null;
}

export async function detectPaperSize(
  width: number,
  height: number
): Promise<{
  paperSize: string;
  layout: 'portrait' | 'landscape';
}> {
  const config = await loadPaperSizeConfig();

  const roundedWidth = Math.round(width * 10) / 10;
  const roundedHeight = Math.round(height * 10) / 10;

  console.log('Detecting paper size:', {
    width: roundedWidth,
    height: roundedHeight
  });

  const matchedSize = findMatchingSize(roundedWidth, roundedHeight, config);

  if (matchedSize) {
    console.log('Matched paper size:', matchedSize);
    return {
      paperSize: matchedSize.name,
      layout: matchedSize.layout
    };
  }

  const layout = roundedWidth > roundedHeight ? 'landscape' : 'portrait';

  console.log('No exact match, using default:', {
    paperSize: config.default.name,
    layout
  });

  return {
    paperSize: config.default.name,
    layout
  };
}

/**
 * Extract paper size from MRT file
 */
export async function extractPaperSizeFromMRT(mrtUrl: string): Promise<{
  paperSize: string;
  layout: 'portrait' | 'landscape';
} | null> {
  try {
    const response = await fetch(mrtUrl);
    const text = await response.text();

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');

    const reportUnit = xmlDoc.querySelector('ReportUnit');
    const unitAttr = reportUnit?.getAttribute('Unit');

    let unitMultiplier = 1;
    if (unitAttr === 'HundrethsOfInch') {
      unitMultiplier = 0.254;
    } else if (unitAttr === 'Inches') {
      unitMultiplier = 25.4;
    }

    const paperSizeElement = xmlDoc.querySelector('PaperSize');
    if (paperSizeElement) {
      const widthStr = paperSizeElement.textContent?.split(',')[0];
      const heightStr = paperSizeElement.textContent?.split(',')[1];

      if (widthStr && heightStr) {
        const width = parseFloat(widthStr) * unitMultiplier;
        const height = parseFloat(heightStr) * unitMultiplier;

        return await detectPaperSize(width, height);
      }
    }

    const page = xmlDoc.querySelector('Page');
    if (page) {
      const pageWidth = page.getAttribute('PageWidth');
      const pageHeight = page.getAttribute('PageHeight');

      if (pageWidth && pageHeight) {
        const width = parseFloat(pageWidth) * unitMultiplier;
        const height = parseFloat(pageHeight) * unitMultiplier;

        return await detectPaperSize(width, height);
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting paper size from MRT:', error);
    return null;
  }
}

export async function extractPaperSizeFromPDF(pdfUrl: string): Promise<{
  paperSize: string;
  layout: 'portrait' | 'landscape';
} | null> {
  try {
    const response = await fetch(pdfUrl);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const text = new TextDecoder('latin1').decode(uint8Array);

    const mediaBoxMatch = text.match(
      /\/MediaBox\s*\[\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\]/
    );

    if (mediaBoxMatch) {
      const width =
        (parseFloat(mediaBoxMatch[3]) - parseFloat(mediaBoxMatch[1])) *
        0.352778;
      const height =
        (parseFloat(mediaBoxMatch[4]) - parseFloat(mediaBoxMatch[2])) *
        0.352778;

      return await detectPaperSize(width, height);
    }

    return null;
  } catch (error) {
    console.error('Error extracting paper size from PDF:', error);
    return null;
  }
}
