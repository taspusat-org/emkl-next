import { useSelector } from 'react-redux';
import { IoMdClose } from 'react-icons/io';
import { Input } from '@/components/ui/input';
import { RootState } from '@/lib/store/store';
import { Button } from '@/components/ui/button';
import { FaRegSquarePlus } from 'react-icons/fa6';
import { FaSave, FaTimes, FaTrashAlt } from 'react-icons/fa';
import { useEffect, useMemo, useRef, useState } from 'react';
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
import LookUpModal from '@/components/custom-ui/LookUpModal';
import { setSubmitClicked } from '@/lib/store/lookupSlice/lookupSlice';
import { useDispatch } from 'react-redux';
import InputDateTimePicker from '@/components/custom-ui/InputDateTimePicker';
import {
  filterStatusJobMasukGudang,
  StatusJobMasukGudang
} from '@/lib/types/statusJob.type';
import { useGetAllStatusJobMasukGudangByTglStatus } from '@/lib/server/useStatusJob';
import { JENISORDERMUATAN, statusJobMasukGudang } from '@/constants/statusjob';
import LookUp from '@/components/custom-ui/LookUp';

interface Filter {
  page: number;
  limit: number;
  search: string;
  filters: typeof filterStatusJobMasukGudang;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

const FormStatusJobMasukGudang = ({
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
    (
      | StatusJobMasukGudang
      | (Partial<StatusJobMasukGudang> & { isNew: boolean })
    )[]
  >([]);

  const dispatch = useDispatch();
  const gridRef = useRef<DataGridHandle>(null);
  const formRef = useRef<HTMLFormElement | null>(null); // Ref untuk form
  const abortControllerRef = useRef<AbortController | null>(null); // AbortController untuk cancel request
  const openName = useSelector((state: RootState) => state.lookup.openName);
  const headerData = useSelector((state: RootState) => state.header.headerData);
  const {
    selectedJenisOrderan,
    selectedJenisStatusJob,
    selectedJenisOrderanNama,
    selectedJenisStatusJobNama
  } = useSelector((state: RootState) => state.filter);

  const [filters, setFilters] = useState<Filter>({
    page: 1,
    limit: 30,
    filters: {
      ...filterStatusJobMasukGudang,
      jenisOrderan: String(selectedJenisOrderan),
      jenisStatusJob: String(selectedJenisStatusJob)
    },
    search: '',
    sortBy: 'tglstatus',
    sortDirection: 'asc'
  });

  const {
    data: allDataDetail,
    isLoading: isLoading,
    refetch
  } = useGetAllStatusJobMasukGudangByTglStatus(
    headerData?.tglstatus ?? '',
    { ...filters, page: 1 },
    abortControllerRef.current?.signal
  );

  const lookupOrderan = [
    {
      columns: [
        { key: 'nobukti', name: 'NO BUKTI' },
        { key: 'tglbukti', name: 'TANGGAL JOB' },
        { key: 'shipper_nama', name: 'SHIPPER' },
        { key: 'nocontainer', name: 'NO CONTAINER' },
        { key: 'noseal', name: 'NO SEAL' },
        { key: 'lokasistuffing_nama', name: 'LOKASI STUFFING' },
        { key: 'gandengan', name: 'GANDENGAN' }
      ],
      labelLookup: 'ORDERAN LOOKUP LOOKUP',
      required: true,
      selectedRequired: false,
      disabled: mode === 'view' || mode === 'delete' ? true : false,
      endpoint: `orderanheader?jenisOrderan=${selectedJenisOrderan}`,
      singleColumn: false,
      pageSize: 20,
      postData: 'nobukti',
      dataToPost: 'id'
    }
  ];

  const lookupJenisOrder = [
    {
      columns: [{ key: 'nama', name: 'NAMA' }],
      labelLookup: 'JENIS ORDERAN LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'JenisOrderan',
      label: 'JENIS ORDER LOOKUP',
      singleColumn: true,
      pageSize: 20,
      disabled: true,
      postData: 'nama',
      dataToPost: 'id'
    }
  ];

  const lookupJenisStatusJob = [
    {
      columns: [{ key: 'text', name: 'NAMA' }],
      labelLookup: 'JENIS STATUS JOB LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: `parameter?grp=data+status+job&subgrp=orderanmuatan`,
      label: 'JENIS STATUS JOB LOOKUP',
      singleColumn: true,
      pageSize: 20,
      disabled: true,
      postData: 'text',
      dataToPost: 'id'
    }
  ];

  const addRow = () => {
    const newRow: Partial<StatusJobMasukGudang> & { isNew: boolean } = {
      id: 0, // Placeholder ID
      job: 0,
      job_nama: '',
      tglorder: '',
      nocontainer: '',
      noseal: '',
      shipper_id: 0,
      shipper_nama: '',
      lokasistuffing_id: 0,
      lokasistuffing_nama: '',
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
  const handleMultipleInputChange = (
    updates: Array<{ index: number; field: string; value: string | number }>
  ) => {
    console.log('updates', updates);
    setRows((prevRows) => {
      // Buat copy dari prevRows
      let updatedData = [...prevRows];

      // Filter out row "Add Row" dulu
      const addRowIndex = updatedData.findIndex((row) => row.isAddRow);
      const addRow = addRowIndex !== -1 ? updatedData[addRowIndex] : null;
      if (addRowIndex !== -1) {
        updatedData = updatedData.filter((_, i) => i !== addRowIndex);
      }

      // Cari index maksimal yang dibutuhkan
      const maxIndex = Math.max(...updates.map((u) => u.index));

      // Pastikan array cukup panjang
      while (updatedData.length <= maxIndex) {
        updatedData.push({
          id: 0,
          job: 0,
          job_nama: '',
          tglorder: '',
          nocontainer: '',
          noseal: '',
          shipper_id: 0,
          shipper_nama: '',
          lokasistuffing_id: 0,
          lokasistuffing_nama: '',
          keterangan: '',
          isNew: true
        });
      }

      // Apply semua updates
      updates.forEach(({ index, field, value }) => {
        if (updatedData[index]) {
          updatedData[index][field] = value;

          // Check jika row sudah lengkap
          if (
            updatedData[index].isNew &&
            Object.values(updatedData[index]).every((val) => val !== '')
          ) {
            updatedData[index].isNew = false;
          }
        }
      });

      // Tambahkan kembali "Add Row" di akhir
      if (addRow) {
        updatedData.push(addRow);
      }

      return updatedData;
    });
  };
  console.log('rows', rows);
  const columns = useMemo((): Column<StatusJobMasukGudang>[] => {
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
          const rowIndex = rows.findIndex(
            (row) => Number(row.id) === Number(props.row.id)
          );
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center justify-center p-0 text-xs">
              <button
                type="button"
                className="rounded bg-transparent text-xs text-red-500"
                onClick={() => deleteRow(props.rowIdx)}
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
            return 9; // Spanning the "Add Row" button across 3 columns (adjust as needed)
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
        key: 'job',
        name: 'job',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 200,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>NO JOB</p>
            </div>
            <div className="relative h-[50%] w-full px-1"></div>
          </div>
        ),
        renderCell: (props: any) => (
          <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
            {props.row.isAddRow
              ? ''
              : lookupOrderan.map((lookupOrderan, index) => (
                  <LookUpModal
                    key={index}
                    {...lookupOrderan}
                    label={`NO JOB ${props.rowIdx}`}
                    enableMultiSelect={true}
                    onSelectMultipleRows={(selectedRows) => {
                      // Kumpulkan semua updates dulu
                      const allUpdates: Array<{
                        index: number;
                        field: string;
                        value: string | number;
                      }> = [];

                      selectedRows.forEach((val, idx) => {
                        const targetRowIdx = props.rowIdx + idx;

                        // Kumpulkan semua field updates untuk row ini
                        allUpdates.push(
                          {
                            index: targetRowIdx,
                            field: 'job',
                            value: Number(val.id)
                          },
                          {
                            index: targetRowIdx,
                            field: 'job_nama',
                            value: val?.nobukti || ''
                          },
                          {
                            index: targetRowIdx,
                            field: 'tglorder',
                            value: val?.tglbukti || ''
                          },
                          {
                            index: targetRowIdx,
                            field: 'nocontainer',
                            value: val?.nocontainer || ''
                          },
                          {
                            index: targetRowIdx,
                            field: 'noseal',
                            value: val?.noseal || ''
                          },
                          {
                            index: targetRowIdx,
                            field: 'shipper_id',
                            value: Number(val?.shipper_id) || 0
                          },
                          {
                            index: targetRowIdx,
                            field: 'shipper_nama',
                            value: val?.shipper_nama || ''
                          },
                          {
                            index: targetRowIdx,
                            field: 'lokasistuffing',
                            value: Number(val?.lokasistuffing) || 0
                          },
                          {
                            index: targetRowIdx,
                            field: 'lokasistuffing_nama',
                            value: val?.lokasistuffing_nama || ''
                          }
                        );
                      });

                      // Update semua sekaligus dalam satu call
                      handleMultipleInputChange(allUpdates);
                    }}
                    lookupValue={(id) => {
                      handleInputChange(props.rowIdx, 'job', Number(id));
                    }}
                    notIn={{
                      nobukti: rows
                        .filter((row, idx) => {
                          return (
                            row?.job_nama &&
                            row?.job_nama !== '' &&
                            idx !== props.rowIdx // Exclude row saat ini
                          );
                        })
                        .map((row) => row?.job_nama)
                    }}
                    onSelectRow={(val) => {
                      handleInputChange(props.rowIdx, 'job_nama', val?.nobukti);
                      handleInputChange(
                        props.rowIdx,
                        'tglorder',
                        val?.tglbukti
                      );
                      handleInputChange(
                        props.rowIdx,
                        'nocontainer',
                        val?.nocontainer
                      );
                      handleInputChange(props.rowIdx, 'noseal', val?.noseal);
                      handleInputChange(
                        props.rowIdx,
                        'shipper_id',
                        Number(val?.shipper_id)
                      );
                      handleInputChange(
                        props.rowIdx,
                        'shipper_nama',
                        val?.shipper_nama
                      );
                      handleInputChange(
                        props.rowIdx,
                        'lokasistuffing',
                        Number(val?.lokasistuffing)
                      );
                      handleInputChange(
                        props.rowIdx,
                        'lokasistuffing_nama',
                        val?.lokasistuffing_nama
                      );
                    }}
                    onClear={() => {
                      handleInputChange(props.rowIdx, 'job_nama', '');
                      handleInputChange(props.rowIdx, 'tglorder', '');
                      handleInputChange(props.rowIdx, 'nocontainer', '');
                      handleInputChange(props.rowIdx, 'noseal', '');
                      handleInputChange(props.rowIdx, 'shipper_id', 0);
                      handleInputChange(props.rowIdx, 'shipper_nama', '');
                      handleInputChange(props.rowIdx, 'lokasistuffing', 0);
                      handleInputChange(
                        props.rowIdx,
                        'lokasistuffing_nama',
                        ''
                      );
                    }}
                    lookupNama={
                      props.row.job_nama
                        ? String(props.row.job_nama)
                        : undefined
                    }
                    inputLookupValue={Number(props.row.job_id)}
                  />
                ))}
          </div>
        )
      },
      {
        key: 'tglorder',
        name: 'tglorder',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>TGL ORDER</p>
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
                      value={props.row.tglorder}
                      showCalendar
                      disabled
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
        key: 'nocontainer',
        name: 'NO CONTAINER',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>NO CONTAINER</p>
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
                  value={props.row.nocontainer}
                  onKeyDown={inputStopPropagation}
                  onClick={(e) => e.stopPropagation()}
                  readOnly
                  className="h-2 min-h-9 w-full rounded border border-gray-300"
                />
              )}
            </div>
          );
        }
      },
      {
        key: 'noseal',
        name: 'NO SEAL',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>NO SEAL</p>
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
                  value={props.row.noseal}
                  onKeyDown={inputStopPropagation}
                  onClick={(e) => e.stopPropagation()}
                  readOnly
                  className="h-2 min-h-9 w-full rounded border border-gray-300"
                />
              )}
            </div>
          );
        }
      },
      {
        key: 'shipper',
        name: 'SHIPPER',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>SHIPPER</p>
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
                  value={props.row.shipper_nama}
                  onKeyDown={inputStopPropagation}
                  onClick={(e) => e.stopPropagation()}
                  readOnly
                  className="h-2 min-h-9 w-full rounded border border-gray-300"
                />
              )}
            </div>
          );
        }
      },
      {
        key: 'lokasistuffing',
        name: 'lokasistuffing',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>LOKASI STUFFING</p>
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
                  value={props.row.lokasistuffing_nama}
                  onKeyDown={inputStopPropagation}
                  onClick={(e) => e.stopPropagation()}
                  readOnly
                  className="h-2 min-h-9 w-full rounded border border-gray-300"
                />
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
            <div>
              {props.row.isAddRow ? (
                ''
              ) : (
                <Input
                  type="text"
                  value={props.row.keterangan}
                  readOnly={mode == 'delete' || mode == 'view'}
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
                // <FormField
                //   name="keterangan"
                //   control={forms.control}
                //   render={({ field }) => (
                //     <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                //       <div className="flex flex-col lg:w-full">
                //         <FormControl>
                //             <Input
                //               type="text"
                //               value={props.row.keterangan}
                //               onKeyDown={inputStopPropagation}
                //               onClick={(e) => e.stopPropagation()}
                //               onChange={(e) =>
                //                 handleInputChange(
                //                   props.rowIdx,
                //                   'keterangan',
                //                   e.target.value
                //                 )
                //               }
                //               className="h-2 min-h-9 w-full rounded border border-gray-300"
                //             />
                //         </FormControl>
                //         <FormMessage />
                //       </div>
                //     </FormItem>
                //   )}
                // />
              )}
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
    setFilters((prevFilters) => ({
      ...prevFilters,
      filters: {
        ...prevFilters.filters,
        jenisOrderan: selectedJenisOrderan
          ? String(selectedJenisOrderan)
          : String(JENISORDERMUATAN),
        jenisStatusJob: selectedJenisStatusJob
          ? String(selectedJenisStatusJob)
          : String(statusJobMasukGudang)
      }
    }));
  }, [selectedJenisOrderan, selectedJenisStatusJob]);

  useEffect(() => {
    if (allDataDetail && popOver) {
      if (allDataDetail?.data?.length > 0 && mode !== 'add') {
        // If there is data, add the data rows and the "Add Row" button row at the end
        const formattedRows = allDataDetail.data.map((item: any) => ({
          id: Number(item.id),
          job: Number(item.job) ?? '',
          job_nama: item.job_nama ?? '',
          tglorder: item.tglorder ?? '',
          nocontainer: item.nocontainer ?? '',
          noseal: item.noseal ?? '',
          shipper_id: Number(item.shipper_id) ?? '',
          shipper_nama: item.shipper_nama ?? '',
          lokasistuffing: Number(item.lokasistuffing) ?? '',
          lokasistuffing_nama: item.lokasistuffing_nama ?? '',
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
            id: 0, // Placeholder ID
            job: 0,
            job_nama: '',
            tglorder: '',
            nocontainer: '',
            noseal: '',
            shipper_id: 0,
            shipper_nama: '',
            lokasistuffing: 0,
            lokasistuffing_nama: '',
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

  useEffect(() => {
    if (popOver) {
      refetch();
    }
  }, [popOver]);

  useEffect(() => {
    if (forms.getValues()?.details?.length === 0) {
      setRows([
        {
          id: 0, // Placeholder ID
          job: 0,
          job_nama: '',
          tglorder: '',
          nocontainer: '',
          noseal: '',
          shipper_id: 0,
          shipper_nama: '',
          lokasistuffing_id: 0,
          lokasistuffing_nama: '',
          keterangan: '',
          isNew: true
        },
        { isAddRow: true, id: 'add_row', isNew: false } // Row for the "Add Row" button
      ]);
    }
  }, [forms, forms.getValues().details]);

  return (
    <Dialog open={popOver} onOpenChange={setPopOver}>
      <DialogTitle hidden={true}>Title</DialogTitle>
      <DialogContent className="flex h-full min-w-full flex-col overflow-hidden border bg-white">
        <div className="flex items-center justify-between bg-[#e0ecff] px-2 py-2">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {mode === 'add'
              ? 'Add Status Job'
              : mode === 'edit'
              ? 'Edit Status Job'
              : mode === 'delete'
              ? 'Delete Status Job'
              : 'View Status Job'}
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
                    name="tglstatus"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel
                          required={true}
                          className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]"
                        >
                          TANGGAL
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <InputDatePicker
                              value={field.value}
                              onChange={field.onChange}
                              showCalendar={true}
                              disabled={mode !== 'add'}
                              onSelect={(date) =>
                                forms.setValue('tglstatus', date)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="jenisorder_id"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel
                          required={true}
                          className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]"
                        >
                          JENIS ORDERAN
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          {lookupJenisOrder.map((props, index) => (
                            <LookUp
                              key={index}
                              {...props}
                              lookupNama={forms.getValues('jenisorder_nama')}
                              // lookupValue={(value: any) => {
                              //   forms.setValue('stuffingdepo', Number(value));
                              // }}
                              // onSelectRow={(val) => {
                              //   forms.setValue('stuffingdepo_nama', val?.text);
                              // }}
                              // onClear={() => {
                              //   forms.setValue('stuffingdepo_nama', '');
                              // }}
                              name="jenisorder_id"
                              forms={forms}
                            />
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="statusjob"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel
                          required={true}
                          className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]"
                        >
                          JENIS STATUS JOB
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          {lookupJenisStatusJob.map((props, index) => (
                            <LookUp
                              key={index}
                              {...props}
                              lookupNama={forms.getValues('statusjob_nama')}
                              name="statusjob"
                              forms={forms}
                            />
                          ))}
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
            loading={isLoadingCreate || isLoadingUpdate || isLoadingDelete}
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
              }}
              className="flex w-fit items-center gap-1 text-sm"
              loading={isLoadingCreate}
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

export default FormStatusJobMasukGudang;
