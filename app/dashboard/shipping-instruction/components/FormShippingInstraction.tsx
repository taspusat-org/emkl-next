import { FaSave } from 'react-icons/fa';
import { Input } from '@/components/ui/input';
import { RootState } from '@/lib/store/store';
import { Button } from '@/components/ui/button';
import LookUp from '@/components/custom-ui/LookUp';
import { useSelector, useDispatch } from 'react-redux';
import { IoMdClose, IoMdRefresh } from 'react-icons/io';
import { useEffect, useMemo, useRef, useState } from 'react';
import DataGrid, { Column, DataGridHandle } from 'react-data-grid';
import InputDatePicker from '@/components/custom-ui/InputDatePicker';
import {
  filterOrderanMuatan,
  OrderanMuatan
} from '@/lib/types/orderanHeader.type';
import { useGetAllOrderanMuatan } from '@/lib/server/useOrderanHeader';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { prosesShippingOrderanMuatanFn } from '@/lib/apis/orderanHeader.api';
import { JENISORDERMUATAN, statusJobMasukGudang } from '@/constants/statusjob';
import {
  ShippingInstructionDetail,
  ShippingInstructionDetailRincian
} from '@/lib/types/shippingIntruction.type';
import {
  setClearLookup,
  setSubmitClicked
} from '@/lib/store/lookupSlice/lookupSlice';
import FormLabel, {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form';
import {
  setProcessed,
  setProcessing
} from '@/lib/store/loadingSlice/loadingSlice';
import {
  useGetShippingInstructionDetail,
  useGetShippingInstructionDetailRincian
} from '@/lib/server/useShippingIntruction';
import {
  getAllShippingInstructionHeaderFn,
  getShippingInstructionDetailRincianFn
} from '@/lib/apis/shippinginstruction.api';

interface Filter {
  page: number;
  limit: number;
  search: string;
  filters: typeof filterOrderanMuatan;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

const FormShippingInstruction = ({
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
  const todayDate = new Date();
  const [dataGridKey, setDataGridKey] = useState(0);
  const [daftarBlValue, setDaftarBlValue] = useState(0);
  const [scheduleValue, setScheduleValue] = useState(0);
  const [notIn, setNotIn] = useState('');
  const [reloadForm, setReloadForm] = useState<boolean>(false);
  const [editingRowId, setEditingRowId] = useState(0); // Menyimpan ID baris yang sedang diedit
  const [editableValues, setEditableValues] = useState<Map<number, string>>(
    new Map()
  ); // Nilai yang sedang diedit untuk setiap baris
  const [rows, setRows] = useState<
    (
      | ShippingInstructionDetail
      | (Partial<ShippingInstructionDetail> & { isNew: boolean })
    )[]
  >([]);

  const [rowsDetailRincian, setRowsDetailRincian] = useState<
    (
      | ShippingInstructionDetail
      | (Partial<ShippingInstructionDetail> & { isNew: boolean })
    )[]
  >([]);

  const dispatch = useDispatch();
  const gridRef = useRef<DataGridHandle>(null);
  const formRef = useRef<HTMLFormElement | null>(null); // Ref untuk form
  const abortControllerRef = useRef<AbortController | null>(null); // AbortController untuk cancel request
  const openName = useSelector((state: RootState) => state.lookup.openName);
  const headerData = useSelector((state: RootState) => state.header.headerData);
  const detailData = useSelector((state: RootState) => state.header.detailData);
  const fmt = (date: Date) =>
    `${String(date.getDate()).padStart(2, '0')}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}-${date.getFullYear()}`;

  const [filters, setFilters] = useState<Filter>({
    page: 1,
    limit: 30,
    filters: {
      ...filterOrderanMuatan
    },
    search: '',
    sortBy: 'nobukti',
    sortDirection: 'asc'
  });

  const {
    data: allDataOrderanMuatan,
    isLoading: isLoadingOrderanMuatan,
    refetch
  } = useGetAllOrderanMuatan(
    { ...filters, page: 1 },
    abortControllerRef.current?.signal
  );

  const {
    data: allDataDetail,
    isLoading,
    refetch: refetchDetail
  } = useGetShippingInstructionDetail(headerData?.id ?? 0);

  const lookupPropsSchedule = [
    {
      columns: [
        { key: 'id', name: 'ID' },
        { key: 'kapal_nama', name: 'KAPAL' },
        { key: 'pelayaran_nama', name: 'PELAYARAN' },
        { key: 'voyberangkat', name: 'VOY BERANGKAT' },
        { key: 'tujuankapal_nama', name: 'TUJUAN' }
      ],
      labelLookup: 'SCHEDULE KAPAL LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: `schedule-kapal?join=orderanmuatan&${notIn}`,
      label: 'SCHEDULE KAPAL',
      singleColumn: false,
      pageSize: 20,
      disabled: mode === 'view' || mode === 'delete' ? true : false,
      postData: 'id',
      dataToPost: 'id'
    }
  ];

  const lookupTujuanKapal = [
    {
      columns: [{ key: 'nama', name: 'NAMA' }],
      labelLookup: 'TUJUAN KAPAL LOOKUP',
      required: true,
      showOnButton: false,
      showClearButton: false,
      selectedRequired: false,
      // endpoint: 'tujuankapal',
      singleColumn: false,
      pageSize: 20,
      disabled: true,
      postData: 'nama',
      dataToPost: 'id'
    }
  ];

  const lookupKapal = [
    {
      columns: [{ key: 'text', name: 'NAMA' }],
      labelLookup: 'KAPAL LOOKUP',
      required: true,
      showOnButton: false,
      showClearButton: false,
      selectedRequired: false,
      // endpoint: `kapal`,
      // label: 'KAPAL LOOKUP',
      singleColumn: true,
      pageSize: 20,
      disabled: true,
      postData: 'nama',
      dataToPost: 'id'
    }
  ];

  const inputStopPropagation = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };

  const handleOnFocus = (value: number, index: number) => {
    setDaftarBlValue(value);
    setEditingRowId(index);
  };

  const processOnReload = async () => {
    try {
      // forms.setValue(`details.detailsrincian`, []);
      // setRowsDetailRincian([])
      const tglbukti = forms.getValues('tglbukti');
      if (!scheduleValue || !tglbukti) {
        setReloadForm(false);
        setRows([]);
        setRowsDetailRincian([]);
        return;
      }

      dispatch(setProcessing());
      const test = await prosesShippingOrderanMuatanFn(Number(scheduleValue));
      setReloadForm(true);

      // await Promise.all(
      //   dataDaftarBL.map(async (data: any, index: number) => {
      //     setFilters((prev) => ({
      //       ...prev,
      //       filters: {
      //         ...prev.filters,
      //         schedule_id: String(scheduleValue),
      //         daftarbl_id: String(data.daftarbl_id)
      //       }
      //     }));

      //     // Tunggu refetch selesai
      //     const ref = await refetch();

      //     const rowsData = ref?.data?.data ?? [];
      //     // Kalau ada data, format untuk dimasukkan ke form
      //     if (rowsData.length > 0) {
      //       const formattedRows = rowsData.map((item: any) => ({
      //         id: Number(item.id),
      //         orderanmuatan_nobukti: item.nobukti ?? '',
      //         comodity: item.comodity ?? '',
      //         nocontainer: item.nocontainer ?? '',
      //         noseal: item.noseal ?? '',
      //         shipper_id: Number(item.shipper_id) ?? '',
      //         shipper_nama: item.shipper_nama ?? '',
      //         isNew: false
      //       }));

      //       // Set langsung ke form sesuai index barisnya
      //       forms.setValue(`details.${index}.detailsrincian`, formattedRows);
      //       return formattedRows;
      //     } else {
      //       forms.setValue(`details.${index}.detailsrincian`, []);
      //       return [];
      //     }
      //   })
      // );

      for (const [index, data] of test.data.entries()) {
        const daftarbl_id = data.daftarbl_id;
        // Update filter sebelum refetch
        setFilters((prevFilters) => ({
          ...prevFilters,
          filters: {
            ...prevFilters.filters,
            schedule_id: String(scheduleValue),
            daftarbl_id: daftarbl_id
          }
        }));

        // kasih jeda supaya state filters sempat update
        await new Promise((r) => setTimeout(r, 5));

        // Tunggu hasil refetch berdasarkan daftarbl_id saat ini
        const ref = await refetch();
        const rowsData = ref?.data?.data ?? [];

        const formattedRows = rowsData.map((item: any) => ({
          idOrderan: Number(item.id),
          orderanmuatan_nobukti: item.nobukti ?? '',
          keterangan: '',
          comodity: item.comodity ?? '',
          nocontainer: item.nocontainer ?? '',
          noseal: item.noseal ?? '',
          shipper_id: Number(item.shipper_id) ?? '',
          shipper_nama: item.shipper_nama ?? '',
          isNew: false
        }));

        // kasih jeda kecil biar React Hook Form sempat update internalnya
        await new Promise((r) => setTimeout(r, 5));

        forms.setValue(`details.${index}.detailsrincian`, formattedRows);
      }

      setDaftarBlValue(test.data[0].daftarbl_id);
      const rowsBaru = test.data.map((item: any, idx: number) => ({
        id: idx,
        orderan_id: Number(item.orderan_id) ?? 0,
        daftarbl_id: Number(item.daftarbl_id) ?? 0,
        containerpelayaran_id: Number(item.pelayarancontainer_id) ?? 0,
        emkllain_id: Number(item.emkllain_id) ?? 0,
        tujuankapal_id: Number(item.tujuankapal_id) ?? 0,
        shippinginstructiondetail_nobukti: '',
        asalpelabuhan: '',
        keterangan: '',
        consignee: '',
        shipper: '',
        comodity: '',
        notifyparty: '',
        totalgw: ''
      }));
      setRows(rowsBaru);

      dispatch(setProcessed());
    } catch (error) {
      console.log(error);
      setReloadForm(false);
      dispatch(setProcessed());
    } finally {
      dispatch(setProcessed());
    }
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

  const handleInputChangeDetailRincian = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setRowsDetailRincian((prevRows) => {
      const updatedData = [...prevRows];

      updatedData[index][field] = value;

      if (
        updatedData[index].isNew &&
        Object.values(updatedData[index]).every((val) => val !== '')
      ) {
        updatedData[index].isNew = false;
      }

      if (editingRowId !== null) {
        forms.setValue(`details.${editingRowId}.detailsrincian`, updatedData);
      }
      // else {
      //   forms.setValue(`details.0.detailsrincian`, updatedData);
      // }

      return updatedData;
    });
  };

  const columns = useMemo((): Column<ShippingInstructionDetail>[] => {
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
        key: 'shippinginstructiondetail_nobukti',
        name: 'shippinginstructiondetail_nobukti',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>nomor shipping</p>
            </div>
            {/* <div className="relative h-[50%] w-full px-1"></div> */}
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
                  value={props.row.shippinginstructiondetail_nobukti || ''}
                  disabled={true}
                  className="h-2 min-h-9 w-full rounded border border-gray-300"
                />
              )}
            </div>
          );
        }
      },
      {
        key: 'asalpelabuhan',
        name: 'asalpelabuhan',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>pelabuhan asal</p>
            </div>
            {/* <div className="relative h-[50%] w-full px-1"></div> */}
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
                  onFocus={() =>
                    handleOnFocus(props.row.daftarbl_id, props.rowIdx)
                  }
                  value={props.row.asalpelabuhan}
                  readOnly={mode == 'delete' || mode == 'view'}
                  onKeyDown={inputStopPropagation}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    handleInputChange(
                      props.rowIdx,
                      'asalpelabuhan',
                      e.target.value
                    );
                  }}
                  className="h-2 min-h-9 w-full rounded border border-gray-300"
                />
                // <FormField
                //   name="pelabuhanasal"
                //   control={forms.control}
                //   render={({ field }) => (
                //     <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                //       <div className="flex flex-col lg:w-full">
                //         <FormControl>
                //             <Input
                //               type="text"
                //               value={props.row.pelabuhanasal}
                //               onKeyDown={inputStopPropagation}
                //               onClick={(e) => e.stopPropagation()}
                //               onChange={(e) =>
                //                 handleInputChange(props.rowIdx, 'pelabuhanasal', e.target.value)
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
                  onFocus={() =>
                    handleOnFocus(props.row.daftarbl_id, props.rowIdx)
                  }
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
        key: 'consignee',
        name: 'consignee',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>consignee</p>
            </div>
            {/* <div className="relative h-[50%] w-full px-1"></div> */}
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
                  value={props.row.consignee}
                  readOnly={mode == 'delete' || mode == 'view'}
                  onFocus={() =>
                    handleOnFocus(props.row.daftarbl_id, props.rowIdx)
                  }
                  onKeyDown={inputStopPropagation}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    handleInputChange(props.rowIdx, 'consignee', e.target.value)
                  }
                  className="h-2 min-h-9 w-full rounded border border-gray-300"
                />
              )}
            </div>
          );
        }
      },
      {
        key: 'shipper',
        name: 'shipper',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>shipper</p>
            </div>
            {/* <div className="relative h-[50%] w-full px-1"></div> */}
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
                  value={props.row.shipper}
                  readOnly={mode == 'delete' || mode == 'view'}
                  onFocus={() =>
                    handleOnFocus(props.row.daftarbl_id, props.rowIdx)
                  }
                  onKeyDown={inputStopPropagation}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    handleInputChange(props.rowIdx, 'shipper', e.target.value)
                  }
                  className="h-2 min-h-9 w-full rounded border border-gray-300"
                />
              )}
            </div>
          );
        }
      },
      {
        key: 'comodity',
        name: 'comodity',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>comodity</p>
            </div>
            {/* <div className="relative h-[50%] w-full px-1"></div> */}
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
                  value={props.row.comodity}
                  readOnly={mode == 'delete' || mode == 'view'}
                  onFocus={() =>
                    handleOnFocus(props.row.daftarbl_id, props.rowIdx)
                  }
                  onKeyDown={inputStopPropagation}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    handleInputChange(props.rowIdx, 'comodity', e.target.value)
                  }
                  className="h-2 min-h-9 w-full rounded border border-gray-300"
                />
              )}
            </div>
          );
        }
      },
      {
        key: 'notifyparty',
        name: 'notifyparty',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>notify party</p>
            </div>
            {/* <div className="relative h-[50%] w-full px-1"></div> */}
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
                  value={props.row.notifyparty}
                  readOnly={mode == 'delete' || mode == 'view'}
                  onFocus={() =>
                    handleOnFocus(props.row.daftarbl_id, props.rowIdx)
                  }
                  onKeyDown={inputStopPropagation}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    handleInputChange(
                      props.rowIdx,
                      'notifyparty',
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
        key: 'totalgw',
        name: 'totalgw',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>total gw / nw</p>
            </div>
            {/* <div className="relative h-[50%] w-full px-1"></div> */}
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
                  value={props.row.totalgw}
                  readOnly={mode == 'delete' || mode == 'view'}
                  onFocus={() =>
                    handleOnFocus(props.row.daftarbl_id, props.rowIdx)
                  }
                  onKeyDown={inputStopPropagation}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    handleInputChange(props.rowIdx, 'totalgw', e.target.value)
                  }
                  className="h-2 min-h-9 w-full rounded border border-gray-300"
                />
              )}
            </div>
          );
        }
      }
      // {
      //   key: 'namapelayaran',
      //   name: 'namapelayaran',
      //   headerCellClass: 'column-headers',
      //   resizable: true,
      //   draggable: true,
      //   cellClass: 'form-input',
      //   width: 250,
      //   renderHeaderCell: () => (
      //     <div className="flex h-full cursor-pointer flex-col items-center gap-1">
      //       <div className="headers-cell h-[50%] px-8">
      //         <p className={`text-sm`}>namapelayaran</p>
      //       </div>
      //       {/* <div className="relative h-[50%] w-full px-1"></div> */}
      //     </div>
      //   ),
      //   renderCell: (props: any) => {
      //     return (
      //       <div>
      //         {props.row.isAddRow ? (
      //           ''
      //         ) : (
      //           <Input
      //             type="text"
      //             value={props.row.namapelayaran}
      //             readOnly={mode == 'delete' || mode == 'view'}
      //             onKeyDown={inputStopPropagation}
      //             onClick={(e) => e.stopPropagation()}
      //             onChange={(e) =>
      //               handleInputChange(
      //                 props.rowIdx,
      //                 'namapelayaran',
      //                 e.target.value
      //               )
      //             }
      //             className="h-2 min-h-9 w-full rounded border border-gray-300"
      //           />
      //           // <FormField
      //           //   name="namapelayaran"
      //           //   control={forms.control}
      //           //   render={({ field }) => (
      //           //     <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
      //           //       <div className="flex flex-col lg:w-full">
      //           //         <FormControl>
      //           //             <Input
      //           //               type="text"
      //           //               value={props.row.namapelayaran}
      //           //               onKeyDown={inputStopPropagation}
      //           //               onClick={(e) => e.stopPropagation()}
      //           //               onChange={(e) =>
      //           //                 handleInputChange(
      //           //                   props.rowIdx,
      //           //                   'namapelayaran',
      //           //                   e.target.value
      //           //                 )
      //           //               }
      //           //               className="h-2 min-h-9 w-full rounded border border-gray-300"
      //           //             />
      //           //         </FormControl>
      //           //         <FormMessage />
      //           //       </div>
      //           //     </FormItem>
      //           //   )}
      //           // />
      //         )}
      //       </div>
      //     );
      //   }
      // },

      // {
      //   key: 'shipper',
      //   name: 'SHIPPER',
      //   headerCellClass: 'column-headers',
      //   resizable: true,
      //   draggable: true,
      //   cellClass: 'form-input',
      //   width: 250,
      //   renderHeaderCell: () => (
      //     <div className="flex h-full cursor-pointer flex-col items-center gap-1">
      //       <div className="headers-cell h-[50%] px-8">
      //         <p className={`text-sm`}>SHIPPER</p>
      //       </div>
      //       {/* <div className="relative h-[50%] w-full px-1"></div> */}
      //     </div>
      //   ),
      //   renderCell: (props: any) => {
      //     return (
      //       <div className="m-0 flex h-full w-full cursor-pointer items-center p-0 text-xs">
      //         {props.row.isAddRow ? (
      //           ''
      //         ) : (
      //           <Input
      //             type="text"
      //             value={props.row.shipper_nama}
      //             onKeyDown={inputStopPropagation}
      //             onClick={(e) => e.stopPropagation()}
      //             readOnly
      //             className="h-2 min-h-9 w-full rounded border border-gray-300"
      //           />
      //         )}
      //       </div>
      //     );
      //   }
      // },
    ];
  }, [rows, editingRowId, editableValues]);

  const columnsDetailRincian = useMemo((): Column<OrderanMuatan>[] => {
    return [
      {
        key: 'nomor',
        name: 'NO',
        width: 50,
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        colSpan: (args) => {
          // if (args.type === 'ROW' && args.row.isAddRow) {
          //   return 5; // Spanning the "Add Row" button across 3 columns (adjust as needed)
          // }
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
        key: 'job',
        name: 'job',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>Job</p>
            </div>
            {/* <div className="relative h-[50%] w-full px-1"></div> */}
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
                  value={props.row.orderanmuatan_nobukti || ''}
                  readOnly={true}
                  className="h-2 min-h-9 w-full rounded border border-gray-300"
                />
              )}
            </div>
          );
        }
      },
      {
        key: 'comodity',
        name: 'comodity',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>comodity</p>
            </div>
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
                  value={props.row.comodity || ''}
                  readOnly={mode == 'delete' || mode == 'view'}
                  onKeyDown={inputStopPropagation}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    handleInputChangeDetailRincian(
                      props.rowIdx,
                      'comodity',
                      e.target.value
                    );
                  }}
                  className="h-2 min-h-9 w-full rounded border border-gray-300"
                />
              )}
            </div>
          );
        }
      },
      {
        key: 'keterangan',
        name: 'keterangan',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>keterangan</p>
            </div>
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
                  value={props.row.keterangan || ''}
                  readOnly={mode == 'delete' || mode == 'view'}
                  onKeyDown={inputStopPropagation}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    handleInputChangeDetailRincian(
                      props.rowIdx,
                      'keterangan',
                      e.target.value
                    );
                  }}
                  className="h-2 min-h-9 w-full rounded border border-gray-300"
                />
              )}
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
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>nocontainer</p>
            </div>
            {/* <div className="relative h-[50%] w-full px-1"></div> */}
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
                  value={props.row.nocontainer || ''}
                  readOnly={true}
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
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>noseal</p>
            </div>
            {/* <div className="relative h-[50%] w-full px-1"></div> */}
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
                  value={props.row.noseal || ''}
                  readOnly={true}
                  className="h-2 min-h-9 w-full rounded border border-gray-300"
                />
              )}
            </div>
          );
        }
      },
      {
        key: 'shipper',
        name: 'shipper',
        headerCellClass: 'column-headers',
        resizable: true,
        draggable: true,
        cellClass: 'form-input',
        width: 250,
        renderHeaderCell: () => (
          <div className="flex h-full cursor-pointer flex-col items-center gap-1">
            <div className="headers-cell h-[50%] px-8">
              <p className={`text-sm`}>shipper</p>
            </div>
            {/* <div className="relative h-[50%] w-full px-1"></div> */}
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
                  value={props.row.shipper_nama || ''}
                  readOnly={true}
                  className="h-2 min-h-9 w-full rounded border border-gray-300"
                />
              )}
            </div>
          );
        }
      }
    ];
  }, [rowsDetailRincian, editingRowId, editableValues]);

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
    const allDetails = forms.getValues('details');
    let activeDetail = allDetails?.[editingRowId];

    if (activeDetail?.detailsrincian) {
      setRowsDetailRincian(activeDetail.detailsrincian);
    }
  }, [editingRowId, reloadForm, rows]);

  useEffect(() => {
    if (rows) {
      const currentDetails = forms.getValues('details') || [];

      const mergedDetails = rows
        .filter((row) => row.id !== 'add_row') // Exclude rows with id "add_row"
        // .map(({ isNew, ...rest }) => ({
        //   ...rest
        // }));
        .map((row, index) => {
          const existing = currentDetails[index] || {}; // data lama dari form
          return {
            ...existing, // pertahankan detailsrincian, dsb
            ...row // timpa dengan data baru dari rows
          };
        });

      forms.setValue('details', mergedDetails);
    }
  }, [rows]);

  useEffect(() => {
    const fetchRincianForDetails = async () => {
      if (!allDataDetail || !popOver || mode === 'add') return;

      if (allDataDetail?.data?.length > 0) {
        // Format data detail utama (tanpa rincian)
        const formattedDetails = allDataDetail.data.map((item: any) => ({
          id: Number(item.id),
          daftarbl_id: Number(item.daftarbl_id) ?? '',
          containerpelayaran_id: Number(item.containerpelayaran_id) ?? '',
          emkllain_id: Number(item.emkllain_id) ?? '',
          tujuankapal_id: Number(item.tujuankapal_id) ?? '',
          shippinginstructiondetail_nobukti:
            item.shippinginstructiondetail_nobukti ?? '',
          asalpelabuhan: item.asalpelabuhan ?? '',
          keterangan: item.keterangan ?? '',
          consignee: item.consignee ?? '',
          shipper: item.shipper ?? '',
          comodity: item.comodity ?? '',
          notifyparty: item.notifyparty ?? '',
          totalgw: item.totalgw ?? '',
          isNew: false
        }));

        // Set detail utama dulu ke state/form
        setRows(formattedDetails);

        // Lalu refetch rincian untuk setiap detail
        for (const [index, detail] of allDataDetail.data.entries()) {
          try {
            setEditingRowId(0);
            // Tunggu refetch selesai
            const rincian = await getShippingInstructionDetailRincianFn(
              Number(detail.id),
              { search: '' }
            );
            const rowsData = rincian?.data ?? [];

            // Format data rincian
            const formattedRincian = rowsData.map((r: any) => ({
              id: Number(r.id),
              idOrderan: Number(r.id),
              orderanmuatan_nobukti: r.orderanmuatan_nobukti ?? '',
              keterangan: r.keterangan ?? '',
              comodity: r.comodity ?? '',
              nocontainer: r.nocontainer ?? '',
              noseal: r.noseal ?? '',
              shipper_id: Number(r.shipper_id) ?? '',
              shipper_nama: r.shipper_nama ?? '',
              isNew: false
            }));

            // Set ke form sesuai index detail
            forms.setValue(`details.${index}.detailsrincian`, formattedRincian);
          } catch (err) {
            console.error(`Gagal ambil rincian untuk detail ${detail.id}`, err);
          }
        }

        const allDetails = forms.getValues('details');
        let activeDetail = allDetails?.[0];

        if (activeDetail?.detailsrincian) {
          setRowsDetailRincian(activeDetail.detailsrincian);
        }
      }
    };

    fetchRincianForDetails();
  }, [allDataDetail, headerData?.id, popOver, mode]);

  useEffect(() => {
    const fetchAllShippingHeader = async () => {
      try {
        const allHeader = await getAllShippingInstructionHeaderFn({
          filters: {
            limit: 0,
            filters: {}
          }
        });

        const rowsData = allHeader?.data ?? [];
        const id = [
          ...rowsData
            .filter((row, idx) => {
              return (
                String(row?.schedule_id) && String(row?.schedule_id) !== ''
              );
            })
            .map((row) => row?.schedule_id)
        ];

        const jsonString = JSON.stringify({ id });
        setNotIn(`notIn=${jsonString}`);
      } catch (err) {
        console.error(
          `Gagal fetch all data shipping instruction header for get all schedule_id`,
          err
        );
      }
    };

    setEditingRowId(0);
    fetchAllShippingHeader();

    if (mode === 'add') {
      setRows([]);
      setScheduleValue(0);
      setDaftarBlValue(0);
      setRowsDetailRincian([]);
      setReloadForm(false);
      forms.setValue('tglbukti', fmt(todayDate));
    } else {
      setReloadForm(true);
    }
  }, [popOver, mode]);

  return (
    <Dialog open={popOver} onOpenChange={setPopOver}>
      <DialogTitle hidden={true}>Title</DialogTitle>
      <DialogContent className="flex h-full min-w-full flex-col overflow-hidden border bg-white">
        <div className="flex items-center justify-between bg-[#e0ecff] px-2 py-2">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {mode === 'add'
              ? 'Add Shipping Instruction'
              : mode === 'edit'
              ? 'Edit Shipping Instruction'
              : mode === 'delete'
              ? 'Delete Shipping Instruction'
              : 'View Shipping Instruction'}
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
                    name="nobukti"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          NO BUKTI
                        </FormLabel>
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
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel
                          required={true}
                          className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]"
                        >
                          TGL BUKTI
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <InputDatePicker
                              value={field.value}
                              onChange={field.onChange}
                              showCalendar={mode == 'add' || mode == 'edit'}
                              disabled={mode == 'delete' || mode == 'view'}
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

                  <FormField
                    name="schedule_id"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel
                          required={true}
                          className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]"
                        >
                          SCHEDULE
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          {lookupPropsSchedule.map((props, index) => (
                            <LookUp
                              key={index}
                              {...props}
                              lookupValue={(value: any) => {
                                forms.setValue('schedule_id', Number(value));
                              }}
                              onSelectRow={(val) => {
                                setReloadForm(false);
                                setScheduleValue(Number(val?.id));
                                // forms.setValue('schedule_id', Number(val?.id));
                                forms.setValue(
                                  'tglberangkat',
                                  val?.tglberangkat
                                );
                                forms.setValue(
                                  'voyberangkat',
                                  val?.voyberangkat
                                );
                                forms.setValue(
                                  'kapal_id',
                                  Number(val?.kapal_id)
                                );
                                forms.setValue('kapal_nama', val?.kapal_nama);
                                forms.setValue(
                                  'tujuankapal_id',
                                  Number(val?.tujuankapal_id)
                                );
                                forms.setValue(
                                  'tujuankapal_nama',
                                  val?.tujuankapal_nama
                                );
                              }}
                              onClear={() => {
                                setReloadForm(false);
                                setScheduleValue(0);
                                // forms.setValue('schedule_id', 0);
                                forms.setValue('tglberangkat', '');
                                forms.setValue('voyberangkat', '');
                                forms.setValue('kapal_id', 0);
                                forms.setValue('kapal_nama', '');
                                forms.setValue('tujuankapal_id', 0);
                                forms.setValue('tujuankapal_nama', '');
                              }}
                              name="schedule_id"
                              forms={forms}
                              lookupNama={forms.getValues('schedule_id')}
                            />
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="voyberangkat"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          VOY BERANGKAT
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ''}
                              type="text"
                              readOnly={true}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="kapal_id"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          KAPAL
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          {lookupKapal.map((props, index) => (
                            <LookUp
                              key={index}
                              {...props}
                              lookupNama={forms.getValues('kapal_nama')}
                              name="kapal_id"
                              forms={forms}
                            />
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="tglberangkat"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          TGL BERANGKAT
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <InputDatePicker
                              value={field.value}
                              onChange={field.onChange}
                              showCalendar={true}
                              disabled={true}
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
                    name="tujuankapal_id"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          TUJUAN
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          {lookupTujuanKapal.map((props, index) => (
                            <LookUp
                              key={index}
                              {...props}
                              lookupNama={forms.getValues('tujuankapal_nama')}
                              name="tujuankapal_id"
                              forms={forms}
                            />
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    variant="default"
                    className="mt-2 flex w-fit flex-row items-center justify-center"
                    onClick={(e) => {
                      e.preventDefault();
                      onSubmit();
                      setRows([]);
                      setRowsDetailRincian([]);
                      setReloadForm(false);
                      processOnReload();
                    }}
                  >
                    <IoMdRefresh />
                    <p style={{ fontSize: 12 }} className="font-normal">
                      PROSES
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
                          columns={columnsDetailRincian as any[]}
                          defaultColumnOptions={{
                            sortable: true,
                            resizable: true
                          }}
                          rows={rowsDetailRincian}
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
            variant="save"
            onClick={(e) => {
              e.preventDefault();
              onSubmit(false);
              dispatch(setSubmitClicked(true));
            }}
            disabled={mode === 'view'}
            loading={isLoadingCreate || isLoadingUpdate || isLoadingDelete}
          >
            <p className="text-center">
              {' '}
              {mode === 'delete' ? 'DELETE' : 'SAVE'}{' '}
            </p>
          </Button>

          {mode === 'add' && (
            <Button
              type="submit"
              variant="success"
              onClick={(e) => {
                e.preventDefault();
                onSubmit(true);
                dispatch(setSubmitClicked(true));
                setReloadForm(false);
                setRows([]);
                setRowsDetailRincian([]);
                setScheduleValue(0);
                setDaftarBlValue(0);
                setEditingRowId(0);
              }}
              className="flex w-fit items-center gap-1 text-sm"
              loading={isLoadingCreate}
            >
              <FaSave />
              <p className="text-center">SAVE & ADD</p>
            </Button>
          )}

          <Button type="button" variant="cancel" onClick={handleClose}>
            <p>Cancel</p>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormShippingInstruction;
