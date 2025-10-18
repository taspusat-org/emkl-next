import { FaSave, FaTimes } from 'react-icons/fa';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { IoMdClose, IoMdRefresh } from 'react-icons/io';
import { RootState } from '@/lib/store/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import LookUp from '@/components/custom-ui/LookUp';
import InputNumeric from '@/components/custom-ui/InputNumeric';
import DataGrid, { Column, DataGridHandle } from 'react-data-grid';
import {
  setClearLookup,
  setSubmitClicked
} from '@/lib/store/lookupSlice/lookupSlice';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import InputDatePicker from '@/components/custom-ui/InputDatePicker';
import {
  JENISORDERMUATAN,
  JENISORDERMUATANNAMA
} from '@/constants/bookingorderan';
import InputCurrency from '@/components/custom-ui/InputCurrency';
import { useLainnyaDialog } from '@/lib/store/client/useDialogLainnya';

const FormJobParty = ({
  forms,
  handleClose,
  setPopOver,
  reloadForm,
  setReloadForm,
  // popOver,
  onSubmit,
  isLoadingCreate // mode,
  // isLoadingUpdate,
} // isLoadingDelete
: any) => {
  const dispatch = useDispatch();
  const gridRef = useRef<DataGridHandle>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [partyCount, setPartyCount] = useState(0);
  const [dataGridKey, setDataGridKey] = useState(0);
  // const [reloadForm, setReloadForm] = useState<boolean>(false);
  const { mode: modeText, openForm } = useLainnyaDialog();
  const [editingRowId, setEditingRowId] = useState<number | null>(null); // Menyimpan ID baris yang sedang diedit
  const openName = useSelector((state: RootState) => state.lookup.openName);
  const [editableValues, setEditableValues] = useState<Map<number, string>>(
    new Map()
  ); // Nilai yang sedang diedit untuk setiap baris
  const [rows, setRows] = useState<any[]>([]);
  const { selectedJenisOrderan, selectedJenisOrderanNama } = useSelector(
    (state: RootState) => state.filter
  );

  const lookupMarketingJobParty = [
    {
      columns: [{ key: 'nama', name: 'NAMA' }],
      labelLookup: 'MARKETING LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'marketing',
      label: 'MARKETING_PARTY',
      singleColumn: true,
      pageSize: 20,
      // disabled: mode === 'view' || mode === 'delete' ? true : false,
      postData: 'nama',
      dataToPost: 'id'
    }
  ];

  const lookupContainerJobParty = [
    {
      columns: [{ key: 'nama', name: 'NAMA' }],
      labelLookup: 'CONTAINER LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'container',
      label: 'CONTAINER_PARTY',
      singleColumn: true,
      pageSize: 20,
      // disabled: mode === 'view' || mode === 'delete' ? true : false,
      postData: 'nama',
      dataToPost: 'id'
    }
  ];

  const lookupTujuanJobParty = [
    {
      columns: [{ key: 'nama', name: 'NAMA' }],
      labelLookup: 'TUJUAN KAPAL LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'tujuankapal',
      label: 'TUJUANKAPAL_PARTY',
      singleColumn: true,
      pageSize: 20,
      // disabled: mode === 'view' || mode === 'delete' ? true : false,
      postData: 'nama',
      dataToPost: 'id'
    }
  ];

  const lookupShipperJobParty = [
    {
      columns: [{ key: 'nama', name: 'NAMA' }],
      labelLookup: 'SHIPPER LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'shipper',
      label: 'SHIPPER_PARTY',
      singleColumn: true,
      pageSize: 20,
      // disabled: mode === 'view' || mode === 'delete' ? true : false,
      postData: 'nama',
      dataToPost: 'id'
    }
  ];

  const lookupScheduleJobParty = [
    {
      columns: [
        { key: 'kapal_nama', name: 'KAPAL' },
        { key: 'pelayaran_nama', name: 'PELAYARAN' },
        { key: 'voyberangkat', name: 'VOY BERANGKAT' }
      ],
      labelLookup: 'SCHEDULE KAPAL LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'schedule-kapal',
      singleColumn: false,
      pageSize: 20,
      // disabled: mode === 'view' || mode === 'delete' ? true : false,
      postData: 'id',
      dataToPost: 'id'
    }
  ];

  const lookupDaftarBlJobParty = [
    {
      columns: [{ key: 'nama', name: 'NAMA' }],
      labelLookup: 'DAFTAR BL LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'daftarbl',
      singleColumn: true,
      pageSize: 20,
      // disabled: mode === 'view' || mode === 'delete' ? true : false,
      postData: 'nama',
      dataToPost: 'id'
    }
  ];

  const lookupHargaTruckingJobParty = [
    {
      columns: [{ key: 'keterangan', name: 'NAMA' }],
      labelLookup: 'HARGA TRUCKING LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'hargatrucking',
      singleColumn: true,
      pageSize: 20,
      // disabled: mode === 'view' || mode === 'delete' ? true : false,
      postData: 'keterangan',
      dataToPost: 'id'
    }
  ];

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

  const columns = useMemo((): Column<any>[] => {
    return [
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
            return 15; // Spanning the "Add Row" button across 3 columns (adjust as needed)
          }
          return undefined; // For other rows, no column spanning
        },
        headerCellClass: 'column-headers',
        renderHeaderCell: () => (
          <div className="flex h-full flex-col items-center gap-1">
            <div className="headers-cell h-[50%] items-center justify-center text-center">
              <p className="text-sm">No.</p>
            </div>

            {/* <div className="flex h-[50%] w-full cursor-pointer items-center justify-center">
              <FaTimes className="bg-red-500 text-white" />
            </div> */}
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
        key: 'nocontainer',
        name: 'nocontainer',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 200,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>NO CONTAINER</p>
            </div>
            {/* <div className="relative h-[50%] w-full px-1"></div> */}
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
                  onChange={(e) =>
                    handleInputChange(
                      props.rowIdx,
                      'nocontainer',
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
        key: 'noseal',
        name: 'noseal',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 200,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>NO SEAL</p>
            </div>
            {/* <div className="relative h-[50%] w-full px-1"></div> */}
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
                  onChange={(e) =>
                    handleInputChange(props.rowIdx, 'noseal', e.target.value)
                  }
                  className="h-2 min-h-9 w-full rounded border border-gray-300"
                />
              )}
            </div>
          );
        }
      },
      {
        key: 'schedule_id',
        name: 'schedule_id',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 400,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>SCHEDULE ID</p>
            </div>
            {/* <div className="relative h-[50%] w-full px-1"></div> */}
          </div>
        ),
        renderCell: (props: any) => (
          <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
            {props.row.isAddRow
              ? ''
              : lookupScheduleJobParty.map((propsScheduleLookup, index) => (
                  <LookUp
                    key={index}
                    {...propsScheduleLookup}
                    label={`SCHEDULE_PARTY_${props.rowIdx}`} // Ensure you use row.id or rowIdx for unique labeling
                    lookupValue={(id) => {
                      handleInputChange(
                        props.rowIdx,
                        'schedule_id',
                        Number(id)
                      );
                    }}
                    onSelectRow={(val) => {
                      console.log('onselect', val);

                      handleInputChange(
                        props.rowIdx,
                        'schedule_nama',
                        String(val?.id)
                      );
                      handleInputChange(
                        props.rowIdx,
                        'kapal',
                        Number(val?.kapal_id)
                      );
                      handleInputChange(
                        props.rowIdx,
                        'kapal_nama',
                        val?.kapal_nama
                      );
                      handleInputChange(
                        props.rowIdx,
                        'pelayarancontainer_id',
                        Number(val?.pelayaran_id)
                      );
                      handleInputChange(
                        props.rowIdx,
                        'pelayarancontainer_nama',
                        val?.pelayaran_nama
                      );
                      handleInputChange(
                        props.rowIdx,
                        'voyberangkat',
                        val?.voyberangkat
                      );
                      handleInputChange(
                        props.rowIdx,
                        'tglberangkat',
                        val?.tglberangkat
                      );
                    }}
                    onClear={() => {
                      handleInputChange(props.rowIdx, 'schedule_nama', '');
                      handleInputChange(props.rowIdx, 'kapal', 0);
                      handleInputChange(props.rowIdx, 'kapal_nama', '');
                      handleInputChange(
                        props.rowIdx,
                        'pelayarancontainer_id',
                        ''
                      );
                      handleInputChange(
                        props.rowIdx,
                        'pelayarancontainer_nama',
                        ''
                      );
                      handleInputChange(props.rowIdx, 'voyberangkat', '');
                      handleInputChange(props.rowIdx, 'tglberangkat', '');
                    }}
                    lookupNama={
                      props.row.schedule_nama
                        ? String(props.row.schedule_nama)
                        : undefined
                    }
                    // name="schedule_id"
                    forms={forms}
                    inputLookupValue={Number(props.row.schedule_id)}
                  />
                ))}
          </div>
        )
      },
      {
        key: 'kapal',
        name: 'kapal',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>KAPAL</p>
            </div>
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
                  value={props.row.kapal_nama}
                  onKeyDown={inputStopPropagation}
                  readOnly={true}
                  className="h-2 min-h-9 w-full rounded border border-gray-300"
                />
              )}
            </div>
          );
        }
      },
      {
        key: 'pelayarancontainer',
        name: 'pelayarancontainer',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>PELAYARAN</p>
            </div>
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
                  readOnly={true}
                  value={props.row.pelayarancontainer_nama}
                  onKeyDown={inputStopPropagation}
                  className="h-2 min-h-9 w-full rounded border border-gray-300"
                />
              )}
            </div>
          );
        }
      },
      {
        key: 'voyberangkat',
        name: 'voyberangkat',
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
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.isAddRow ? (
                ''
              ) : (
                <Input
                  readOnly={true}
                  type="text"
                  value={props.row.voyberangkat}
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
        key: 'tglberangkat',
        name: 'tglberangkat',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>tglberangkat</p>
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.isAddRow ? (
                ''
              ) : (
                <Input
                  readOnly={true}
                  type="text"
                  value={props.row.tglberangkat}
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
        key: 'daftarbl_id',
        name: 'daftarbl_id',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 200,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>KODE SHIPPER</p>
            </div>
          </div>
        ),
        renderCell: (props: any) => (
          <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
            {props.row.isAddRow
              ? ''
              : lookupDaftarBlJobParty.map((propsdaftarblLookup, index) => (
                  <LookUp
                    key={index}
                    {...propsdaftarblLookup}
                    label={`DAFTARBL_PARTY_${props.rowIdx}`} // Ensure you use row.id or rowIdx for unique labeling
                    lookupValue={(id) => {
                      handleInputChange(
                        props.rowIdx,
                        'daftarbl_id',
                        Number(id)
                      );
                    }}
                    onSelectRow={(val) => {
                      handleInputChange(
                        props.rowIdx,
                        'daftarbl_nama',
                        val?.nama
                      );
                    }}
                    lookupNama={
                      props.row.daftarbl_nama
                        ? String(props.row.daftarbl_nama)
                        : undefined
                    }
                    // name="daftarbl_id"
                    forms={forms}
                    inputLookupValue={Number(props.row.daftarbl_id)}
                  />
                ))}
          </div>
        )
      },
      {
        key: 'hargatrucking',
        name: 'hargatrucking',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 200,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>HARGA TRUCKING</p>
            </div>
          </div>
        ),
        renderCell: (props: any) => (
          <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
            {lookupHargaTruckingJobParty.map(
              (propshargatruckingLookup, index) => (
                <LookUp
                  key={index}
                  {...propshargatruckingLookup}
                  label={`HARGATRUCKING_PARTY_${props.rowIdx}`} // Ensure you use row.id or rowIdx for unique labeling
                  lookupValue={(id) => {
                    handleInputChange(
                      props.rowIdx,
                      'hargatrucking',
                      Number(id)
                    );
                  }}
                  onSelectRow={(val) => {
                    console.log('onselect schedule', val);
                    handleInputChange(
                      props.rowIdx,
                      'hargatrucking_nama',
                      val?.keterangan
                    );
                    handleInputChange(
                      props.rowIdx,
                      'nominalstuffing',
                      String(val?.nominal)
                    );
                    handleInputChange(
                      props.rowIdx,
                      'lokasistuffing',
                      Number(val?.id)
                    );
                    handleInputChange(
                      props.rowIdx,
                      'lokasistuffing_nama',
                      val?.emkl_text
                    );
                  }}
                  onClear={() => {
                    handleInputChange(props.rowIdx, 'hargatrucking_nama', '');
                    handleInputChange(props.rowIdx, 'nominalstuffing', '');
                    handleInputChange(props.rowIdx, 'lokasistuffing', '');
                    handleInputChange(props.rowIdx, 'lokasistuffing_nama', '');
                  }}
                  lookupNama={
                    props.row.hargatrucking_nama
                      ? String(props.row.hargatrucking_nama)
                      : undefined
                  }
                  // name="hargatrucking"
                  forms={forms}
                  inputLookupValue={Number(props.row.hargatrucking)}
                />
              )
            )}
          </div>
        )
      },
      {
        key: 'trucking',
        name: 'trucking',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>TRUCKING</p>
            </div>
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              <InputCurrency
                value={props.row.nominalstuffing}
                // onValueChange={(val) => {
                //   field.onChange(val);
                // }}
                readOnly={true}
              />
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
          </div>
        ),
        renderCell: (props: any) => {
          return (
            <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
              {props.row.isAddRow ? (
                ''
              ) : (
                <Input
                  readOnly={true}
                  type="text"
                  value={props.row.lokasistuffing_nama}
                  onKeyDown={inputStopPropagation}
                  className="h-2 min-h-9 w-full rounded border border-gray-300"
                />
              )}
            </div>
          );
        }
      }
    ];
  }, [rows, editingRowId, editableValues]);

  const processOnReload = () => {
    const marketing = forms.getValues('marketing_id');
    const tujuan = forms.getValues('tujuankapal_id');
    const party = forms.getValues('party');
    const estMuat = forms.getValues('estmuat');
    const container = forms.getValues('container_id');
    const shipper = forms.getValues('shipper_id');
    const tanggal = forms.getValues('tglbukti');
    const asalMuat = forms.getValues('asalmuatan');
    console.log(
      'marketing',
      marketing,
      'tujuan',
      tujuan,
      'partyCount',
      partyCount,
      'estMuat',
      estMuat,
      'container',
      container,
      'shipper',
      shipper,
      'tanggal',
      tanggal,
      'asalMuat',
      asalMuat
    );

    try {
      dispatch(setClearLookup(true));

      if (
        marketing &&
        tujuan &&
        partyCount &&
        estMuat &&
        container &&
        // shipper
        tanggal &&
        asalMuat
      ) {
        console.log('MASUK SINIII');
        setReloadForm(true);

        const rowsBaru = Array.from({ length: partyCount }, (_, idx) => ({
          id: idx,
          nocontainer: '',
          noseal: '',
          schedule_id: null,
          schedule_nama: '',
          kapal: '',
          kapal_nama: '',
          pelayarancontainer_id: null,
          pelayarancontainer_nama: '',
          voyberangkat: '',
          tglberangkat: '',
          daftarbl_id: null,
          daftarbl_nama: '',
          hargatrucking: '',
          hargatrucking_nama: '',
          nominalstuffing: '',
          lokasistuffing: '',
          lokasistuffing_nama: ''
        }));

        setRows(rowsBaru);
      } else {
        setReloadForm(false);
      }
    } catch (error) {
      console.log(error);
      setReloadForm(false);
    }
  };

  useEffect(() => {
    forms.setValue('nobukti', '');
    forms.setValue('jenisorder_id', JENISORDERMUATAN);
    forms.setValue('jenisorder_nama', JENISORDERMUATANNAMA);

    if (partyCount != 0) {
      setPartyCount(0);
    }
  }, [forms, openForm]);

  useEffect(() => {
    if (rows) {
      forms.setValue('details', rows);
    }
  }, [rows]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Fungsi untuk menangani pergerakan fokus berdasarkan tombol
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

  return (
    <Dialog
      open={openForm}
      onOpenChange={
        setPopOver ||
        useLainnyaDialog.setState({ openForm: false, open: false })
      }
    >
      <DialogTitle hidden={true}>Title</DialogTitle>
      <DialogContent className="flex h-full min-w-full flex-col overflow-hidden border bg-white">
        <div className="flex items-center justify-between bg-[#e0ecff] px-2 py-2">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {`add ${modeText}`}
          </h2>
          <div
            className="cursor-pointer rounded-md border border-zinc-200 bg-red-500 p-0 hover:bg-red-400"
            onClick={() => {
              setPopOver(false);
              handleClose();
              // useLainnyaDialog.setState({ openForm: false });
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
                    <div className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                      <div>
                        <FormLabel
                          required={true}
                          className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[30%]"
                        >
                          MARKETING
                        </FormLabel>
                      </div>
                      <div className="lg:w-[70%]">
                        {lookupMarketingJobParty.map((props, index) => (
                          <LookUp
                            key={index}
                            {...props}
                            lookupValue={(value: any) => {
                              forms.setValue('marketing_id', Number(value));
                            }}
                            onSelectRow={(val) => {
                              forms.setValue('marketing_nama', val?.nama);
                            }}
                            onClear={() => {
                              forms.setValue('marketing_nama', '');
                            }}
                            name="marketing_id"
                            forms={forms}
                            lookupNama={forms.getValues('marketing_nama')}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex w-full flex-col justify-between lg:ml-4 lg:flex-row lg:items-center">
                      <div>
                        <FormLabel
                          required={true}
                          className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[30%]"
                        >
                          CONTAINER
                        </FormLabel>
                      </div>
                      <div className="lg:w-[70%]">
                        {lookupContainerJobParty.map((props, index) => (
                          <LookUp
                            key={index}
                            {...props}
                            lookupValue={(value: any) => {
                              forms.setValue('container_id', Number(value));
                            }}
                            onSelectRow={(val) => {
                              forms.setValue('container_nama', val?.nama);
                            }}
                            onClear={() => {
                              forms.setValue('container_nama', '');
                            }}
                            name="container_id"
                            forms={forms}
                            lookupNama={forms.getValues('container_nama')}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row">
                    <div className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                      <div>
                        <FormLabel
                          required={true}
                          className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[30%]"
                        >
                          TUJUAN/PORT
                        </FormLabel>
                      </div>
                      <div className="lg:w-[70%]">
                        {lookupTujuanJobParty.map((props, index) => (
                          <LookUp
                            key={index}
                            {...props}
                            lookupValue={(value: any) => {
                              forms.setValue('tujuankapal_id', Number(value));
                            }}
                            onSelectRow={(val) => {
                              forms.setValue('tujuankapal_nama', val?.nama);
                            }}
                            onClear={() => {
                              forms.setValue('tujuankapal_nama', '');
                            }}
                            name="tujuankapal_id"
                            forms={forms}
                            lookupNama={forms.getValues('tujuankapal_nama')}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex w-full flex-col justify-between lg:ml-4 lg:flex-row lg:items-center">
                      <div>
                        <FormLabel
                          required={true}
                          className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[30%]"
                        >
                          SHIPPER
                        </FormLabel>
                      </div>
                      <div className="lg:w-[70%]">
                        {lookupShipperJobParty.map((props, index) => (
                          <LookUp
                            key={index}
                            {...props}
                            lookupValue={(value: any) => {
                              forms.setValue('shipper_id', Number(value));
                            }}
                            onSelectRow={(val) => {
                              forms.setValue('shipper_nama', val?.nama);
                            }}
                            onClear={() => {
                              forms.setValue('shipper_nama', '');
                            }}
                            name="shipper_id"
                            forms={forms}
                            lookupNama={forms.getValues('shipper_nama')}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row">
                    <FormField
                      name="party"
                      control={forms.control}
                      render={({ field }) => (
                        <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                          <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[30%]">
                            PARTY
                          </FormLabel>
                          <div className="flex flex-col lg:w-[70%]">
                            <FormControl>
                              <InputNumeric
                                value={field.value ?? ''}
                                onValueChange={(value: any) => {
                                  forms.setValue('party', Number(value));
                                  setPartyCount(Number(value));
                                }}
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
                            TANGGAL
                          </FormLabel>
                          <div className="flex flex-col lg:w-[70%]">
                            <FormControl>
                              <InputDatePicker
                                value={field.value}
                                onChange={field.onChange}
                                showCalendar={true}
                                onSelect={(date) => {
                                  forms.setValue('tanggal', date);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex flex-row">
                    <FormField
                      name="estmuat"
                      control={forms.control}
                      render={({ field }) => (
                        <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                          <FormLabel
                            required={true}
                            className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[30%]"
                          >
                            EST MUAT
                          </FormLabel>
                          <div className="flex flex-col lg:w-[70%]">
                            <FormControl>
                              <InputDatePicker
                                value={field.value}
                                onChange={field.onChange}
                                showCalendar={true}
                                onSelect={(date) => {
                                  forms.setValue('estmuat', date);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="asalmuatan"
                      control={forms.control}
                      render={({ field }) => (
                        <FormItem className="flex w-full flex-col justify-between lg:ml-4 lg:flex-row lg:items-center">
                          <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[30%]">
                            ASAL MUATAN
                          </FormLabel>
                          <div className="flex flex-col lg:w-[70%]">
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value ?? ''}
                                type="text"
                              />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="default"
                    className="mt-2 flex w-fit flex-row items-center justify-center"
                    // onClick={onSubmit}
                    onClick={(e) => {
                      e.preventDefault();
                      onSubmit();
                      // setReloadForm(true)
                      processOnReload();
                    }}
                  >
                    <IoMdRefresh />
                    <p style={{ fontSize: 12 }} className="font-normal">
                      Reload
                    </p>
                  </Button>

                  {reloadForm && (
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
                  )}
                </div>
              </form>
            </Form>
          </div>
        </div>

        <div className="m-0 flex h-fit items-end gap-2 bg-zinc-200 px-3 py-2">
          <Button
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              onSubmit();
              dispatch(setSubmitClicked(true));
            }}
            className="flex w-fit items-center gap-1 text-sm"
            loading={isLoadingCreate}
          >
            <FaSave />
            <p className="text-center">SAVE</p>
          </Button>

          <Button
            type="button"
            variant="secondary"
            className="flex w-fit items-center gap-1 bg-zinc-500 text-sm text-white hover:bg-zinc-400"
            onClick={(e) => {
              handleClose();
              setReloadForm(false);
              setPartyCount(0);
            }}
          >
            <IoMdClose /> <p className="text-center text-white">Cancel</p>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormJobParty;
