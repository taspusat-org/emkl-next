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
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store/store';
import LookUp from '@/components/custom-ui/LookUp';
import { Input } from '@/components/ui/input';
import { IoMdClose, IoMdRefresh } from 'react-icons/io';
import { FaSave, FaTimes, FaTrashAlt } from 'react-icons/fa';
import InputMask from '@mona-health/react-input-mask';
import { useFormContext } from 'react-hook-form';
import DataGrid, {
  CellKeyDownArgs,
  Column,
  DataGridHandle
} from 'react-data-grid';
import {
  formatCurrency,
  formatDateCalendar,
  formatDateToDDMMYYYY,
  isLeapYear,
  parseCurrency,
  parseDateFromDDMMYYYY
} from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Search } from 'lucide-react';
import { parse } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import InputDatePicker from '@/components/custom-ui/InputDatePicker';
import { PengeluaranDetail } from '@/lib/types/pengeluaran.type';
import { FaRegSquarePlus } from 'react-icons/fa6';
import { Textarea } from '@/components/ui/textarea';
import { useGetPengeluaranDetail } from '@/lib/server/usePengeluaran';
import InputCurrency from '@/components/custom-ui/InputCurrency';
import {
  setOpenName,
  setOpenNameModal,
  setSubmitClicked
} from '@/lib/store/lookupSlice/lookupSlice';
import { MdAddBox } from 'react-icons/md';
import LookUpModal from '@/components/custom-ui/LookUpModal';
import LookUpModalPengeluaran from '@/components/custom-ui/LookUpModalPengeluaran';
const FormPengeluaran = ({
  popOver,
  setPopOver,
  forms,
  onSubmit,
  mode,
  handleClose,
  isLoadingCreate,
  isLoadingUpdate,
  submitSuccessful,
  isLoadingDelete
}: any) => {
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [popOverTglSampai, setPopOverTglSampai] = useState<boolean>(false);
  const [editingRowId, setEditingRowId] = useState<number | null>(null); // Menyimpan ID baris yang sedang diedit
  const [editableValues, setEditableValues] = useState<Map<number, string>>(
    new Map()
  ); // Nilai yang sedang diedit untuk setiap baris
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [checkedRows, setCheckedRows] = useState<Set<number>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);

  const [dataGridKey, setDataGridKey] = useState(0);
  const dispatch = useDispatch();
  const [filters, setFilters] = useState({
    nobukti: '',
    keterangan: '',
    sisa: '',
    nominal: ''
  });
  const headerData = useSelector((state: RootState) => state.header.headerData);
  const gridRef = useRef<DataGridHandle>(null);
  const {
    data: allData,
    isLoading: isLoadingData,
    refetch
  } = useGetPengeluaranDetail({
    filters: { nobukti: headerData?.nobukti ?? {} }
  });

  const [rows, setRows] = useState<
    (PengeluaranDetail | (Partial<PengeluaranDetail> & { isNew: boolean }))[]
  >([]);
  function handleCellClick(args: { row: PengeluaranDetail }) {
    const clickedRow = args.row;
    const rowIndex = rows.findIndex((r) => r.id === clickedRow.id);
    if (rowIndex !== -1) {
      setSelectedRow(rowIndex);
    }
  }
  const addRow = () => {
    const newRow: Partial<PengeluaranDetail> & { isNew: boolean } = {
      id: 0, // Placeholder ID
      coadebet: '',
      coadebet_text: '',
      keterangan: '',
      nominal: '',
      dpp: '',
      noinvoiceemkl: '',
      nofakturpajakemkl: '',
      perioderefund: '',
      disableNominal: false,
      disableDpp: false,
      isNew: true
    };

    setRows((prevRows) => [
      ...prevRows.slice(0, prevRows.length - 1),
      newRow,
      prevRows[prevRows.length - 1]
    ]);
  };

  const resetDetailAndAddNewRow = () => {
    setRows([
      {
        id: 0,
        coadebet: '',
        coadebet_text: '',
        keterangan: '',
        nominal: '',
        dpp: '',
        noinvoiceemkl: '',
        tglinvoiceemkl: '',
        nofakturpajakemkl: '',
        perioderefund: '',
        isNew: true
      },
      { isAddRow: true, id: 'add_row', isNew: false }
    ]);

    forms.setValue('details', [
      {
        id: 0,
        coadebet: '',
        coadebet_text: '',
        keterangan: '',
        nominal: '',
        dpp: '',
        noinvoiceemkl: '',
        tglinvoiceemkl: '',
        nofakturpajakemkl: '',
        perioderefund: '',
        text: ''
      }
    ]);

    setDataGridKey((prev) => prev + 1);
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
  const deleteRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };
  const inputStopPropagation = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };
  const formatThousands = (raw: string): string => {
    // ambil cuma digit
    const digits = raw.replace(/\D/g, '');
    if (!digits) return '';
    // parse integer, lalu format otomatis dengan koma (en-US)
    return parseInt(digits, 10).toLocaleString('en-US');
  };
  const beforeMaskedStateChange = ({
    previousState,
    currentState,
    nextState
  }: {
    previousState: { value: string; selection: any };
    currentState: { value: string; selection: any };
    nextState: { value: string; selection: any };
  }) => {
    const nextVal = nextState.value || '';
    // a) ambil hanya digit & titik
    const raw = nextVal.replace(/[^0-9.]/g, '');
    // b) split integer & decimal (hanya 1 dot pertama)
    const [intPart, ...rest] = raw.split('.');
    const decPart = rest.join(''); // kalau user ngetik lebih dari 1 dot, kita gabung sisanya

    // c) format integer part dengan koma sebagai ribuan
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // d) kalau ada decimal part, re‐attach
    const formatted =
      decPart.length > 0 ? `${formattedInt}.${decPart}` : formattedInt;

    // e) cursor selalu di akhir
    const pos = formatted.length;
    return {
      value: formatted,
      selection: { start: pos, end: pos }
    };
  };

  const totalNominal = rows.reduce(
    (acc, row) => acc + (row.nominal ? parseCurrency(row.nominal) : 0),
    0
  );

  const totalDpp = rows.reduce(
    (acc, row) => acc + (row.dpp ? parseCurrency(row.dpp) : 0),
    0
  );

  const PERSENTASE = 2 / 100;

  const handleNominalChange = (rowIdx: number, value: string) => {
    if (Number(value) > 0) {
      setRows((prev) => {
        const updated = [...prev];
        const current = updated[rowIdx];

        const parsedValue = parseCurrency(value);

        current.nominal = value;
        current.dpp = '0';

        if (parsedValue === 0 && parseCurrency(current.dpp) === 0) {
          current.disableNominal = false;
          current.disableDpp = false;
        } else {
          current.disableNominal = false;
          current.disableDpp = true;
        }

        return updated;
      });
    }
  };

  const handleDppChange = (rowIdx: number, value: string) => {
    if (Number(value) > 0) {
      setRows((prev) => {
        const updated = [...prev];
        const current = updated[rowIdx];

        const parsedDpp = parseCurrency(value);

        current.dpp = value;

        const nominalValue = parsedDpp * PERSENTASE;
        current.nominal = formatCurrency(nominalValue);

        if (parsedDpp === 0 && parseCurrency(current.nominal) === 0) {
          current.disableNominal = false;
          current.disableDpp = false;
        } else {
          current.disableNominal = true;
          current.disableDpp = false;
        }

        return updated;
      });
    }
  };

  const columns = useMemo((): Column<PengeluaranDetail>[] => {
    return [
      {
        key: 'aksi',
        cellClass: 'form-input',
        width: 65,
        renderHeaderCell: () => (
          <div className="flex h-full w-full flex-col justify-center px-1">
            <p className="text-center text-sm font-normal">aksi</p>
          </div>
        ),
        name: 'aksi',

        renderCell: (props: any) => {
          // If this row is the "Add Row" row, display the Add Row button

          if (props.row.isAddRow) {
            return (
              <div className="m-0 flex h-fit w-full cursor-pointer items-center justify-center p-0 text-xs">
                <button
                  disabled={mode === 'view' || mode === 'delete'}
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
                disabled={
                  mode === 'view' || mode === 'delete' || rows.length <= 2
                }
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
          // If it's the "Add Row" row, span across multiple columns
          if (args.type === 'ROW' && args.row.isAddRow) {
            return 3; // Spanning the "Add Row" button across 3 columns (adjust as needed)
          }
          return undefined; // For other rows, no column spanning
        },
        renderHeaderCell: () => (
          <div className="flex h-[100%] w-full flex-col justify-center">
            <p className={`text-left text-sm font-normal`}>No.</p>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="flex h-full w-full cursor-pointer items-center justify-center text-sm font-normal">
              {props.row.isAddRow ? 'TOTAL :' : props.rowIdx + 1}
            </div>
          );
        }
      },
      {
        key: 'coadebet',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 350,
        renderHeaderCell: () => (
          <div className="flex h-[100%] w-full flex-col justify-center">
            <p className={`text-left text-sm font-normal`}>Coa Debet</p>
          </div>
        ),
        name: 'coadebet',
        renderCell: (props: any) => {
          const rowIdx = props.rowIdx;
          console.log('rowIdx', rowIdx);
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {lookUpPropsCoaDebet.map((props, index) => (
                <LookUp
                  label={`COA DEBET ${rowIdx + 1}`}
                  key={index}
                  {...props}
                  lookupValue={(value: any) =>
                    handleInputChange(rowIdx, 'coadebet', value)
                  }
                  lookupNama={forms.getValues(
                    `details[${rowIdx}].coadebet_text`
                  )}
                  onSelectRow={(value) => {
                    handleInputChange(
                      rowIdx,
                      'coadebet_text',
                      value.keterangancoa
                    );
                  }}
                  disabled={mode === 'view' || mode === 'delete'}
                />
              ))}
            </div>
          );
        }
      },
      {
        key: 'keterangan',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 400,
        renderHeaderCell: () => (
          <div className="flex h-[100%] w-full flex-col justify-center">
            <p className={`text-left text-sm font-normal`}>Keterangan</p>
          </div>
        ),
        name: 'KETERANGAN',
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.isAddRow ? (
                ''
              ) : (
                <Input
                  type="text"
                  disabled={mode === 'view' || mode === 'delete'}
                  value={props.row.keterangan}
                  onKeyDown={inputStopPropagation}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    handleInputChange(
                      props.rowIdx,
                      'keterangan',
                      e.target.value
                    )
                  }
                  className="h-2 min-h-9 w-full rounded border border-gray-300"
                />
              )}
            </div>
          );
        }
      },
      {
        key: 'dpp',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 200,
        renderHeaderCell: () => (
          <div className="flex h-[100%] w-full flex-col justify-center">
            <p className={`text-left text-sm font-normal`}>Dpp</p>
          </div>
        ),
        name: 'dpp',
        renderCell: (props: any) => {
          const rowIdx = props.rowIdx;
          let raw = props.row.dpp ?? ''; // Nilai dpp awal

          // Cek jika raw belum diformat dengan tanda koma, kemudian format
          if (typeof raw === 'number') {
            raw = raw.toString(); // Mengonversi dpp menjadi string
          }

          // Jika raw tidak mengandung tanda koma, format sebagai currency
          if (!raw.includes(',')) {
            raw = formatCurrency(parseFloat(raw)); // Gunakan formatCurrency jika belum ada koma
          }

          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.isAddRow ? (
                <div className="flex h-full w-full cursor-pointer items-center justify-end text-sm font-bold">
                  {formatCurrency(totalDpp)}
                </div>
              ) : (
                <FormField
                  name={`details.${rowIdx}.dpp`}
                  control={forms.control}
                  render={({ field }) => (
                    <FormItem className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
                      <div className="flex w-full flex-col">
                        <FormControl>
                          <InputCurrency
                            {...field}
                            readOnly={mode === 'view' || mode === 'delete'}
                            disabled={props.row.disableDpp}
                            value={String(props.row.dpp ?? '')}
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleDppChange(rowIdx, value);
                            }}
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
        key: 'nominal',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 200,
        renderHeaderCell: () => (
          <div className="flex h-[100%] w-full flex-col justify-center">
            <p className={`text-left text-sm font-normal`}>Nominal</p>
          </div>
        ),
        name: 'nominal',
        renderCell: (props: any) => {
          const rowIdx = props.rowIdx;
          let raw = props.row.nominal ?? ''; // Nilai nominal awal

          // Cek jika raw belum diformat dengan tanda koma, kemudian format
          if (typeof raw === 'number') {
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
                  {formatCurrency(totalNominal)}
                </div>
              ) : (
                <FormField
                  name={`details.${rowIdx}.nominal`}
                  control={forms.control}
                  render={({ field }) => (
                    <FormItem className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
                      <div className="flex w-full flex-col">
                        <FormControl>
                          <InputCurrency
                            {...field}
                            readOnly={mode === 'view' || mode === 'delete'}
                            disabled={props.row.disableNominal}
                            value={String(props.row.nominal ?? '')}
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleNominalChange(rowIdx, value);
                            }}
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
        key: 'noinvoiceemkl',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 160,
        colSpan: (args) => {
          // If it's the "Add Row" row, span across multiple columns
          if (args.type === 'ROW' && args.row.isAddRow) {
            return 4; // Spanning the "Add Row" button across 3 columns (adjust as needed)
          }
          return undefined; // For other rows, no column spanning
        },
        renderHeaderCell: () => (
          <div className="flex h-[100%] w-full flex-col justify-center">
            <p className={`text-left text-sm font-normal`}>
              nomor invoice emkl
            </p>
          </div>
        ),
        name: 'noinvoiceemkl',
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.isAddRow ? (
                ''
              ) : (
                <Input
                  type="text"
                  disabled={mode === 'view' || mode === 'delete'}
                  value={props.row.noinvoiceemkl}
                  onKeyDown={inputStopPropagation}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    handleInputChange(
                      props.rowIdx,
                      'noinvoiceemkl',
                      e.target.value
                    )
                  }
                  className="h-2 min-h-9 w-full rounded border border-gray-300"
                />
              )}
            </div>
          );
        }
      },
      {
        key: 'transaksibiaya_nobukti',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 160,
        colSpan: (args) => {
          // If it's the "Add Row" row, span across multiple columns
          if (args.type === 'ROW' && args.row.isAddRow) {
            return 4; // Spanning the "Add Row" button across 3 columns (adjust as needed)
          }
          return undefined; // For other rows, no column spanning
        },
        renderHeaderCell: () => (
          <div className="flex h-[100%] w-full flex-col justify-center">
            <p className={`text-left text-sm font-normal`}>
              nomor transaksi biaya
            </p>
          </div>
        ),
        name: 'transaksibiaya_nobukti',
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.isAddRow ? (
                ''
              ) : (
                <Input
                  type="text"
                  disabled
                  value={props.row.transaksibiaya_nobukti}
                  onKeyDown={inputStopPropagation}
                  onClick={(e) => e.stopPropagation()}
                  className="h-2 min-h-9 w-full rounded border border-gray-300"
                />
              )}
            </div>
          );
        }
      },
      {
        key: 'transaksilain_nobukti',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 160,
        colSpan: (args) => {
          // If it's the "Add Row" row, span across multiple columns
          if (args.type === 'ROW' && args.row.isAddRow) {
            return 4; // Spanning the "Add Row" button across 3 columns (adjust as needed)
          }
          return undefined; // For other rows, no column spanning
        },
        renderHeaderCell: () => (
          <div className="flex h-[100%] w-full flex-col justify-center">
            <p className={`text-left text-sm font-normal`}>
              nomor transaksi lain
            </p>
          </div>
        ),
        name: 'transaksilain_nobukti',
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.isAddRow ? (
                ''
              ) : (
                <Input
                  type="text"
                  disabled
                  value={props.row.transaksilain_nobukti}
                  onKeyDown={inputStopPropagation}
                  onClick={(e) => e.stopPropagation()}
                  className="h-2 min-h-9 w-full rounded border border-gray-300"
                />
              )}
            </div>
          );
        }
      },
      {
        key: 'tglinvoiceemkl',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 170,
        renderHeaderCell: () => (
          <div className="flex h-[100%] w-full flex-col justify-center">
            <p className={`text-left text-sm font-normal`}>
              TANGGAL INVOICE EMKL
            </p>
          </div>
        ),
        name: 'tglinvoiceemkl',
        renderCell: (props: any) => {
          const rowIdx = props.rowIdx;
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.isAddRow ? (
                ''
              ) : (
                <FormField
                  name={`details.${rowIdx}.tglinvoiceemkl`}
                  control={forms.control}
                  render={({ field }) => (
                    <FormItem className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
                      <div className="flex flex-col">
                        <FormControl>
                          <InputDatePicker
                            value={field.value}
                            onChange={field.onChange}
                            disabled={mode === 'view' || mode === 'delete'}
                            showCalendar
                            onSelect={(date) =>
                              handleInputChange(
                                props.rowIdx,
                                'tglinvoiceemkl',
                                String(date)
                              )
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
        key: 'nofakturpajakemkl',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 200,
        renderHeaderCell: () => (
          <div className="flex h-[100%] w-full flex-col justify-center">
            <p className={`text-left text-sm font-normal`}>
              nomor faktur pajak emkl
            </p>
          </div>
        ),
        name: 'nofakturpajakemkl',
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.isAddRow ? (
                ''
              ) : (
                <Input
                  type="text"
                  disabled={mode === 'view' || mode === 'delete'}
                  value={props.row.nofakturpajakemkl}
                  onKeyDown={inputStopPropagation}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    handleInputChange(
                      props.rowIdx,
                      'nofakturpajakemkl',
                      e.target.value
                    )
                  }
                  className="h-2 min-h-9 w-full rounded border border-gray-300"
                />
              )}
            </div>
          );
        }
      },
      {
        key: 'perioderefund',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 170,
        renderHeaderCell: () => (
          <div className="flex h-[100%] w-full flex-col justify-center">
            <p className={`text-left text-sm font-normal`}>periode refund</p>
          </div>
        ),
        name: 'perioderefund',
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.isAddRow ? (
                ''
              ) : (
                <Input
                  type="text"
                  disabled={mode === 'view' || mode === 'delete'}
                  value={props.row.perioderefund}
                  maxLength={10}
                  onKeyDown={inputStopPropagation}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    handleInputChange(
                      props.rowIdx,
                      'perioderefund',
                      e.target.value
                    )
                  }
                  className="h-2 min-h-9 w-full rounded border border-gray-300"
                />
              )}
            </div>
          );
        }
      }
    ];
  }, [
    rows,
    checkedRows,
    editingRowId,
    editableValues,
    forms.getValues('details')
  ]);

  const lookUpPropsRelasi = [
    {
      columns: [{ key: 'nama', name: 'RELASI' }],
      labelLookup: 'RELASI LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'relasi',
      label: 'RELASI',
      singleColumn: true,
      pageSize: 20,
      showOnButton: true,
      postData: 'nama',
      dataToPost: 'id'
    }
  ];

  const lookUpPropsBank = [
    {
      columns: [{ key: 'nama', name: 'BANK' }],
      labelLookup: 'BANK LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'bank',
      label: 'BANK',
      singleColumn: true,
      pageSize: 20,
      showOnButton: true,
      postData: 'nama',
      dataToPost: 'id'
    }
  ];

  const lookUpPropsCoakredit = [
    {
      columns: [
        { key: 'coa', name: 'COA' },
        { key: 'keterangancoa', name: 'KETERANGANCOA' }
      ],
      labelLookup: 'COA KREDIT LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'akunpusat',
      label: 'COA KREDIT',
      singleColumn: false,
      pageSize: 20,
      showOnButton: true,
      postData: 'keterangancoa',
      dataToPost: 'coa'
    }
  ];

  const lookUpPropsAlatbayar = [
    {
      columns: [{ key: 'nama', name: 'ALAT BAYAR' }],
      labelLookup: 'ALAT BAYAR LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'alatbayar',
      label: 'ALAT BAYAR',
      singleColumn: true,
      pageSize: 20,
      showOnButton: true,
      postData: 'nama',
      dataToPost: 'id'
    }
  ];

  const lookUpPropsDaftarbank = [
    {
      columns: [{ key: 'nama', name: 'DAFTAR BANK' }],
      labelLookup: 'DAFTAR BANK LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'daftarbank',
      label: 'DAFTAR BANK',
      singleColumn: true,
      pageSize: 20,
      showOnButton: true,
      postData: 'nama',
      dataToPost: 'id'
    }
  ];

  const lookUpPropsCoaDebet = [
    {
      columns: [
        { key: 'coa', name: 'COA', width: 100 },
        { key: 'keterangancoa', name: 'KETERANGANCOA' }
      ],
      labelLookup: 'COA DEBET LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'akunpusat',
      singleColumn: false,
      pageSize: 20,
      showOnButton: true,
      postData: 'keterangancoa',
      dataToPost: 'coa'
    }
  ];

  const formRef = useRef<HTMLFormElement | null>(null);
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
  }, [openName]); // Tambahkan popOverDate sebagai dependen
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
  function handleSetRowsLookup(val: any) {
    console.log('val', val);

    setRows((prevRows) => {
      // Find the index of the "Add Row" button row
      const addRowIndex = prevRows.findIndex((row) => row.isAddRow);

      // Find the first row that is empty (excluding the "Add Row" button row)
      const emptyRowIndex = prevRows.findIndex(
        (row) => row.id !== 'add_row' && !row.coadebet && !row.coadebet_text
      );

      // Prepare the new row data from the lookup value
      const newRow = {
        id: 0,
        coadebet: val.coadebet ?? '',
        coadebet_text: val.coadebet_text ?? '',
        keterangan: val.keterangan ?? '',
        nominal: val.sisa ?? '',
        dpp: val.dpp ?? '',
        noinvoiceemkl: val.noinvoiceemkl ?? '',
        tglinvoiceemkl: val.tglinvoiceemkl ?? '',
        nofakturpajakemkl: val.nofakturpajakemkl ?? '',
        perioderefund: val.perioderefund ?? '',
        transaksibiaya_nobukti: val.transaksibiaya_nobukti ?? '',
        transaksilain_nobukti: val.transaksilain_nobukti ?? '',
        isNew: false
      };

      // If there's an empty row, replace it with the new row from the lookup
      if (emptyRowIndex !== -1) {
        prevRows[emptyRowIndex] = newRow;
      } else {
        // If no empty rows, just add the new row at the end, before the "Add Row" button
        prevRows.splice(addRowIndex, 0, newRow);
      }

      // Ensure the "Add Row" button is always at the end
      return [...prevRows];
    });
  }
  useEffect(() => {
    if (allData || popOver) {
      if (allData && (allData.data?.length ?? 0) > 0 && mode !== 'add') {
        const formattedRows = allData.data.map((item: any) => ({
          id: item.id,
          coadebet: item.coadebet ?? '',
          coadebet_text: item.coadebet_text ?? '',
          keterangan: item.keterangan ?? '',
          nominal: item.nominal ?? '',
          dpp: item.dpp ?? '',
          noinvoiceemkl: item.noinvoiceemkl ?? '',
          tglinvoiceemkl: item.tglinvoiceemkl ?? '',
          nofakturpajakemkl: item.nofakturpajakemkl ?? '',
          perioderefund: item.perioderefund ?? '',
          transaksibiaya_nobukti: item.transaksibiaya_nobukti ?? '',
          transaksilain_nobukti: item.transaksilain_nobukti ?? '',
          isNew: false
        }));

        // Always add the "Add Row" button row at the end
        setRows([
          ...formattedRows,
          { isAddRow: true, id: 'add_row', isNew: false }
        ]);
      } else {
        // If no data, add one editable row and the "Add Row" button row at the end
        setRows([
          {
            id: 0,
            coadebet: '',
            coadebet_text: '',
            keterangan: '',
            nominal: '',
            dpp: '',
            noinvoiceemkl: '',
            tglinvoiceemkl: '',
            nofakturpajakemkl: '',
            perioderefund: '',
            transaksibiaya_nobukti: '',
            transaksilain_nobukti: '',
            isNew: true
          },
          { isAddRow: true, id: 'add_row', isNew: false } // Row for the "Add Row" button
        ]);
      }
    }
  }, [allData, headerData?.id, popOver, mode]);

  useEffect(() => {
    if (rows) {
      // Filter out the `isNew` field and any object with `id: "add_row"`
      const filteredRows = rows
        .filter((row) => row.id !== 'add_row') // Exclude rows with id "add_row"
        .map(
          ({
            isNew,
            coadebet,
            coadebet_text,
            keterangan,
            nominal,
            dpp,
            noinvoiceemkl,
            tglinvoiceemkl,
            nofakturpajakemkl,
            perioderefund,
            transaksibiaya_nobukti,
            transaksilain_nobukti,
            ...rest
          }) => ({
            ...rest,
            nobukti: transaksilain_nobukti ? String(transaksilain_nobukti) : '',
            coadebet: coadebet ? String(coadebet) : '',
            coadebet_text: coadebet_text ? String(coadebet_text) : '',
            keterangan: keterangan ? String(keterangan) : '',
            nominal: nominal ? String(nominal) : '',
            dpp: dpp ? String(dpp) : '',
            noinvoiceemkl: noinvoiceemkl ? String(noinvoiceemkl) : '',
            tglinvoiceemkl: tglinvoiceemkl ? String(tglinvoiceemkl) : '',
            nofakturpajakemkl: nofakturpajakemkl
              ? String(nofakturpajakemkl)
              : '',
            perioderefund: perioderefund ? String(perioderefund) : '',
            transaksibiaya_nobukti: transaksibiaya_nobukti
              ? String(transaksibiaya_nobukti)
              : '',
            transaksilain_nobukti: transaksilain_nobukti
              ? String(transaksilain_nobukti)
              : ''
          })
        );

      forms.setValue('details', filteredRows);
    }
  }, [rows]);

  useEffect(() => {
    if (submitSuccessful) {
      resetDetailAndAddNewRow();
    }
  }, [submitSuccessful]);
  return (
    <Dialog open={popOver} onOpenChange={setPopOver}>
      <DialogTitle hidden={true}>Title</DialogTitle>
      <DialogContent className="flex h-full min-w-full flex-col overflow-hidden border bg-white">
        <div className="flex items-center justify-between bg-[#e0ecff] px-2 py-2">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {mode === 'add'
              ? 'Add Pengeluaran'
              : mode === 'edit'
              ? 'Edit Pengeluaran'
              : mode === 'delete'
              ? 'Delete Pengeluaran'
              : 'View Pengeluaran'}
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
                  <div className="flex flex-row">
                    <FormField
                      name="nobukti"
                      control={forms.control}
                      render={({ field }) => (
                        <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                          <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[30%]">
                            NOBUKTI
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
                              <InputDatePicker
                                value={field.value}
                                onChange={field.onChange}
                                disabled={mode === 'view' || mode === 'delete'}
                                showCalendar
                                onSelect={(date) =>
                                  forms.setValue('tglbukti', date)
                                }
                              />
                              {/* <InputDateTimePicker
                                value={field.value} // '' saat kosong
                                onChange={field.onChange} // string keluar (mis. "16-08-2025 09:25 AM")
                                showCalendar
                                showTime // aktifkan 12h + AM/PM
                                minuteStep={1}
                                fromYear={1960}
                                toYear={2035}
                                // outputFormat="dd-MM-yyyy hh:mm a" // default sudah begini saat showTime
                              /> */}
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                    <div className="w-full lg:w-[15%]">
                      <FormLabel
                        required={true}
                        className="text-sm font-semibold text-gray-700"
                      >
                        RELASI
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookUpPropsRelasi.map((props, index) => (
                        <LookUp
                          disabled={mode === 'view' || mode === 'delete'}
                          key={index}
                          {...props}
                          lookupValue={(id) =>
                            forms.setValue('relasi_id', Number(id))
                          }
                          lookupNama={forms.getValues('relasi_text')}
                        />
                      ))}
                    </div>
                  </div>
                  <FormField
                    name="keterangan"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel
                          required={true}
                          className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]"
                        >
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
                      <FormLabel
                        required={true}
                        className="text-sm font-semibold text-gray-700"
                      >
                        BANK
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookUpPropsBank.map((props, index) => (
                        <LookUp
                          disabled={
                            mode === 'view' ||
                            mode === 'delete' ||
                            mode === 'edit'
                          }
                          key={index}
                          {...props}
                          lookupValue={(id) =>
                            forms.setValue('bank_id', Number(id))
                          }
                          lookupNama={forms.getValues('bank_text')}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                    <div className="w-full lg:w-[15%]">
                      <FormLabel
                        required={true}
                        className="text-sm font-semibold text-gray-700"
                      >
                        COA KREDIT
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookUpPropsCoakredit.map((props, index) => (
                        <LookUp
                          disabled={mode === 'view' || mode === 'delete'}
                          key={index}
                          {...props}
                          lookupValue={(id) => forms.setValue('coakredit', id)}
                          lookupNama={forms.getValues('coakredit_text')}
                        />
                      ))}
                    </div>
                  </div>
                  <FormField
                    name="dibayarke"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel
                          required={true}
                          className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]"
                        >
                          DIBAYAR KE
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
                      <FormLabel
                        required={true}
                        className="text-sm font-semibold text-gray-700"
                      >
                        ALAT BAYAR
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookUpPropsAlatbayar.map((props, index) => (
                        <LookUp
                          disabled={mode === 'view' || mode === 'delete'}
                          key={index}
                          {...props}
                          lookupValue={(id) =>
                            forms.setValue('alatbayar_id', Number(id))
                          }
                          lookupNama={forms.getValues('alatbayar_text')}
                        />
                      ))}
                    </div>
                  </div>
                  <FormField
                    name="nowarkat"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel
                          required={true}
                          className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]"
                        >
                          NOMOR WARKAT
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
                  <FormField
                    name="tgljatuhtempo"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel
                          required={true}
                          className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]"
                        >
                          TANGGAL JATUH TEMPO
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <InputDatePicker
                              value={field.value}
                              onChange={field.onChange}
                              disabled={mode === 'view' || mode === 'delete'}
                              showCalendar
                              onSelect={(date) =>
                                forms.setValue('tgljatuhtempo', date)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <div className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                    <div className="w-full lg:w-[15%]">
                      <FormLabel
                        required={true}
                        className="text-sm font-semibold text-gray-700"
                      >
                        DAFTAR BANK
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookUpPropsDaftarbank.map((props, index) => (
                        <LookUp
                          disabled={mode === 'view' || mode === 'delete'}
                          key={index}
                          {...props}
                          lookupValue={(id) =>
                            forms.setValue('daftarbank_id', Number(id))
                          }
                          lookupNama={forms.getValues('daftarbank_text')}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="h-[500px] min-h-[500px]">
                    <div className="flex h-[100%] w-full flex-col rounded-sm border border-blue-500 bg-white">
                      <div
                        className="flex h-[38px] w-full flex-row items-center rounded-t-sm border-b border-blue-500 px-2"
                        style={{
                          background:
                            'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 100%)'
                        }}
                      >
                        {mode !== 'view' && mode !== 'delete' && (
                          <>
                            <Button
                              type="button"
                              onClick={() =>
                                dispatch(setOpenNameModal('PENGELUARAN EMKL'))
                              }
                              className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                              size="sm"
                            >
                              <Search className="text-lg" />
                              Cari
                            </Button>
                            <LookUpModalPengeluaran
                              hideInput={true}
                              disabled={mode === 'view' || mode === 'delete'}
                              lookupValue={(id) =>
                                forms.setValue('daftarbank_id', Number(id))
                              }
                              lookupNama={forms.getValues('daftarbank_text')}
                              columns={[
                                { key: 'nobukti', name: 'NO BUKTI' },
                                { key: 'tglbukti', name: 'TANGGAL BUKTI' },
                                { key: 'keterangan', name: 'KETERANGAN' },
                                {
                                  key: 'sisa',
                                  name: 'SISA',
                                  isCurrency: true
                                },
                                {
                                  key: 'sudah_dibayar',
                                  name: 'SUDAH DIBAYAR',
                                  isCurrency: true
                                }
                              ]}
                              onSelectRow={(val) => {
                                handleSetRowsLookup(val);
                              }}
                              onClear={() => {
                                forms.setValue('pengeluaran_nobukti', null);
                                forms.setValue('statusformat', null);
                              }}
                              labelLookup={'PENGELUARAN EMKL LOOKUP'}
                              required={true}
                              selectedRequired={true}
                              endpoint={
                                'pengeluaranemklheader/list-pengeluaran'
                              }
                              dateFromParam={'dari'}
                              dateToParam={'sampai'}
                              label={'PENGELUARAN EMKL'}
                              singleColumn={false}
                              pageSize={20}
                              showOnButton={true}
                              postData={'nobukti'}
                              dataToPost={'id'}
                            />
                          </>
                        )}
                      </div>

                      <DataGrid
                        key={dataGridKey}
                        ref={gridRef}
                        columns={columns as any[]}
                        rows={rows}
                        headerRowHeight={30}
                        rowHeight={60}
                        renderers={{ noRowsFallback: <EmptyRowsRenderer /> }}
                        className="rdg-light fill-grid text-sm"
                      />
                      {/* <div
                        className="flex flex-row border border-b-0 border-l-0 border-blue-500 p-2"
                        style={{ gridColumn: '1/-1' }}
                      >
                        <div className="flex w-full flex-row items-center justify-between">
                          <p className="text-sm font-semibold">Total</p>
                          <div className="flex flex-row gap-3">
                            <p className="text-sm font-semibold">
                              {formatCurrency(totalSisa)}
                            </p>
                            <p className="text-sm font-semibold">
                              {formatCurrency(totalNominal)}
                            </p>
                          </div>
                        </div>
                      </div> */}

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
              onSubmit(false);
              dispatch(setSubmitClicked(true));
            }}
            disabled={mode === 'view'}
            className="flex w-fit items-center gap-1 text-sm"
            loading={isLoadingCreate || isLoadingUpdate || isLoadingDelete}
          >
            <FaSave />
            <p className="text-center">
              {mode === 'delete' ? 'DELETE' : 'SAVE'}
            </p>
          </Button>

          {mode === 'add' && (
            <div>
              <Button
                type="submit"
                variant="success"
                onClick={(e) => {
                  e.preventDefault();
                  onSubmit(true);
                  dispatch(setSubmitClicked(true));
                }}
                disabled={mode === 'view'}
                className="flex w-fit items-center gap-1 text-sm"
                loading={isLoadingCreate || isLoadingUpdate || isLoadingDelete}
              >
                <FaSave />
                <p className="text-center">
                  {mode === 'delete' ? 'DELETE' : 'SAVE & ADD'}
                </p>
              </Button>
            </div>
          )}

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

export default FormPengeluaran;
