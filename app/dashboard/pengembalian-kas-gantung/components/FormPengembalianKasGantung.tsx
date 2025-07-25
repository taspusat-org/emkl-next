/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useGetMenu } from '@/lib/server/useMenu';
import { Button } from '@/components/ui/button';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import LookUp from '@/components/custom-ui/LookUp';
import { Input } from '@/components/ui/input';
import { IoMdClose, IoMdRefresh } from 'react-icons/io';
import { FaSave, FaTimes } from 'react-icons/fa';
import InputMask from '@mona-health/react-input-mask';
import DataGrid, {
  CellKeyDownArgs,
  Column,
  DataGridHandle
} from 'react-data-grid';
import {
  formatDateCalendar,
  formatDateToDDMMYYYY,
  isLeapYear,
  parseDateFromDDMMYYYY
} from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { parse } from 'date-fns';
import { KasGantungHeader } from '@/lib/types/kasgantungheader.type';
import { useGetKasGantungHeader } from '@/lib/server/useKasGantungHeader';
import { Checkbox } from '@/components/ui/checkbox';
const FormPengembalianKasGantung = ({
  popOver,
  setPopOver,
  forms,
  onSubmit,
  mode,
  handleClose,
  isLoadingCreate,
  isLoadingUpdate,
  isLoadingDelete
}: any) => {
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [isReload, setIsReload] = useState<boolean>(false);
  const [popOverTglBukti, setPopOverTglBukti] = useState<boolean>(false);
  const [popOverTglDari, setPopOverTglDari] = useState<boolean>(false);
  const [popOverTglSampai, setPopOverTglSampai] = useState<boolean>(false);
  const [editingRowId, setEditingRowId] = useState<number | null>(null); // Menyimpan ID baris yang sedang diedit
  const [editableValues, setEditableValues] = useState<Map<number, string>>(
    new Map()
  ); // Nilai yang sedang diedit untuk setiap baris
  const [tglDari, setTglDari] = useState<string>('');
  const [tglSampai, setTglSampai] = useState<string>('');
  const [checkedRows, setCheckedRows] = useState<Set<number>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);

  const [dataGridKey, setDataGridKey] = useState(0);

  const gridRef = useRef<DataGridHandle>(null);
  const {
    data: allData,
    isLoading: isLoadingData,
    refetch
  } = useGetKasGantungHeader({
    filters: {
      tglDari: tglDari,
      tglSampai: tglSampai
    }
    // ...filters,
    // page: currentPage
  });
  const [rows, setRows] = useState<KasGantungHeader[]>([]);
  function handleCellClick(args: { row: KasGantungHeader }) {
    const clickedRow = args.row;
    const rowIndex = rows.findIndex((r) => r.id === clickedRow.id);
    if (rowIndex !== -1) {
      setSelectedRow(rowIndex);
    }
  }
  const handleRowSelect = (rowId: number) => {
    setCheckedRows((prev) => {
      const updated = new Set(prev);
      if (updated.has(rowId)) {
        updated.delete(rowId);
      } else {
        updated.add(rowId);
      }

      setIsAllSelected(updated.size === rows.length);
      return updated;
    });
  };
  const handleSelectAll = () => {
    if (isAllSelected) {
      setCheckedRows(new Set());
    } else {
      const allIds = rows.map((row) => row.id);
      setCheckedRows(new Set(allIds));
    }
    setIsAllSelected(!isAllSelected);
  };
  const handleDoubleClick = (rowId: number, value: string) => {
    if (checkedRows.has(rowId)) {
      setEditingRowId(rowId); // Set baris yang sedang diedit
      setEditableValues((prev) => new Map(prev).set(rowId, value)); // Set nilai yang sedang diedit
    }
  };

  // Fungsi untuk menangani perubahan input
  const handleChange = (
    rowId: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEditableValues((prev) => new Map(prev).set(rowId, e.target.value)); // Update nilai input
  };

  // Fungsi untuk menangani blur (keluar dari input)
  const handleBlur = (rowId: number) => {
    setEditingRowId(null); // Kembali ke tampilan setelah selesai mengedit
    const newEditableValues = new Map(editableValues);
    const newValue = newEditableValues.get(rowId);

    // Update rows dengan nilai yang telah diubah
    setRows((prevRows) =>
      prevRows.map(
        (row) =>
          row.id === rowId ? { ...row, nominal: String(newValue) } : row // Ganti nilai nominal dengan yang baru
      )
    );

    // Reset editableValues untuk baris yang telah selesai diedit
    setEditableValues((prev) => {
      const updated = new Map(prev);
      updated.delete(rowId);
      return updated;
    });
  };
  const columns = useMemo((): Column<KasGantungHeader>[] => {
    return [
      {
        key: 'nomor',
        name: 'NO',
        width: 50,
        resizable: true,
        draggable: true,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full flex-col items-center gap-1">
            <div className="headers-cell h-[50%] items-center justify-center text-center">
              <p className="text-sm font-normal">No.</p>
            </div>

            <div className="flex h-[50%] w-full cursor-pointer items-center justify-center">
              <FaTimes className="bg-red-500 text-white" />
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          const rowIndex = rows.findIndex((row) => row.id === props.row.id);
          return (
            <div className="flex h-full w-full cursor-pointer items-center justify-center text-sm">
              {rowIndex + 1}
            </div>
          );
        }
      },
      {
        key: 'select',
        name: '',
        width: 50,
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%]"></div>
            <div className="flex h-[50%] w-full items-center justify-center">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={() => handleSelectAll()}
                id="header-checkbox"
                className="mb-2"
              />
            </div>
          </div>
        ),
        renderCell: ({ row }: { row: KasGantungHeader }) => (
          <div className="flex h-full items-center justify-center">
            <Checkbox
              checked={checkedRows.has(row.id)}
              onCheckedChange={() => handleRowSelect(row.id)}
              id={`row-checkbox-${row.id}`}
            />
          </div>
        )
      },
      {
        key: 'nobukti',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 200,
        renderHeaderCell: () => (
          <div className="flex h-full w-full cursor-pointer flex-col justify-center px-2">
            <p className="text-sm font-normal">NOMOR BUKTI</p>
          </div>
        ),
        name: 'NOMOR BUKTI',
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.nobukti}
            </div>
          );
        }
      },
      {
        key: 'tglbukti',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div className="flex h-full w-full cursor-pointer flex-col justify-center px-2">
            <p className="text-sm font-normal">TGL BUKTI</p>
          </div>
        ),
        name: 'TGL BUKTI',
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.tglbukti}
            </div>
          );
        }
      },
      {
        key: 'nominal',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div className="flex h-full w-full cursor-pointer flex-col justify-center px-2">
            <p className="text-sm font-normal">Nominal</p>
          </div>
        ),
        name: 'nominal',
        renderCell: (props: any) => {
          const rowId = props.row.id;

          // Pengecekan apakah baris dalam mode edit dan baris ini dicentang
          const isEditing = rowId === editingRowId;
          const value = editableValues.get(rowId) || props.row.nominal;

          return (
            <div
              className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs"
              onDoubleClick={() => handleDoubleClick(rowId, props.row.nominal)} // Menambahkan event double click
            >
              {isEditing ? (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleChange(rowId, e)}
                  onBlur={() => handleBlur(rowId)} // Kembali ke tampilan setelah blur
                  className="w-full p-1 text-xs"
                  autoFocus
                />
              ) : (
                <span>{props.row.nominal}</span> // Menampilkan nilai jika tidak dalam mode edit
              )}
            </div>
          );
        }
      },

      {
        key: 'sisa',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div className="flex h-full w-full cursor-pointer flex-col justify-center px-2">
            <p className="text-sm font-normal">sisa</p>
          </div>
        ),
        name: 'sisa',
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.sisa}
            </div>
          );
        }
      },
      {
        key: 'keterangan',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        width: 150,
        renderHeaderCell: () => (
          <div className="flex h-full w-full cursor-pointer flex-col justify-center px-2">
            <p className="text-sm font-normal">KETERANGAN</p>
          </div>
        ),
        name: 'KETERANGAN',
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.keterangan}
            </div>
          );
        }
      }
    ];
  }, [rows, checkedRows, editingRowId, editableValues]);
  const lookUpProps = [
    {
      columns: [
        { key: 'method', name: 'METHOD' },
        { key: 'nama', name: 'NAMA' }
      ],
      // filterby: { class: 'system', method: 'get' },
      selectedRequired: false,
      endpoint: 'acos/get-all',
      label: 'ACOS',
      singleColumn: false,
      pageSize: 20,
      showOnButton: true,
      postData: 'nama'
    }
  ];
  const lookUpPropsMenu = [
    {
      columns: [{ key: 'title', name: 'Judul' }],
      // filterby: { class: 'system', method: 'get' },
      selectedRequired: false,
      endpoint: 'menu',
      label: 'MENU PARENT',
      singleColumn: true,
      pageSize: 20,
      showOnButton: true,
      postData: 'title'
    }
  ];
  const lookUpPropsStatusAktif = [
    {
      columns: [{ key: 'text', name: 'NAMA' }],
      // filterby: { class: 'system', method: 'get' },
      labelLookup: 'STATUS AKTIF LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'parameter?grp=status+aktif',
      label: 'status aktif',
      singleColumn: true,
      pageSize: 20,
      showOnButton: true,
      postData: 'text'
    }
  ];
  const formRef = useRef<HTMLFormElement | null>(null); // Ref untuk form
  const openName = useSelector((state: RootState) => state.lookup.openName);

  useEffect(() => {
    // Fungsi untuk menangani pergerakan fokus berdasarkan tombol
    const handleKeyDown = (event: KeyboardEvent) => {
      // Jika popOverDate ada nilainya, jangan lakukan apa-apa
      if (openName) {
        return;
      }

      const form = formRef.current;

      if (!form) return;

      const inputs = Array.from(
        form.querySelectorAll('input, select, textarea, button')
      ).filter(
        (element) =>
          element.id !== 'image-dropzone' &&
          element.tagName !== 'BUTTON' &&
          !element.hasAttribute('readonly') // Pengecualian jika input readonly
      ) as HTMLElement[]; // Ambil semua input dalam form kecuali button dan readonly inputs

      const focusedElement = document.activeElement as HTMLElement;

      // Cek apakah elemen yang difokuskan adalah dropzone
      const isImageDropzone =
        document.querySelector('input#image-dropzone') === focusedElement;
      const isFileInput =
        document.querySelector('input#file-input') === focusedElement;

      if (isImageDropzone || isFileInput) return; // Jangan pindah fokus jika elemen fokus adalah dropzone atau input file

      let nextElement: HTMLElement | null = null;

      if (event.key === 'ArrowDown' || event.key === 'Tab') {
        nextElement = getNextFocusableElement(inputs, focusedElement, 'down');
        if (event.key === 'Tab') {
          event.preventDefault(); // Cegah default tab behavior jika ingin mengontrol pergerakan fokus
        }
      } else if (
        event.key === 'ArrowUp' ||
        (event.shiftKey && event.key === 'Tab')
      ) {
        nextElement = getNextFocusableElement(inputs, focusedElement, 'up');
      }
      // Jika ditemukan input selanjutnya, pindahkan fokus
      if (nextElement) {
        nextElement.focus();
      }
    };

    // Fungsi untuk mendapatkan elemen input selanjutnya berdasarkan arah (down atau up)
    const getNextFocusableElement = (
      inputs: HTMLElement[],
      currentElement: HTMLElement,
      direction: 'up' | 'down'
    ): HTMLElement | null => {
      const index = Array.from(inputs).indexOf(currentElement as any);

      if (direction === 'down') {
        // Jika sudah di input terakhir, tidak perlu pindah fokus
        if (index === inputs.length - 1) {
          return null; // Tidak ada elemen selanjutnya
        }
        return inputs[index + 1]; // Fokus pindah ke input setelahnya
      } else {
        return inputs[index - 1]; // Fokus pindah ke input sebelumnya
      }
    };

    // Menambahkan event listener untuk keydown
    document.addEventListener('keydown', handleKeyDown);

    // Membersihkan event listener ketika komponen tidak lagi digunakan
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openName]); // Tambahkan popOverDate sebagai dependensi

  const onReload = () => {
    setIsReload(true);
    refetch();
  };
  const dateMask = [
    /[0-3]/, // D1
    /\d/, // D2
    '-',
    /[0-1]/, // M1
    /\d/, // M2
    '-',
    /\d/, // Y1
    /\d/, // Y2
    /\d/, // Y3
    /\d/ // Y4
  ];

  function EmptyRowsRenderer() {
    return (
      <div
        className="flex h-fit w-full items-center justify-center border border-l-0 border-t-0 border-blue-500 py-1"
        style={{ textAlign: 'center', gridColumn: '1/-1' }}
      >
        <p className="text-gray-400">NO ROWS DATA FOUND</p>
      </div>
    );
  }
  useEffect(() => {
    // Hanya mengupdate rows jika isReload bernilai true
    if (isReload && allData) {
      const newRows =
        allData?.data.map((row: KasGantungHeader) => ({
          ...row,
          nominal: row.nominal ?? '' // Jika nominal tidak ada, set default ke ""
        })) || [];
      setRows(newRows);
      setIsReload(false); // Setelah data di-set, set kembali isReload ke false
    }
  }, [allData, isReload]);

  useEffect(() => {
    const currentDate = new Date(); // Dapatkan tanggal sekarang
    const formattedDate = formatDateToDDMMYYYY(currentDate); // Format ke DD-MM-YYYY
    setTglDari(formattedDate); // Set nilai tglDari
    setTglSampai(formattedDate); // Set nilai tglSampai
    forms.setValue('tglbukti', formattedDate); // Set nilai tglbukti di form
  }, [forms]); // Empty dependency array memastikan ini hanya dijalankan sekali saat komponen dimuat
  return (
    <Dialog open={popOver} onOpenChange={setPopOver}>
      <DialogTitle hidden={true}>Title</DialogTitle>
      <DialogContent className="flex h-full min-w-full flex-col overflow-hidden border bg-white">
        <div className="flex items-center justify-between bg-[#e0ecff] px-2 py-2">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Menu Form
          </h2>
          <div
            className="cursor-pointer rounded-md border border-zinc-200 bg-red-500 p-0 hover:bg-red-400"
            onClick={() => {
              setPopOver(false);
              handleClose();
            }}
          >
            <IoMdClose className="h-5 w-5 font-bold text-white" />
          </div>
        </div>
        <div className="h-full flex-1 overflow-y-auto bg-zinc-200 pl-1 pr-2">
          <div className=" bg-white px-5 py-3">
            <Form {...forms}>
              <form
                ref={formRef}
                onSubmit={onSubmit}
                className="flex h-full flex-col gap-6"
              >
                <div className="flex h-[100%] flex-col gap-2 lg:gap-3">
                  <div className="flex flex-row">
                    <FormField
                      name="nobukti"
                      control={forms.control}
                      render={({ field }) => (
                        <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                          <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[30%]">
                            NO BUKTI
                          </FormLabel>
                          <div className="flex flex-col lg:w-[70%]">
                            <FormControl>
                              <Input
                                {...field}
                                disabled
                                value={field.value ?? ''}
                                type="text"
                                readOnly={mode === 'view' || mode === 'delete'}
                              />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="tglbukti"
                      control={forms.control}
                      render={({ field }) => (
                        <FormItem className="flex w-full flex-col justify-between lg:ml-4 lg:flex-row lg:items-center">
                          <FormLabel
                            required={true}
                            className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[30%]"
                          >
                            TGL BUKTI
                          </FormLabel>
                          <div className="flex flex-col lg:w-[70%]">
                            <FormControl>
                              <div
                                className={`relative flex flex-row rounded-sm border border-zinc-300 focus:outline-none focus:ring-0 ${
                                  mode === 'delete'
                                    ? 'text-zinc-400'
                                    : 'text-zinc-600'
                                } focus-within:border-blue-500`} // Menggunakan focus-within
                              >
                                <InputMask
                                  mask={dateMask}
                                  {...field}
                                  className={`h-9 w-full rounded-sm px-3 py-2 text-sm text-zinc-900 focus:bg-[#ffffee] focus:outline-none focus:ring-0`}
                                  // maskChar="dmy"
                                  // maskChar={null} // Tidak menampilkan karakter mask saat input kosong
                                  maskPlaceholder="DD-MM-YYYY"
                                  placeholder="DD-MM-YYYY"
                                  value={field.value ?? ''}
                                  alwaysShowMask={true}
                                  beforeMaskedStateChange={({
                                    previousState,
                                    currentState,
                                    nextState
                                  }: {
                                    previousState: any;
                                    currentState: any;
                                    nextState: any;
                                  }) => {
                                    const nextVal = nextState.value || '';
                                    const parts = nextVal.split('-');

                                    // Validasi jika format sudah memenuhi "dd-02-YYYY" atau "31-MM-YYYY"
                                    if (
                                      parts.length === 3 &&
                                      parts[0] !== 'DD' &&
                                      parts[1] !== 'MM' &&
                                      /^\d{2}$/.test(parts[0]) && // Validasi hari, 2 digit
                                      /^\d{2}$/.test(parts[1]) // Validasi bulan, 2 digit
                                    ) {
                                      const day = Number(parts[0]);
                                      let month = parts[1]; // Jangan mengubah bulan langsung ke angka dulu
                                      const year = Number(parts[2]);

                                      const dayNum = Number(day);
                                      const monthNum = Number(month);

                                      if (dayNum === 31) {
                                        const monthsWith31Days = [
                                          '01',
                                          '03',
                                          '05',
                                          '07',
                                          '08',
                                          '10',
                                          '12'
                                        ]; // Bulan dengan 31 hari
                                        if (!monthsWith31Days.includes(month)) {
                                          return {
                                            value: previousState.value,
                                            selection: previousState.selection
                                          };
                                        }
                                      }

                                      if (
                                        parts[0] === '29' &&
                                        parts[1] === '02' &&
                                        /^\d{4}$/.test(parts[2])
                                      ) {
                                        const yearNum = Number(parts[2]);

                                        if (!isLeapYear(yearNum)) {
                                          return {
                                            value: previousState.value,
                                            selection: previousState.selection
                                          };
                                        }
                                      }
                                    }
                                    return {
                                      value: nextState.value,
                                      selection: nextState.selection
                                    };
                                  }}
                                ></InputMask>

                                <Popover
                                  open={popOverTglBukti}
                                  onOpenChange={setPopOverTglBukti}
                                >
                                  <PopoverTrigger asChild>
                                    <button
                                      type="button"
                                      className="flex w-9 cursor-pointer items-center justify-center border border-[#adcdff] bg-[#e0ecff] text-[#0e2d5f]"
                                    >
                                      <CalendarIcon className="h-4 w-4 text-gray-500" />
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="right-4 w-fit max-w-xs border border-blue-500 bg-white"
                                    style={{ position: 'fixed' }}
                                    sideOffset={-1}
                                  >
                                    <Calendar
                                      mode="single"
                                      captionLayout="dropdown-buttons"
                                      fromYear={1960}
                                      toYear={2030}
                                      // initialFocus
                                      defaultMonth={
                                        field.value &&
                                        field.value !== 'DD-MM-YYYY'
                                          ? parse(
                                              field.value,
                                              'dd-MM-yyyy',
                                              new Date()
                                            )
                                          : new Date()
                                      }
                                      selected={
                                        field.value
                                          ? parseDateFromDDMMYYYY(field.value)
                                          : undefined
                                      } // Memastikan format yang dipilih sesuai dengan input
                                      onSelect={(value: any) => {
                                        if (value) {
                                          const formattedDate =
                                            formatDateCalendar(value);
                                          field.onChange(formattedDate); // Memastikan format yang dikirim yyyy-mm-dd
                                          setPopOverTglBukti(false);
                                        }
                                      }}
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    name="keterangan"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          KETERANGAN
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ''}
                              type="text"
                              readOnly={mode === 'view' || mode === 'delete'}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <div className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                    <div className="w-full lg:w-[15%]">
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        RELASI
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookUpProps.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(id) =>
                            forms.setValue('relasi_id', Number(id))
                          }
                          inputLookupValue={forms.getValues('relasi_id')}
                          lookupNama={forms.getValues('relasi_nama')}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex w-full flex-row gap-4">
                    <div className="flex w-full flex-row items-center">
                      <FormLabel
                        required={true}
                        className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[30%]"
                      >
                        TGL DARI
                      </FormLabel>
                      <div className="flex flex-col lg:w-[70%]">
                        <div
                          className={`relative flex flex-row rounded-sm border border-zinc-300 focus:outline-none focus:ring-0 ${
                            mode === 'delete'
                              ? 'text-zinc-400'
                              : 'text-zinc-600'
                          } focus-within:border-blue-500`}
                        >
                          <InputMask
                            mask="99-99-9999" // Set date mask (DD-MM-YYYY format)
                            className="h-9 w-full rounded-sm px-3 py-2 text-sm text-zinc-900 focus:bg-[#ffffee] focus:outline-none focus:ring-0"
                            value={tglDari} // Bind the value to tglDari
                            alwaysShowMask={true}
                            maskPlaceholder="DD-MM-YYYY"
                            placeholder="DD-MM-YYYY"
                            onChange={(e: any) => setTglDari(e.target.value)} // Update tglDari when the input changes
                          />

                          <Popover
                            open={popOverTglDari}
                            onOpenChange={setPopOverTglDari}
                          >
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className="flex w-9 cursor-pointer items-center justify-center border border-[#adcdff] bg-[#e0ecff] text-[#0e2d5f]"
                              >
                                <CalendarIcon className="h-4 w-4 text-gray-500" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="right-4 w-fit max-w-xs border border-blue-500 bg-white"
                              style={{ position: 'fixed' }}
                              sideOffset={-1}
                            >
                              <Calendar
                                mode="single"
                                captionLayout="dropdown-buttons"
                                fromYear={1960}
                                toYear={2030}
                                defaultMonth={
                                  tglDari && tglDari !== 'DD-MM-YYYY'
                                    ? parse(tglDari, 'dd-MM-yyyy', new Date())
                                    : new Date()
                                }
                                selected={
                                  tglDari
                                    ? parseDateFromDDMMYYYY(tglDari)
                                    : undefined
                                }
                                onSelect={(value: any) => {
                                  if (value) {
                                    const formattedDate =
                                      formatDateCalendar(value); // Format the selected date to string
                                    setTglDari(formattedDate); // Update the tglDari state with the formatted date
                                    setPopOverTglDari(false); // Close the popover
                                  }
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full flex-row items-center lg:ml-4">
                      <FormLabel
                        required={true}
                        className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[30%]"
                      >
                        SAMPAI TGL
                      </FormLabel>
                      <div className="flex flex-col lg:w-[70%]">
                        <div
                          className={`relative flex flex-row rounded-sm border border-zinc-300 focus:outline-none focus:ring-0 ${
                            mode === 'delete'
                              ? 'text-zinc-400'
                              : 'text-zinc-600'
                          } focus-within:border-blue-500`}
                        >
                          <InputMask
                            mask="99-99-9999" // Set date mask (DD-MM-YYYY format)
                            className="h-9 w-full rounded-sm px-3 py-2 text-sm text-zinc-900 focus:bg-[#ffffee] focus:outline-none focus:ring-0"
                            value={tglSampai} // Bind the value to tglSampai
                            alwaysShowMask={true}
                            maskPlaceholder="DD-MM-YYYY"
                            placeholder="DD-MM-YYYY"
                            onChange={(e: any) => setTglSampai(e.target.value)} // Update tglSampai when the input changes
                          />

                          <Popover
                            open={popOverTglSampai}
                            onOpenChange={setPopOverTglSampai}
                          >
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className="flex w-9 cursor-pointer items-center justify-center border border-[#adcdff] bg-[#e0ecff] text-[#0e2d5f]"
                              >
                                <CalendarIcon className="h-4 w-4 text-gray-500" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="right-4 w-fit max-w-xs border border-blue-500 bg-white"
                              style={{ position: 'fixed' }}
                              sideOffset={-1}
                            >
                              <Calendar
                                mode="single"
                                captionLayout="dropdown-buttons"
                                fromYear={1960}
                                toYear={2030}
                                defaultMonth={
                                  tglSampai && tglSampai !== 'DD-MM-YYYY'
                                    ? parse(tglSampai, 'dd-MM-yyyy', new Date())
                                    : new Date()
                                }
                                selected={
                                  tglSampai
                                    ? parseDateFromDDMMYYYY(tglSampai)
                                    : undefined
                                }
                                onSelect={(value: any) => {
                                  if (value) {
                                    const formattedDate =
                                      formatDateCalendar(value); // Format the selected date to string
                                    setTglSampai(formattedDate); // Update the tglDari state with the formatted date
                                    setPopOverTglSampai(false); // Close the popover
                                  }
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="default"
                    type="button"
                    className="mt-2 flex w-fit flex-row items-center justify-center px-4"
                    onClick={onReload}
                  >
                    <IoMdRefresh />
                    <p style={{ fontSize: 12 }} className="font-normal">
                      Reload
                    </p>
                  </Button>
                  <div className="border-gray flex w-full flex-col gap-4 border border-gray-300 px-2 py-3">
                    <p className="text-sm text-black">POSTING PENERIMAAN</p>
                    <div className="flex w-full flex-col lg:flex-row lg:items-center">
                      <div className="w-full lg:w-[15%]">
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          RELASI
                        </FormLabel>
                      </div>
                      <div className="w-full lg:w-[35%]">
                        {lookUpProps.map((props, index) => (
                          <LookUp
                            key={index}
                            {...props}
                            lookupValue={(id) =>
                              forms.setValue('relasi_id', Number(id))
                            }
                            inputLookupValue={forms.getValues('relasi_id')}
                            lookupNama={forms.getValues('relasi_nama')}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <FormField
                        name="nobukti"
                        control={forms.control}
                        render={({ field }) => (
                          <FormItem className="flex w-full flex-col lg:flex-row lg:items-center">
                            <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                              NO BUKTI KAS GANTUNG
                            </FormLabel>
                            <div className="flex flex-col lg:w-[35%]">
                              <FormControl>
                                <Input
                                  disabled
                                  value=""
                                  type="text"
                                  readOnly={
                                    mode === 'view' || mode === 'delete'
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex h-[100%] w-full flex-col border border-blue-500 bg-white">
                    <DataGrid
                      key={dataGridKey}
                      ref={gridRef}
                      columns={columns}
                      onCellClick={handleCellClick}
                      rows={rows}
                      onSelectedCellChange={(args) => {
                        handleCellClick({ row: args.row });
                      }}
                      headerRowHeight={null}
                      rowHeight={30}
                      renderers={{ noRowsFallback: <EmptyRowsRenderer /> }}
                      className="rdg-light fill-grid text-xs"
                    />
                    <div
                      className="flex flex-row justify-between border border-x-0 border-b-0 border-blue-500 p-2"
                      style={{
                        background:
                          'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 100%)'
                      }}
                    ></div>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
        <div className="m-0 flex h-fit items-end gap-2 bg-zinc-200 px-3 py-2">
          <Button
            type="submit"
            onClick={onSubmit}
            disabled={mode === 'view'}
            className="flex w-fit items-center gap-1 text-sm"
            loading={isLoadingCreate || isLoadingUpdate || isLoadingDelete}
          >
            <FaSave />
            <p className="text-center">
              {mode === 'delete' ? 'DELETE' : 'SAVE'}
            </p>
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="flex w-fit items-center gap-1 bg-zinc-500 text-sm text-white hover:bg-zinc-400"
            onClick={handleClose}
          >
            <IoMdClose /> <p className="text-center text-white">Cancel</p>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormPengembalianKasGantung;
