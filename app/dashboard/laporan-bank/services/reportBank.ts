import { getBankFn } from '@/lib/apis/bank.api';
import { store } from '@/lib/store/store';
interface Filter {
  page: number;
  limit: number;
  search: string;

  filters: {
    nama: string;
    keterangan: string;
    created_at: string;
    updated_at: string;

    coa: string;
    keterangancoa: string;

    coagantung: string;
    keterangancoagantung: string;

    statusbank: string;
    textbank: string;

    statusaktif: string;
    text: string;

    statusdefault: string;
    textdefault: string;

    formatpenerimaan: string;
    formatpenerimaantext: string;

    formatpengeluaran: string;
    formatpengeluarantext: string;

    formatpenerimaangantung: string;
    formatpenerimaangantungtext: string;

    formatpengeluarangantung: string;
    formatpengeluarangantungtext: string;

    formatpencairan: string;
    formatpencairantext: string;

    formatrekappenerimaan: string;
    formatrekappenerimaantext: string;

    formatrekappengeluaran: string;
    formatrekappengeluarantext: string;
  };
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

export const handleReportBank = async () => {
  const state = store.getState();
  const user = state.auth.user;
  const filters = {
    page: 1,
    limit: 30,
    search: '',
    filters: {
      nama: '',
      keterangan: '',
      created_at: '',
      updated_at: '',
      coa: '',
      keterangancoa: '',
      coagantung: '',
      keterangancoagantung: '',
      statusbank: '',
      textbank: '',
      statusaktif: '',
      text: '',
      statusdefault: '',
      textdefault: '',
      formatpenerimaan: '',
      formatpenerimaantext: '',
      formatpengeluaran: '',
      formatpengeluarantext: '',
      formatpenerimaangantung: '',
      formatpenerimaangantungtext: '',
      formatpengeluarangantung: '',
      formatpengeluarangantungtext: '',
      formatpencairan: '',
      formatpencairantext: '',
      formatrekappenerimaan: '',
      formatrekappenerimaantext: '',
      formatrekappengeluaran: '',
      formatrekappengeluarantext: ''
    },
    sortBy: 'nama',
    sortDirection: 'asc'
  };

  const { page, limit, ...filtersWithoutLimit } = filters;
  const response = await getBankFn(filtersWithoutLimit);
  const reportRows = response.data.map((row: any) => ({
    ...row,
    judullaporan: 'Laporan Bank',
    usercetak: user.username,
    tglcetak: new Date().toLocaleDateString(),
    judul: 'PT.TRANSPORINDO AGUNG SEJAHTERA'
  }));

  import('stimulsoft-reports-js/Scripts/stimulsoft.blockly.editor')
    .then((module) => {
      const { Stimulsoft } = module;
      Stimulsoft.Base.StiFontCollection.addOpentypeFontFile(
        '/fonts/tahoma.ttf',
        'Arial'
      );
      Stimulsoft.Base.StiLicense.Key =
        '6vJhGtLLLz2GNviWmUTrhSqnOItdDwjBylQzQcAOiHksEid1Z5nN/hHQewjPL/4/AvyNDbkXgG4Am2U6dyA8Ksinqp' +
        '6agGqoHp+1KM7oJE6CKQoPaV4cFbxKeYmKyyqjF1F1hZPDg4RXFcnEaYAPj/QLdRHR5ScQUcgxpDkBVw8XpueaSFBs' +
        'JVQs/daqfpFiipF1qfM9mtX96dlxid+K/2bKp+e5f5hJ8s2CZvvZYXJAGoeRd6iZfota7blbsgoLTeY/sMtPR2yutv' +
        'gE9TafuTEhj0aszGipI9PgH+A/i5GfSPAQel9kPQaIQiLw4fNblFZTXvcrTUjxsx0oyGYhXslAAogi3PILS/DpymQQ' +
        '0XskLbikFsk1hxoN5w9X+tq8WR6+T9giI03Wiqey+h8LNz6K35P2NJQ3WLn71mqOEb9YEUoKDReTzMLCA1yJoKia6Y' +
        'JuDgUf1qamN7rRICPVd0wQpinqLYjPpgNPiVqrkGW0CQPZ2SE2tN4uFRIWw45/IITQl0v9ClCkO/gwUtwtuugegrqs' +
        'e0EZ5j2V4a1XDmVuJaS33pAVLoUgK0M8RG72';

      const report = new Stimulsoft.Report.StiReport();
      const dataSet = new Stimulsoft.System.Data.DataSet('Data');

      // Load the report template (MRT file)
      report.loadFile('/reports/LaporanBank.mrt');
      report.dictionary.dataSources.clear();
      dataSet.readJson({ data: reportRows });
      report.regData(dataSet.dataSetName, '', dataSet);
      report.dictionary.synchronize();

      // Render the report asynchronously
      report.renderAsync(() => {
        // Export the report to PDF asynchronously
        report.exportDocumentAsync((pdfData: any) => {
          const pdfBlob = new Blob([new Uint8Array(pdfData)], {
            type: 'application/pdf'
          });
          const pdfUrl = URL.createObjectURL(pdfBlob);

          // Store the Blob URL in sessionStorage
          sessionStorage.setItem('pdfUrl', pdfUrl);

          // Navigate to the report page
          window.open('/reports/bank', '_blank');
        }, Stimulsoft.Report.StiExportFormat.Pdf);
      });
    })
    .catch((error) => {
      console.error('Failed to load Stimulsoft:', error);
    });
};
