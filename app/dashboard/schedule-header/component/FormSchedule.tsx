import { useSelector } from 'react-redux';
import { IoMdClose } from 'react-icons/io';
import { Input } from '@/components/ui/input';
import { RootState } from '@/lib/store/store';
import { Button } from '@/components/ui/button';
import { FaRegSquarePlus } from 'react-icons/fa6';
import { FaSave, FaTimes, FaTrashAlt } from 'react-icons/fa';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useGetScheduleDetail } from '@/lib/server/useSchedule';
import { ScheduleDetail } from '@/lib/types/scheduleheader.type';
import DataGrid, { Column, DataGridHandle } from 'react-data-grid';
import InputDatePicker from '@/components/custom-ui/InputDatePicker';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import FormLabel, {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form';
import LookUp from '@/components/custom-ui/LookUp';
import { setSubmitClicked } from '@/lib/store/lookupSlice/lookupSlice';
import { useDispatch } from 'react-redux';
import InputDateTimePicker from '@/components/custom-ui/InputDateTimePicker';

const FormSchedule = ({
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
  const [dataGridKey, setDataGridKey] = useState(0);
  const [editingRowId, setEditingRowId] = useState<number | null>(null); // Menyimpan ID baris yang sedang diedit
  const [checkedRows, setCheckedRows] = useState<Set<number>>(new Set());
  const [editableValues, setEditableValues] = useState<Map<number, string>>(
    new Map()
  ); // Nilai yang sedang diedit untuk setiap baris
  const [rows, setRows] = useState<
    (ScheduleDetail | (Partial<ScheduleDetail> & { isNew: boolean }))[]
  >([]);

  const dispatch = useDispatch();
  const gridRef = useRef<DataGridHandle>(null);
  const formRef = useRef<HTMLFormElement | null>(null); // Ref untuk form
  const openName = useSelector((state: RootState) => state.lookup.openName);
  const headerData = useSelector((state: RootState) => state.header.headerData);
  const {
    data: allDataDetail,
    isLoading: isLoadingData,
    refetch
  } = useGetScheduleDetail(headerData?.id ?? 0);

  const lookupPelayaranProps = [
    {
      columns: [{ key: 'nama', name: 'NAMA' }],
      labelLookup: 'PELAYARAN LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'pelayaran',
      // label: 'PELAYARAN',
      singleColumn: false,
      pageSize: 20,
      postData: 'nama',
      dataToPost: 'id'
    }
  ];

  const lookupKapalProps = [
    {
      columns: [{ key: 'nama', name: 'NAMA' }],
      labelLookup: 'KAPAL LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'kapal',
      // label: 'KAPAL',
      singleColumn: false,
      pageSize: 20,
      postData: 'nama',
      dataToPost: 'id'
    }
  ];

  const lookupTujuanKapalProps = [
    {
      columns: [{ key: 'nama', name: 'NAMA' }],
      labelLookup: 'TUJUAN KAPAL LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'tujuankapal',
      // label: 'TUJUAN KAPAL',
      singleColumn: false,
      pageSize: 20,
      postData: 'nama',
      dataToPost: 'id'
    }
  ];

  const addRow = () => {
    const newRow: Partial<ScheduleDetail> & { isNew: boolean } = {
      id: 0, // Placeholder ID
      nobukti: '',
      pelayaran_id: 0,
      pelayaran_nama: '',
      kapal_id: 0,
      kapal_nama: '',
      tujuankapal_id: 0,
      tujuankapal_nama: '',
      tglberangkat: '',
      tgltiba: '',
      etb: '',
      eta: '',
      etd: '',
      voyberangkat: '',
      voytiba: '',
      closing: '',
      etatujuan: '',
      etdtujuan: '',
      keterangan: '',
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

  const columns = useMemo((): Column<ScheduleDetail>[] => {
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
            return 4; // Spanning the "Add Row" button across 3 columns (adjust as needed)
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
        key: 'pelayaran',
        name: 'PELAYARAN',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 200,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>PELAYARAN</p>
            </div>
            <div className="relative h-[50%] w-full px-1"></div>
          </div>
        ),
        colSpan: (args) => {
          // If it's the "Add Row" row, span across multiple columns
          if (args.type === 'ROW' && args.row.isAddRow) {
            return 5; // Spanning the "Add Row" button across 3 columns (adjust as needed)
          }
          return undefined; // For other rows, no column spanning
        },
        renderCell: (props: any) => (
          <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
            {props.row.isAddRow
              ? ''
              : lookupPelayaranProps.map((pelayaranLookupProps, index) => (
                  <LookUp
                    key={index}
                    {...pelayaranLookupProps}
                    label={`PELAYARAN ${props.rowIdx}`} // Ensure you use row.id or rowIdx for unique labeling
                    lookupValue={(id) => {
                      handleInputChange(
                        props.rowIdx,
                        'pelayaran_id',
                        Number(id)
                      ); // Use props.rowIdx to get the correct index
                    }}
                    lookupNama={
                      props.row.pelayaran_nama
                        ? String(props.row.pelayaran_nama)
                        : undefined
                    }
                    inputLookupValue={Number(props.row.pelayaran_id)}
                  />
                ))}
          </div>
        )
      },
      {
        key: 'kapal',
        name: 'KAPAL',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 200,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>KAPAL</p>
            </div>
            <div className="relative h-[50%] w-full px-1"></div>
          </div>
        ),
        renderCell: (props: any) => (
          <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
            {props.row.isAddRow
              ? ''
              : lookupKapalProps.map((kapalLookupProps, index) => (
                  <LookUp
                    key={index}
                    {...kapalLookupProps}
                    label={`KAPAL ${props.rowIdx}`} // Ensure you use row.id or rowIdx for unique labeling
                    lookupValue={
                      (id) =>
                        handleInputChange(props.rowIdx, 'kapal_id', Number(id)) // Use props.rowIdx to get the correct index
                    }
                    lookupNama={
                      props.row.kapal_nama
                        ? String(props.row.kapal_nama)
                        : undefined
                    }
                    inputLookupValue={Number(props.row.kapal_id)}
                  />
                ))}
          </div>
        )
      },
      {
        key: 'tujuankapal',
        name: 'TUJUAN KAPAL',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 200,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>TUJUAN KAPAL</p>
            </div>
            <div className="relative h-[50%] w-full px-1"></div>
          </div>
        ),
        colSpan: (args) => {
          // If it's the "Add Row" row, span across multiple columns
          if (args.type === 'ROW' && args.row.isAddRow) {
            return 5; // Spanning the "Add Row" button across 3 columns (adjust as needed)
          }
          return undefined; // For other rows, no column spanning
        },
        renderCell: (props: any) => (
          <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
            {props.row.isAddRow
              ? ''
              : lookupTujuanKapalProps.map((tujuanKapalLookupProps, index) => (
                  <LookUp
                    key={index}
                    {...tujuanKapalLookupProps}
                    label={`TUJUAN KAPAL ${props.rowIdx}`} // Ensure you use row.id or rowIdx for unique labeling
                    lookupValue={
                      (id) =>
                        handleInputChange(
                          props.rowIdx,
                          'tujuankapal_id',
                          Number(id)
                        ) // Use props.rowIdx to get the correct index
                    }
                    lookupNama={
                      props.row.tujuankapal_nama
                        ? String(props.row.tujuankapal_nama)
                        : undefined
                    }
                    inputLookupValue={Number(props.row.tujuankapal_id)}
                  />
                ))}
          </div>
        )
      },
      {
        key: 'tglberangkat',
        name: 'TGLBERANGKAT',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>TGLBERANGKAT</p>
            </div>
            <div className="relative h-[50%] w-full px-1"></div>
          </div>
        ),
        renderCell: (props: any) => (
          <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
            {props.row.isAddRow ? (
              ''
            ) : (
              <div className="flex flex-col lg:w-full">
                <FormControl>
                  <InputDatePicker
                    value={props.row.tglberangkat}
                    // onChange={field.onChange}
                    onChange={(e) =>
                      handleInputChange(
                        props.rowIdx,
                        'tglberangkat',
                        e.target.value
                      )
                    }
                    showCalendar
                  />
                </FormControl>
                <FormMessage />
              </div>
            )}
          </div>
        )
      },
      {
        key: 'tgltiba',
        name: 'TGL TIBA',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>TGL TIBA</p>
            </div>
            <div className="relative h-[50%] w-full px-1"></div>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.isAddRow ? (
                ''
              ) : (
                <div className="flex flex-col lg:w-full">
                  <FormControl>
                    <InputDatePicker
                      value={props.row.tgltiba}
                      onChange={(e) =>
                        handleInputChange(
                          props.rowIdx,
                          'tgltiba',
                          e.target.value
                        )
                      }
                      showCalendar
                      // onSelect={(date) =>
                      //   forms.setValue('tgltiba', date)
                      // }
                    />
                  </FormControl>
                  <FormMessage />
                </div>
              )}
            </div>
          );
        }
      },
      {
        key: 'etb',
        name: 'ETB',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>ETB</p>
            </div>
            <div className="relative h-[50%] w-full px-1"></div>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.isAddRow ? (
                ''
              ) : (
                <div className="flex flex-col lg:w-full">
                  <FormControl>
                    <InputDatePicker
                      value={props.row.etb}
                      onChange={(e) =>
                        handleInputChange(props.rowIdx, 'etb', e.target.value)
                      }
                      showCalendar
                      // onSelect={(date) =>
                      //   forms.setValue('etb', date)
                      // }
                    />
                  </FormControl>
                  <FormMessage />
                </div>
              )}
            </div>
          );
        }
      },
      {
        key: 'eta',
        name: 'ETA',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>ETA</p>
            </div>
            <div className="relative h-[50%] w-full px-1"></div>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.isAddRow ? (
                ''
              ) : (
                <div className="flex flex-col lg:w-full">
                  <FormControl>
                    <InputDatePicker
                      value={props.row.eta}
                      onChange={(e) =>
                        handleInputChange(props.rowIdx, 'eta', e.target.value)
                      }
                      showCalendar
                      // onSelect={(date) =>
                      //   forms.setValue('eta', date)
                      // }
                    />
                  </FormControl>
                  <FormMessage />
                </div>
              )}
            </div>
          );
        }
      },
      {
        key: 'etd',
        name: 'ETD',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>ETD</p>
            </div>
            <div className="relative h-[50%] w-full px-1"></div>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.isAddRow ? (
                ''
              ) : (
                <div className="flex flex-col lg:w-full">
                  <FormControl>
                    <InputDatePicker
                      value={props.row.etd}
                      onChange={(e) =>
                        handleInputChange(props.rowIdx, 'etd', e.target.value)
                      }
                      showCalendar
                      // onSelect={(date) =>
                      //   forms.setValue('etd', date)
                      // }
                    />
                  </FormControl>
                  <FormMessage />
                </div>
              )}
            </div>
          );
        }
      },
      {
        key: 'voyberangkat',
        name: 'VOY BERANGKAT',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>VOY BERANGKAT</p>
            </div>
            <div className="relative h-[50%] w-full px-1"></div>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.isAddRow ? (
                ''
              ) : (
                <Input
                  type="text"
                  value={props.row.voyberangkat}
                  onKeyDown={inputStopPropagation}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    handleInputChange(
                      props.rowIdx,
                      'voyberangkat',
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
        key: 'voytiba',
        name: 'VOY TIBA',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>VOY TIBA</p>
            </div>
            <div className="relative h-[50%] w-full px-1"></div>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.isAddRow ? (
                ''
              ) : (
                <Input
                  type="text"
                  value={props.row.voytiba}
                  onKeyDown={inputStopPropagation}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    handleInputChange(props.rowIdx, 'voytiba', e.target.value)
                  }
                  className="h-2 min-h-9 w-full rounded border border-gray-300"
                />
              )}
            </div>
          );
        }
      },
      {
        key: 'closing',
        name: 'CLOSING',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>CLOSING</p>
            </div>
            <div className="relative h-[50%] w-full px-1"></div>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.isAddRow ? (
                ''
              ) : (
                <div className="flex flex-col lg:w-full">
                  <FormControl>
                    {/* <InputDatePicker
                      value={props.row.closing}
                      onChange={(e) =>
                        handleInputChange(
                          props.rowIdx,
                          'closing',
                          e.target.value
                        )
                      }
                      showCalendar
                      // onSelect={(date) =>
                      //   forms.setValue('closing', date)
                      // }
                    /> */}

                    <InputDateTimePicker
                      value={props.row.closing} // '' saat kosong
                      // onChange={field.onChange} // string keluar (mis. "16-08-2025 09:25 AM")
                      onChange={(value: any) => {
                        console.log('e', value);

                        handleInputChange(props.rowIdx, 'closing', value);
                      }}
                      showCalendar
                      showTime // aktifkan 12h + AM/PM
                      minuteStep={1}
                      fromYear={1960}
                      toYear={2035}
                      // outputFormat="dd-MM-yyyy hh:mm a" // default sudah begini saat showTime
                    />
                  </FormControl>
                  <FormMessage />
                </div>
              )}
            </div>
          );
        }
      },
      {
        key: 'etatujuan',
        name: 'ETA TUJUAN',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>ETA TUJUAN</p>
            </div>
            <div className="relative h-[50%] w-full px-1"></div>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.isAddRow ? (
                ''
              ) : (
                <div className="flex flex-col lg:w-full">
                  <FormControl>
                    <InputDatePicker
                      value={props.row.etatujuan}
                      onChange={(e) =>
                        handleInputChange(
                          props.rowIdx,
                          'etatujuan',
                          e.target.value
                        )
                      }
                      showCalendar
                      // onSelect={(date) =>
                      //   forms.setValue('etatujuan', date)
                      // }
                    />
                  </FormControl>
                  <FormMessage />
                </div>
              )}
            </div>
          );
        }
      },
      {
        key: 'etdtujuan',
        name: 'ETD TUJUAN',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>ETD TUJUAN</p>
            </div>
            <div className="relative h-[50%] w-full px-1"></div>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.isAddRow ? (
                ''
              ) : (
                <div className="flex flex-col lg:w-full">
                  <FormControl>
                    <InputDatePicker
                      value={props.row.etdtujuan}
                      onChange={(e) =>
                        handleInputChange(
                          props.rowIdx,
                          'etdtujuan',
                          e.target.value
                        )
                      }
                      showCalendar
                      // onSelect={(date) =>
                      //   forms.setValue('etdtujuan', date)
                      // }
                    />
                  </FormControl>
                  <FormMessage />
                </div>
              )}
            </div>
          );
        }
      },
      {
        key: 'keterangan',
        name: 'KETERANGAN',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>Keterangan</p>
            </div>
            <div className="relative h-[50%] w-full px-1"></div>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.isAddRow ? (
                ''
              ) : (
                <Input
                  type="text"
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
            // <div>
            //   {props.row.isAddRow ? (
            //     ''
            //   ) : (
            //     <FormField
            //       name="keterangan"
            //       control={forms.control}
            //       render={({ field }) => (
            //         <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
            //           <div className="flex flex-col lg:w-full">
            //             <FormControl>

            //                 <Input
            //                   type="text"
            //                   value={props.row.keterangan}
            //                   onKeyDown={inputStopPropagation}
            //                   onClick={(e) => e.stopPropagation()}
            //                   onChange={(e) =>
            //                     handleInputChange(
            //                       props.rowIdx,
            //                       'keterangan',
            //                       e.target.value
            //                     )
            //                   }
            //                   className="h-2 min-h-9 w-full rounded border border-gray-300"
            //                 />
            //             </FormControl>
            //             <FormMessage />
            //           </div>
            //         </FormItem>
            //       )}
            //     />
            //   )}
            // </div>
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
    if (allDataDetail && popOver) {
      if (allDataDetail?.data?.length > 0 && mode !== 'add') {
        // If there is data, add the data rows and the "Add Row" button row at the end
        const formattedRows = allDataDetail.data.map((item: any) => ({
          id: Number(item.id),
          nobukti: item.nobukti ?? '',
          pelayaran_id: Number(item.pelayaran_id) ?? '',
          pelayaran_nama: item.pelayaran_nama ?? '',
          kapal_id: Number(item.kapal_id) ?? '',
          kapal_nama: item.kapal_nama ?? '',
          tujuankapal_id: Number(item.tujuankapal_id) ?? '',
          tujuankapal_nama: item.tujuankapal_nama ?? '',
          tglberangkat: item.tglberangkat ?? '',
          tgltiba: item.tgltiba ?? '',
          etb: item.etb ?? '',
          eta: item.eta ?? '',
          etd: item.etd ?? '',
          voyberangkat: item.voyberangkat ?? '',
          voytiba: item.voytiba ?? '',
          closing: item.closing ?? '',
          etatujuan: item.etatujuan ?? '',
          etdtujuan: item.etdtujuan ?? '',
          keterangan: item.keterangan ?? '',
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
            nobukti: '',
            pelayaran_id: 0,
            pelayaran_nama: '',
            kapal_id: 0,
            kapal_nama: '',
            tujuankapal_id: 0,
            tujuankapal_nama: '',
            tglberangkat: '',
            tgltiba: '',
            etb: '',
            eta: '',
            etd: '',
            voyberangkat: '',
            voytiba: '',
            closing: '',
            etatujuan: '',
            etdtujuan: '',
            keterangan: '',
            isNew: true
          },
          { isAddRow: true, id: 'add_row', isNew: false } // Row for the "Add Row" button
        ]);
      }
    }
  }, [allDataDetail, headerData?.id, popOver, mode]);

  useEffect(() => {
    if (rows) {
      // Filter out the `isNew` field and any object with `id: "add_row"`
      const filteredRows = rows
        .filter((row) => row.id !== 'add_row') // Exclude rows with id "add_row"
        .map(({ isNew, ...rest }) => ({
          ...rest
        }));

      forms.setValue('details', filteredRows);
    }
  }, [rows]);

  return (
    <Dialog open={popOver} onOpenChange={setPopOver}>
      <DialogTitle hidden={true}>Title</DialogTitle>
      <DialogContent className="flex h-full min-w-full flex-col overflow-hidden border bg-white">
        <div className="flex items-center justify-between bg-[#e0ecff] px-2 py-2">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {mode === 'add'
              ? 'Add Schedule Form'
              : mode === 'edit'
              ? 'Edit Schedule Form'
              : mode === 'delete'
              ? 'Delete Schedule Form'
              : 'View Schedule Form'}
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
                  {/* <div className="flex flex-row"> */}
                  <FormField
                    name="nobukti"
                    control={forms.control}
                    render={({ field }) => (
                      // <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                      // <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[30%]">
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel
                          required={true}
                          className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]"
                        >
                          NO BUKTI
                        </FormLabel>
                        {/* <div className="flex flex-col lg:w-[70%]"> */}
                        <div className="flex flex-col lg:w-[85%]">
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
                      // <FormItem className="flex w-full flex-col justify-between lg:ml-4 lg:flex-row lg:items-center">
                      // <FormLabel required={true} className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[30%]">
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel
                          required={true}
                          className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]"
                        >
                          TGL BUKTI
                        </FormLabel>
                        {/* <div className="flex flex-col lg:w-[70%]"> */}
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <InputDatePicker
                              value={field.value}
                              onChange={field.onChange}
                              showCalendar
                              onSelect={(date) =>
                                forms.setValue('tglbukti', date)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  {/* </div> */}
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
              onSubmit(false);
              dispatch(setSubmitClicked(true));
            }}
            disabled={mode === 'view'}
            className="flex w-fit items-center gap-1 text-sm"
          >
            <FaSave />
            <p className="text-center">
              {' '}
              {mode === 'delete' ? 'DELETE' : 'SAVE'}{' '}
            </p>
          </Button>

          {mode === 'add' && (
            <Button
              type="submit"
              variant="success"
              // onClick={onSubmit}
              onClick={(e) => {
                e.preventDefault();
                onSubmit(true);
                dispatch(setSubmitClicked(true));
                setRows([
                  // If no data, add one editable row and the "Add Row" button row at the end
                  {
                    id: 0,
                    nobukti: '',
                    pelayaran_id: 0,
                    pelayaran_nama: '',
                    kapal_id: 0,
                    kapal_nama: '',
                    tujuankapal_id: 0,
                    tujuankapal_nama: '',
                    tglberangkat: '',
                    tgltiba: '',
                    etb: '',
                    eta: '',
                    etd: '',
                    voyberangkat: '',
                    voytiba: '',
                    closing: '',
                    etatujuan: '',
                    etdtujuan: '',
                    keterangan: '',
                    isNew: true
                  },
                  { isAddRow: true, id: 'add_row', isNew: false } // Row for the "Add Row" button
                ]);
              }}
              className="flex w-fit items-center gap-1 text-sm"
            >
              <FaSave />
              <p className="text-center">SAVE & ADD</p>
            </Button>
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

export default FormSchedule;
