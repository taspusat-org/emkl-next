declare module 'pdfjs-dist/legacy/build/pdf' {
  export function getDocument(
    url: string | Uint8Array | PDFDataRangeTransport,
    options?: any
  ): Promise<any>;
  export interface PDFPageProxy {
    getViewport(scale: number): any;
    render(params: {
      canvasContext: CanvasRenderingContext2D;
      viewport: any;
    }): Promise<void>;
  }
}
