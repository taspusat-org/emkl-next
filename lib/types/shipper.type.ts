import { IMeta } from './error.type';

export interface IShipper {
  id: number;
  statusrelasi: number;
  relasi_id: number;
  nama: string;
  keterangan: string | null;
  contactperson: string | null;
  alamat: string | null;
  coa: string;
  coa_text: string | null;
  coapiutang: string;
  coapiutang_text: string | null;
  coahutang: string;
  coahutang_text: string | null;
  kota: string | null;
  kodepos: string | null;
  telp: string | null;
  email: string | null;
  fax: string | null;
  web: string | null;
  creditlimit: number;
  creditterm: number;
  credittermplus: number;
  npwp: string;
  coagiro: string;
  coagiro_text: string | null;
  ppn: string;
  titipke: string | null;
  ppnbatalmuat: string;
  grup: string | null;
  formatdeliveryreport: number | null;
  comodity: string | null;
  namashippercetak: string | null;
  formatcetak: number | null;
  marketing_id: number | null;
  marketing_text: string | null;
  blok: string | null;
  nomor: string | null;
  rt: string | null;
  rw: string | null;
  kelurahan: string | null;
  kabupaten: string | null;
  kecamatan: string | null;
  propinsi: string | null;
  isdpp10psn: string;
  usertracing: string | null;
  passwordtracing: string | null;
  kodeprospek: string;
  namashipperprospek: string;
  emaildelay: string | null;
  keterangan1barisinvoice: string | null;
  nik: string | null;
  namaparaf: string | null;
  saldopiutang: string;
  keteranganshipperjobminus: string | null;
  tglemailshipperjobminus: string | null;
  tgllahir: string;
  idshipperasal: string | null;
  shipperasal_text: string | null;
  initial: string | null;
  tipe: string | null;
  idtipe: number | null;
  idinitial: number | null;
  nshipperprospek: string | null;
  parentshipper_id: number | null;
  parentshipper_text: string | null;
  npwpnik: string | null;
  nitku: string | null;
  kodepajak: string | null;
  statusaktif: number;
  text: string | null;
  info: string | null;
  created_at: string;
  updated_at: string;
}

export interface IAllShipper {
  data: IShipper[];
  type: string;
  pagination: IMeta;
}

export const filterShipper = {
  nama: '',
  keterangan: '',
  contactperson: '',
  alamat: '',
  coa: '',
  coa_text: '',
  coapiutang: '',
  coapiutang_text: '',
  coahutang: '',
  coahutang_text: '',
  kota: '',
  kodepos: '',
  telp: '',
  email: '',
  fax: '',
  web: '',
  creditlimit: '',
  creditterm: '',
  credittermplus: '',
  npwp: '',
  coagiro: '',
  coagiro_text: '',
  ppn: '',
  titipke: '',
  ppnbatalmuat: '',
  grup: '',
  formatdeliveryreport: '',
  comodity: '',
  namashippercetak: '',
  formatcetak: '',
  marketing_id: '',
  marketing_text: '',
  blok: '',
  nomor: '',
  rt: '',
  rw: '',
  kelurahan: '',
  kabupaten: '',
  kecamatan: '',
  propinsi: '',
  isdpp10psn: '',
  usertracing: '',
  passwordtracing: '',
  kodeprospek: '',
  namashipperprospek: '',
  emaildelay: '',
  keterangan1barisinvoice: '',
  nik: '',
  namaparaf: '',
  saldopiutang: '',
  keteranganshipperjobminus: '',
  tglemailshipperjobminus: '',
  tgllahir: '',
  idshipperasal: '',
  shipperasal_text: '',
  initial: '',
  tipe: '',
  idtipe: '',
  idinitial: '',
  nshipperprospek: '',
  parentshipper_id: '',
  parentshipper_text: '',
  npwpnik: '',
  nitku: '',
  kodepajak: '',
  statusaktif: '',
  modifiedby: '',
  created_at: '',
  updated_at: '',
  statustidakasuransi_nama: '',
  asuransi_tas_nama: '',
  top_field_nama: '',
  open_field_nama: '',
  bongkaran_nama: '',
  delivery_report_nama: '',
  final_asuransi_bulan_nama: '',
  job_banyak_invoice_nama: '',
  job_pajak_nama: '',
  cetak_keterangan_shipper_nama: '',
  fumigasi_nama: '',
  adjust_tagih_warkat_nama: '',
  job_non_ppn_nama: '',
  approval_pajakp_pisah_ongkos_nama: '',
  decimal_invoice_nama: '',
  reimbursement_nama: '',
  not_invoice_tambahan_nama: '',
  invoice_jasa_pengurusan_transportasi_nama: '',
  not_ucase_shipper_nama: '',
  shipper_sttb_nama: '',
  shipper_cabang_nama: '',
  spk_nama: '',
  ppn_warkat_eksport_nama: '',
  ppn_11_nama: '',
  non_prospek_nama: '',
  info_delay_nama: '',
  job_minus_nama: '',
  shipper_sendiri_nama: '',
  wajib_invoice_sebelum_biaya_nama: '',
  tanpa_nik_npwp_nama: '',
  pusat_nama: '',
  app_saldo_piutang_nama: '',
  nama_paraf_nama: '',
  not_order_trucking_nama: '',
  passport_nama: '',
  ppn_kunci_nama: '',
  approval_shipper_job_minus_nama: '',
  approval_top_nama: '',
  blacklist_shipper_nama: '',
  non_lapor_pajak_nama: '',
  shipper_potongan_nama: '',
  shipper_tidak_tagih_invoice_utama_nama: '',
  not_tampil_web_nama: '',
  not_free_admin_nama: '',
  non_reimbursement_nama: '',
  app_cetak_invoice_lain_nama: '',
  lewat_hitung_ulang_ppn_nama: '',
  online_nama: '',
  keterangan_buruh_nama: '',
  edit_keterangan_invoice_utama_nama: '',
  tampil_keterangan_tambahan_sttb_nama: '',
  update_ppn_shiper_khusus_nama: '',
  shipper_rincian_nama: '',
  national_id_nama: '',
  refdesc_po_nama: ''
};
