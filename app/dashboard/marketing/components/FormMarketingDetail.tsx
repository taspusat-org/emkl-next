import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { IoMdClose } from 'react-icons/io';
import { Input } from '@/components/ui/input';
import { RootState } from '@/lib/store/store';
import { Button } from '@/components/ui/button';
import { FaRegSquarePlus } from 'react-icons/fa6';
import LookUp from '@/components/custom-ui/LookUp';
import { formatCurrency, parseCurrency } from '@/lib/utils';
import { FaSave, FaTimes, FaTrashAlt } from 'react-icons/fa';
import { useEffect, useMemo, useRef, useState } from 'react';
import InputCurrency from '@/components/custom-ui/InputCurrency';
import DataGrid, { Column, DataGridHandle } from 'react-data-grid';
import { MarketingDetail } from '@/lib/types/marketingheader.type';
import { setSubmitClicked } from '@/lib/store/lookupSlice/lookupSlice';
import { useGetMarketingDetail } from '@/lib/server/useMarketingHeader';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import FormLabel, {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form';

const FormMarketingDetail = ({
  forms,
  popOver,
  setPopOver,
  handleClose,
  onSubmit
}: any) => {
  const dispatch = useDispatch();
  const [dataGridKey, setDataGridKey] = useState(0);
  const [editingRowId, setEditingRowId] = useState<number | null>(null); // Menyimpan ID baris yang sedang diedit
  const [checkedRows, setCheckedRows] = useState<Set<number>>(new Set());
  const [editableValues, setEditableValues] = useState<Map<number, string>>(
    new Map()
  ); // Nilai yang sedang diedit untuk setiap baris
  const [rows, setRows] = useState<
    (MarketingDetail | (Partial<MarketingDetail> & { isNew: boolean }))[]
  >([]);

  const gridRef = useRef<DataGridHandle>(null);
  const formRef = useRef<HTMLFormElement | null>(null); // Ref untuk form
  const openName = useSelector((state: RootState) => state.lookup.openName);
  const detailData = useSelector((state: RootState) => state.header.detailData);
  const {
    data: allDataMarketingDetail,
    isLoading: isLoadingDataMarketingDetail,
    refetch: refetchMarketingDetail
  } = useGetMarketingDetail(detailData?.id ?? 0);

  const lookupPropsStatusAktif = [
    {
      columns: [{ key: 'text', name: 'NAMA' }],
      labelLookup: 'STATUS AKTIF LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'parameter?grp=status+aktif',
      label: 'STATUS AKTIF',
      singleColumn: true,
      pageSize: 20,
      postData: 'text',
      dataToPost: 'id'
    }
  ];

  const addRow = () => {
    const newRow: Partial<MarketingDetail> & { isNew: boolean } = {
      id: 0, // Placeholder ID
      nominalawal: '',
      nominalakhir: '',
      persentase: '',
      statusaktif: 0,
      statusaktif_nama: '',
      isNew: true
    };

    setRows((prevRows) => [
      ...prevRows.slice(0, prevRows.length - 1),
      newRow,
      prevRows[prevRows.length - 1]
    ]);
  };

  const deleteRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const inputStopPropagation = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };

  const handleInputChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setRows((prevRows) => {
      const updatedData = [...prevRows];

      updatedData[index][field] = value;

      if (
        updatedData[index].isNew &&
        Object.values(updatedData[index]).every((val) => val !== '')
      ) {
        updatedData[index].isNew = false;
      }

      return updatedData;
    });
  };

  const nominalawal = rows.reduce(
    (acc, row) =>
      acc + (row.nominalawal ? parseCurrency(String(row.nominalawal)) : 0),
    0
  );

  const nominalakhir = rows.reduce(
    (acc, row) =>
      acc + (row.nominalakhir ? parseCurrency(String(row.nominalakhir)) : 0),
    0
  );

  const persentase = rows.reduce(
    (acc, row) =>
      acc + (row.persentase ? parseCurrency(String(row.persentase)) : 0),
    0
  );

  const columns = useMemo((): Column<MarketingDetail>[] => {
    return [
      {
        key: 'aksi',
        name: 'aksi',
        headerCellClass: 'column-headers',
        cellClass: 'form-input',
        width: 65,
        renderHeaderCell: () => (
          <div className="flex h-full w-full cursor-pointer flex-col justify-center px-1">
            <p className="text-sm font-normal">aksi</p>
          </div>
        ),
        renderCell: (props: any) => {
          if (props.row.isAddRow) {
            // If this row is the "Add Row" row, display the Add Row button
            return (
              <div className="m-0 flex h-full w-full cursor-pointer items-center justify-center p-0 text-xs">
                <button
                  type="button"
                  className="items-center justify-center rounded bg-transparent text-[#076fde]"
                  onClick={addRow}
                >
                  <FaRegSquarePlus className="text-2xl" />
                </button>
              </div>
            );
          }

          // Otherwise, render the delete button for rows with data
          const rowIndex = rows.findIndex((row) => row.id === props.row.id);
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center justify-center p-0 text-xs">
              <button
                type="button"
                className="rounded bg-transparent text-xs text-red-500"
                onClick={() => deleteRow(rowIndex)}
              >
                <FaTrashAlt className="text-2xl" />
              </button>
            </div>
          );
        }
      },
      {
        key: 'nomor',
        name: 'NO',
        width: 50,
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        colSpan: (args) => {
          if (args.type === 'ROW' && args.row.isAddRow) {
            // If it's the "Add Row" row, span across multiple columns
            return 5; // Spanning the "Add Row" button across 3 columns (adjust as needed)
          }
          return undefined; // For other rows, no column spanning
        },
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full flex-col items-center gap-1">
            <div className="headers-cell h-[50%] items-center justify-center text-center">
              <p className="text-sm">No.</p>
            </div>

            <div className="flex h-[50%] w-full cursor-pointer items-center justify-center">
              <FaTimes className="bg-red-500 text-white" />
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="flex h-full w-full cursor-pointer items-center justify-center text-sm">
              {props.row.isAddRow ? '' : props.rowIdx + 1}
            </div>
          );
        }
      },
      {
        key: 'nominalawal',
        name: 'nominalawal',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 150,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm font-normal`}>Nominal Awal</p>
            </div>
            <div className="relative h-[50%] w-full px-1"></div>
          </div>
        ),
        renderCell: (props: any) => {
          const rowIdx = props.rowIdx;
          let raw = props.row.nominalawal ?? ''; // Nilai nominal awal

          if (typeof raw === 'number') {
            // Cek jika raw belum diformat dengan tanda koma, kemudian format
            raw = raw.toString(); // Mengonversi nominal menjadi string
          }

          // Jika raw tidak mengandung tanda koma, format sebagai currency
          if (!raw.includes(',')) {
            raw = formatCurrency(parseFloat(raw)); // Gunakan formatCurrency jika belum ada koma
          }

          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.isAddRow ? (
                <div className="flex h-full w-full cursor-pointer items-center justify-end text-sm font-bold">
                  {formatCurrency(nominalawal)}
                </div>
              ) : (
                <InputCurrency
                  value={String(raw)}
                  onValueChange={(value) =>
                    handleInputChange(rowIdx, 'nominalawal', value)
                  }
                />
              )}
            </div>
          );
        }
      },
      {
        key: 'nominalakhir',
        name: 'nominalakhir',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 150,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm font-normal`}>Nominal Akhir</p>
            </div>
            <div className="relative h-[50%] w-full px-1"></div>
          </div>
        ),
        renderCell: (props: any) => {
          const rowIdx = props.rowIdx;
          let raw = props.row.nominalakhir ?? ''; // Nilai nominal awal

          if (typeof raw === 'number') {
            // Cek jika raw belum diformat dengan tanda koma, kemudian format
            raw = raw.toString(); // Mengonversi nominal menjadi string
          }

          // Jika raw tidak mengandung tanda koma, format sebagai currency
          if (!raw.includes(',')) {
            raw = formatCurrency(parseFloat(raw)); // Gunakan formatCurrency jika belum ada koma
          }

          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.isAddRow ? (
                <div className="flex h-full w-full cursor-pointer items-center justify-end text-sm font-bold">
                  {formatCurrency(nominalakhir)}
                </div>
              ) : (
                <InputCurrency
                  value={String(raw)}
                  onValueChange={(value) =>
                    handleInputChange(rowIdx, 'nominalakhir', value)
                  }
                />
              )}
            </div>
          );
        }
      },
      {
        key: 'persentase',
        name: 'persentase',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 150,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm font-normal`}>Persentase</p>
            </div>
            <div className="relative h-[50%] w-full px-1"></div>
          </div>
        ),
        renderCell: (props: any) => {
          const rowIdx = props.rowIdx;
          let raw = props.row.persentase ?? ''; // Nilai nominal awal

          if (typeof raw === 'number') {
            // Cek jika raw belum diformat dengan tanda koma, kemudian format
            raw = raw.toString(); // Mengonversi nominal menjadi string
          }

          // Jika raw tidak mengandung tanda koma, format sebagai currency
          if (!raw.includes(',')) {
            raw = formatCurrency(parseFloat(raw)); // Gunakan formatCurrency jika belum ada koma
          }

          return (
            // <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
            //   {props.row.isAddRow ? (
            //     <div className="flex h-full w-full cursor-pointer items-center justify-end text-sm font-bold">
            //       {formatCurrency(persentase)}
            //     </div>
            //   ) : (
            //     <InputCurrency
            //       value={String(raw)}
            //       onValueChange={(value) => handleInputChange(rowIdx, 'persentase', value)}
            //     />
            //   )}
            // </div>

            <div>
              {props.row.isAddRow ? (
                <div className="flex h-full w-full cursor-pointer items-center justify-end text-sm font-bold">
                  {formatCurrency(persentase)}
                </div>
              ) : (
                <FormField
                  name="persentase"
                  control={forms.control}
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                      <div className="flex flex-col lg:w-full">
                        <FormControl>
                          <InputCurrency
                            value={String(raw)}
                            onValueChange={(value) =>
                              handleInputChange(rowIdx, 'persentase', value)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              )}
            </div>
          );
        }
      },
      {
        key: 'statusaktif',
        name: 'STATUSAKTIF',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 200,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm font-normal`}>STATUS AKTIF</p>
            </div>
            <div className="relative h-[50%] w-full px-1"></div>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.isAddRow
                ? ''
                : lookupPropsStatusAktif.map((statusaktifLookup, index) => (
                    <LookUp
                      key={index}
                      {...statusaktifLookup}
                      label={`STATUSAKTIF ${props.rowIdx}`} // Ensure you use row.id or rowIdx for unique labeling
                      lookupValue={(id) => {
                        handleInputChange(
                          props.rowIdx,
                          'statusaktif',
                          Number(id)
                        ); // Use props.rowIdx to get the correct index
                      }}
                      lookupNama={
                        props.row.statusaktif_nama
                          ? String(props.row.statusaktif_nama)
                          : undefined
                      }
                      inputLookupValue={Number(props.row.statusaktif)}
                    />
                  ))}
            </div>
          );
        }
      }
    ];
  }, [rows, checkedRows, editingRowId, editableValues]);

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
    const handleKeyDown = (event: KeyboardEvent) => {
      // Fungsi untuk menangani pergerakan fokus berdasarkan tombol
      if (openName) {
        // Jika popOverDate ada nilainya, jangan lakukan apa-apa
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
      const isImageDropzone =
        document.querySelector('input#image-dropzone') === focusedElement; // Cek apakah elemen yang difokuskan adalah dropzone
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

    const getNextFocusableElement = (
      // Fungsi untuk mendapatkan elemen input selanjutnya berdasarkan arah (down atau up)
      inputs: HTMLElement[],
      currentElement: HTMLElement,
      direction: 'up' | 'down'
    ): HTMLElement | null => {
      const index = Array.from(inputs).indexOf(currentElement as any);

      if (direction === 'down') {
        if (index === inputs.length - 1) {
          // Jika sudah di input terakhir, tidak perlu pindah fokus
          return null; // Tidak ada elemen selanjutnya
        }
        return inputs[index + 1]; // Fokus pindah ke input setelahnya
      } else {
        return inputs[index - 1]; // Fokus pindah ke input sebelumnya
      }
    };

    document.addEventListener('keydown', handleKeyDown); // Menambahkan event listener untuk keydown

    return () => {
      // Membersihkan event listener ketika komponen tidak lagi digunakan
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openName]); // Tambahkan popOverDate sebagai dependen

  useEffect(() => {
    if (detailData) {
      refetchMarketingDetail();
    }
  }, [detailData]);

  useEffect(() => {
    if (allDataMarketingDetail && popOver === true) {
      if (allDataMarketingDetail?.data?.length > 0) {
        // If there is data, add the data rows and the "Add Row" button row at the end
        const formattedRows = allDataMarketingDetail.data.map((item: any) => ({
          id: Number(item.id),
          nominalawal: String(item.nominalawal) ?? '',
          nominalakhir: String(item.nominalakhir) ?? '',
          persentase: String(item.persentase) ?? '',
          statusaktif: Number(item.statusaktif) ?? '',
          statusaktif_nama: item.statusaktif_nama ?? '',
          isNew: false
        }));

        setRows([
          // Always add the "Add Row" button row at the end
          ...formattedRows,
          { isAddRow: true, id: 'add_row', isNew: false }
        ]);
      } else {
        setRows([
          // If no data, add one editable row and the "Add Row" button row at the end
          {
            id: 0,
            nominalawal: '',
            nominalakhir: '',
            persentase: '',
            statusaktif: 0,
            statusaktif_nama: '',
            isNew: true
          },
          { isAddRow: true, id: 'add_row', isNew: false } // Row for the "Add Row" button
        ]);
      }
    }
  }, [popOver, allDataMarketingDetail, detailData?.id]);

  useEffect(() => {
    if (rows) {
      // Filter out the `isNew` field and any object with `id: "add_row"`
      const filteredRows = rows
        .filter((row) => row.id !== 'add_row') // Exclude rows with id "add_row"
        .map(({ isNew, ...rest }) => ({
          ...rest
        }));

      forms.setValue('marketingdetail', filteredRows);
    }
  }, [rows]);

  return (
    <Dialog open={popOver} onOpenChange={setPopOver}>
      <DialogTitle hidden={true}>Title</DialogTitle>
      <DialogContent className="flex h-full min-w-full flex-col overflow-hidden border bg-white">
        <div className="flex items-center justify-between bg-[#e0ecff] px-2 py-2">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            EDIT MARKETING DETAIL
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
          <div className="min-h-full bg-white px-5 py-3">
            <Form {...forms}>
              <form
                ref={formRef}
                onSubmit={onSubmit}
                className="flex h-full flex-col gap-6"
              >
                <div className="flex h-[100%] flex-col gap-2 lg:gap-3">
                  <FormField
                    name="marketing_nama"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel
                          required={true}
                          className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]"
                        >
                          MARKETING
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <Input
                              {...field}
                              disabled
                              value={field.value ?? ''}
                              type="text"
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="jenisprosesfee_nama"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel
                          required={true}
                          className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]"
                        >
                          JENIS PROSES FEE
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <Input
                              {...field}
                              disabled
                              value={field.value ?? ''}
                              type="text"
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="statuspotongbiayakantor_nama"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel
                          required={true}
                          className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]"
                        >
                          STATUS POTONG BIAYA
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <Input
                              {...field}
                              disabled
                              value={field.value ?? ''}
                              type="text"
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="statusaktif_nama"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel
                          required={true}
                          className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]"
                        >
                          STATUS AKTIF
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <Input
                              {...field}
                              disabled
                              value={field.value ?? ''}
                              type="text"
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="h-[400px] min-h-[400px]">
                    <div className="flex h-[100%] w-full flex-col rounded-sm border border-blue-500 bg-white">
                      <div
                        className="flex h-[38px] w-full flex-row items-center rounded-t-sm border-b border-blue-500 px-2"
                        style={{
                          background:
                            'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 100%)'
                        }}
                      ></div>

                      <DataGrid
                        key={dataGridKey}
                        ref={gridRef}
                        columns={columns as any[]}
                        defaultColumnOptions={{
                          sortable: true,
                          resizable: true
                        }}
                        rows={rows}
                        headerRowHeight={70}
                        rowHeight={55}
                        renderers={{ noRowsFallback: <EmptyRowsRenderer /> }}
                        className="rdg-light fill-grid text-sm"
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
                </div>
              </form>
            </Form>
          </div>
        </div>
        <div className="m-0 flex h-fit items-end gap-2 bg-zinc-200 px-3 py-2">
          <Button
            type="submit"
            // onClick={onSubmit}
            onClick={(e) => {
              e.preventDefault();
              onSubmit();
              dispatch(setSubmitClicked(true));
            }}
            className="flex w-fit items-center gap-1 text-sm"
          >
            <FaSave />
            <p className="text-center">SAVE</p>
          </Button>

          <Button
            type="button"
            variant="secondary"
            className="flex w-fit items-center gap-1 bg-zinc-500 text-sm text-white hover:bg-zinc-400"
            // onClick={handleClose}
            onClick={(e) => {
              handleClose();
              if (!allDataMarketingDetail) {
                setRows([
                  {
                    id: 0,
                    nominalawal: '',
                    nominalakhir: '',
                    persentase: '',
                    statusaktif: 0,
                    statusaktif_nama: '',
                    isNew: true
                  },
                  { isAddRow: true, id: 'add_row', isNew: false } // Row for the "Add Row" button
                ]);
              }
            }}
          >
            <IoMdClose /> <p className="text-center text-white">Cancel</p>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormMarketingDetail;
