import LookUp from '@/components/custom-ui/LookUp';
import { FileUploader } from '@/components/file-uploader';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle
} from '@/components/ui/dialog';
import ImageDropzone from '@/components/ui/dropzone copy';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  useGetKaryawanVaksin,
  useUpdateKaryawanVaksinFn
} from '@/lib/server/useKaryawan';
import { RootState } from '@/lib/store/store';
import React, { useEffect, useMemo, useState } from 'react';
import {
  FaPlus,
  FaSave,
  FaSort,
  FaSortDown,
  FaSortUp,
  FaTimes,
  FaTrash
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { CalendarIcon } from '@radix-ui/react-icons';
import InputMask from 'react-input-mask';
import { Calendar } from '@/components/ui/calendar';
import { formatDateCalendar, parseDateFromDDMMYYYY } from '@/lib/utils';
import { IoMdClose } from 'react-icons/io';
interface Row {
  id: number;
  karyawan_id: number;
  tglvaksin: string;
  filefoto: File[] | string[];
  keterangan: string;
  statusaktif: number;
  info: string;
  isNew?: boolean;
  [key: string]: string | number | boolean | undefined | any;
}

const FormVaksin = ({ popOverTable, setPopOverTable }: any) => {
  const headerData = useSelector((state: RootState) => state.header.headerData);
  const { user } = useSelector((state: RootState) => state.auth);

  const {
    data: vaksin,
    isLoading: isLoading,
    refetch
  } = useGetKaryawanVaksin(headerData?.id ?? user.karyawan_id, 'vaksin');
  const { mutate: updateKaryawan, isLoading: isLoadingUpdate } =
    useUpdateKaryawanVaksinFn();
  interface Filters {
    filters: {
      [key: string]: string;
      tglvaksin: string;
      keterangan: string; // year type
      info: string;
    };
    sortBy: string;
    sortDirection: string;
    globalSearch: string;
  }
  const [popOverTglLahirState, setPopOverTglLahirState] = useState<{
    [key: number]: boolean;
  }>({});

  const [filters, setFilters] = useState<Filters>({
    filters: {
      tglvaksin: '',
      keterangan: '',
      info: ''
    },
    sortBy: '',
    sortDirection: 'asc',
    globalSearch: ''
  });

  const [rows, setRows] = useState<Row[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const addRow = () => {
    // Check if all fields are empty
    const lastRowIndex = rows.length - 1;
    const isTglVaksinEmpty = rows[lastRowIndex]?.tglvaksin === '';
    const isFileFotoEmpty = rows[lastRowIndex]?.filefoto.length <= 0;

    // Set the error message if the last row is empty
    if (isTglVaksinEmpty && isFileFotoEmpty) {
      setErrorMessage('Field ini tidak boleh kosong sebelum menambah baris');
      return; // Stop adding row if validation fails
    }
    // Reset the error message if validation passes
    setErrorMessage('');

    const newRows: Row = {
      id: 0,
      karyawan_id: Number(user.karyawan_id ?? headerData?.id),
      tglvaksin: '',
      filefoto: [],
      keterangan: '',
      statusaktif: 0,
      info: '',
      isNew: true
    };

    setRows((prevRows) => [...prevRows, newRows]);
  };
  const renderErrorMessage = (index: number) => {
    if (
      index === rows.length - 1 &&
      (rows[index].tglvaksin === '' || rows[index].filefoto.length === 0)
    ) {
      return (
        <span className="text-xs text-red-500">
          Field ini tidak boleh kosong sebelum menambah baris
        </span>
      );
    }
    return null;
  };
  const onSuccess = () => {
    setPopOverTable(false);
    refetch();
  };
  const onSubmit = (values: any) => {
    // Remove the 'isNew' field from each row before sending it for update
    const updatedValues = values.map((row: any) => {
      const { isNew, filefoto, ...rest } = row;

      // Periksa apakah filefoto berisi objek File atau URL
      const fileNames = filefoto.map((file: any) => {
        if (typeof file === 'string') {
          // Jika file adalah URL, ambil nama file dari URL
          return file.split('/').pop();
        } else if (file instanceof File) {
          // Jika file adalah objek File, ambil nama file menggunakan file.name
          return file;
        }
        return null; // Jika data tidak valid
      });

      return { ...rest, filefoto: fileNames }; // Return the object without the 'isNew' field, and only file names in filefoto
    });

    // Call the update function with the updated values in the desired format
    updateKaryawan(updatedValues, {
      onSuccess
    });
  };

  const lookUpProps = [
    {
      columns: [{ key: 'text', name: 'TEXT' }],
      // filterby: { class: 'system', method: 'get' },
      selectedRequired: false,
      endpoint: 'parameter?grp=status+aktif',
      singleColumn: true,
      pageSize: 20,
      showOnButton: true,
      postData: 'text'
    }
  ];
  const lookUpPropsPendidikan = [
    {
      columns: [
        { key: 'grp', name: 'GROUP' },
        { key: 'subgrp', name: 'SUB GROUP' },
        { key: 'kelompok', name: 'KELOMPOK' },
        { key: 'text', name: 'TEXT' }
      ],
      // filterby: { class: 'system', method: 'get' },
      selectedRequired: false,
      endpoint: 'parameter?grp=PENDIDIKAN',
      singleColumn: false,
      pageSize: 20,
      showOnButton: true,
      postData: 'grp'
    }
  ];
  const handleInputChange = (
    index: number,
    field: string,
    value: string | number | File | File[] | null | any // Modify to accept File[]
  ) => {
    setRows((prevRows) => {
      const updatedInvoices = [...prevRows];

      if (field === 'filefoto' && Array.isArray(value)) {
        // Jika nilai yang diberikan adalah array, simpan sebagai array filefoto
        updatedInvoices[index][field] = value;
      } else {
        updatedInvoices[index][field] = value;
      }

      if (
        updatedInvoices[index].isNew &&
        Object.values(updatedInvoices[index]).every((val) => val !== '')
      ) {
        updatedInvoices[index].isNew = false;
      }

      return updatedInvoices;
    });
  };

  const deleteRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleGlobalSearchChange = (value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      globalSearch: value
    }));
  };

  const handleColumnFilterChange = (field: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      filters: {
        ...prevFilters.filters,
        [field]: value
      }
    }));
  };

  const handleSort = (column: string) => {
    const newSortDirection =
      filters.sortBy === column && filters.sortDirection === 'asc'
        ? 'desc'
        : 'asc';

    setFilters((prevFilters) => ({
      ...prevFilters,
      sortBy: column,
      sortDirection: newSortDirection
    }));
  };

  const filteredInvoices = useMemo(() => {
    return rows.filter((invoice) => {
      const globalMatch = Object.values(invoice)
        .join(' ')
        .toLowerCase()
        .includes(filters.globalSearch.toLowerCase());

      const columnMatch = Object.keys(filters.filters).every(
        (key) =>
          invoice[key as keyof Row]
            ?.toString()
            .toLowerCase()
            .includes(filters.filters[key]?.toLowerCase() || '')
      );

      return globalMatch && columnMatch;
    });
  }, [rows, filters]);

  const sortedInvoices = useMemo(() => {
    const existingInvoices = filteredInvoices.filter(
      (invoice) => !Object.values(invoice).some((val) => val === '') // Data lengkap dianggap existing
    );

    const newInvoices = filteredInvoices.filter(
      (invoice) => Object.values(invoice).some((val) => val === '') // Data tidak lengkap dianggap baru
    );

    // Sort hanya data existing
    const sortedExisting = existingInvoices.sort((a, b) => {
      const column = filters.sortBy as keyof Row;
      const direction = filters.sortDirection === 'asc' ? 1 : -1;

      const valueA = a[column]?.toString().toLowerCase() || '';
      const valueB = b[column]?.toString().toLowerCase() || '';

      if (valueA < valueB) return -1 * direction;
      if (valueA > valueB) return 1 * direction;
      return 0;
    });

    // Gabungkan data existing dan data baru
    return [...sortedExisting, ...newInvoices];
  }, [filteredInvoices, filters.sortBy, filters.sortDirection]);

  const highlightText = (text: string, filter: string) => {
    if (!filter) return text;

    const regex = new RegExp(`(${filter})`, 'gi');
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <mark key={index} className="bg-yellow-200 text-black">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };
  useEffect(() => {
    if (vaksin) {
      if (vaksin?.data?.length > 0) {
        const formattedRows = vaksin?.data?.map((item: any) => {
          // Parse filefoto if it's a string or JSON
          const fileNames = Array.isArray(item.filefoto)
            ? item.filefoto
            : item.filefoto
            ? JSON.parse(item.filefoto)
            : [];

          // Map each file name to a URL
          const fileUrls = fileNames.map(
            (filename: string) =>
              `${process.env.NEXT_PUBLIC_IMG_URL}${filename}`
          );

          return {
            id: item.id,
            karyawan_id: headerData?.id ?? user.karyawan_id,
            tglvaksin: item.tglvaksin ?? '',
            filefoto: fileUrls,
            keterangan: item.keterangan ?? '',
            statusaktif: item.statusaktif ?? null,
            info: item.info ?? '',
            isNew: false
          };
        });

        setRows(formattedRows);
      } else {
        // Add a default row if data is empty
        setRows([
          {
            id: 0,
            karyawan_id: Number(user.karyawan_id ?? headerData?.id),
            tglvaksin: '',
            filefoto: [],
            keterangan: '',
            statusaktif: 0,
            info: '',
            isNew: true
          }
        ]);
      }
    } else if (!headerData?.id) {
      setRows([]); // Reset rows if no vaksin or headerData
    }
  }, [vaksin, headerData?.id, user.karyawan_id]);

  return (
    <Dialog open={popOverTable} onOpenChange={setPopOverTable}>
      <DialogTitle hidden={true}>Title</DialogTitle>
      <DialogContent className="flex h-full min-w-full flex-col overflow-hidden border bg-white">
        <div className="flex items-center justify-between bg-[#e0ecff] px-2 py-2">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Form Vaksin
          </h2>
          <div
            className="cursor-pointer rounded-md border border-zinc-200 bg-red-500 p-0 hover:bg-red-400"
            onClick={() => {
              setPopOverTable(false);
            }}
          >
            <IoMdClose className="h-5 w-5 font-bold text-white" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-zinc-200 px-1">
          <div className="flex h-[100%] w-full flex-col rounded-sm border border-blue-500 bg-white">
            {/* Global Search */}
            <div
              className="flex h-[38px] w-full items-center rounded-t-sm border-b border-blue-500 px-2"
              style={{
                background:
                  'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 100%)'
              }}
            >
              <label htmlFor="globalSearch" className="text-xs text-zinc-600">
                SEARCH :
              </label>
              <Input
                id="globalSearch"
                className="m-2 h-[28px] w-[200px] rounded-sm bg-white text-black"
                placeholder="Type to search globally..."
                value={filters.globalSearch}
                onChange={(e) => handleGlobalSearchChange(e.target.value)}
              />
            </div>

            <Table className="border-collapse border border-blue-500">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] border border-blue-500">
                    Actions
                  </TableHead>
                  {[
                    'tglvaksin',
                    'filefoto',
                    'keterangan',
                    'statusaktif',
                    'info'
                  ].map((field) => {
                    const headerLabelMap: { [key: string]: string } = {
                      tglvaksin: 'Tanggal Vaksin',
                      filefoto: 'File Foto',
                      keterangan: 'Keterangan',
                      statusaktif: 'Status Aktif',
                      info: 'Info'
                    };

                    return (
                      <TableHead
                        key={field}
                        className="border border-blue-500 py-2"
                      >
                        <div
                          className="flex w-full cursor-pointer flex-row justify-between"
                          onClick={() => handleSort(field)}
                        >
                          <p className="font-bold">{headerLabelMap[field]}</p>
                          <div className="ml-2">
                            {filters.sortBy === field &&
                            filters.sortDirection === 'asc' ? (
                              <FaSortUp className="text-red-500" />
                            ) : filters.sortBy === field &&
                              filters.sortDirection === 'desc' ? (
                              <FaSortDown className="text-red-500" />
                            ) : (
                              <FaSort className="text-zinc-400" />
                            )}
                          </div>
                        </div>

                        {field === 'statusaktif' && (
                          <Select
                            defaultValue=""
                            onValueChange={(value: any) => {
                              handleColumnFilterChange('text', value);
                            }}
                          >
                            <SelectTrigger className="filter-select z-[999999] mr-1 h-8 w-full cursor-pointer rounded-none border border-gray-300 p-1 text-xs font-thin">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem
                                  className="text=xs cursor-pointer"
                                  value=""
                                >
                                  <p className="text-xs">all</p>
                                </SelectItem>
                                <SelectItem
                                  className="text=xs cursor-pointer"
                                  value="AKTIF"
                                >
                                  <p className="text-xs">AKTIF</p>
                                </SelectItem>
                                <SelectItem
                                  className="text=xs cursor-pointer"
                                  value="TIDAK AKTIF"
                                >
                                  <p className="text-xs">TIDAK AKTIF</p>
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        )}
                        {field !== 'statusaktif' && field !== 'filefoto' && (
                          <Input
                            className="filter-input mt-1 h-8 w-full"
                            value={filters.filters[field]}
                            onChange={(e) =>
                              handleColumnFilterChange(field, e.target.value)
                            }
                          />
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>

              <TableBody>
                {sortedInvoices.map((sortedInvoice, sortedIndex) => {
                  const originalIndex = rows.indexOf(sortedInvoice);

                  return (
                    <TableRow key={sortedIndex} className="h-full">
                      <TableCell className="border border-blue-500 text-center">
                        <button
                          className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                          onClick={() => deleteRow(originalIndex)}
                        >
                          <FaTrash />
                        </button>
                      </TableCell>

                      <TableCell className="border border-blue-500 align-top">
                        <div className="flex flex-col">
                          <div className="relative">
                            <InputMask
                              mask="99-99-9999"
                              maskPlaceholder="DD-MM-YYYY"
                              placeholder="MM-DD-YYYY"
                              value={sortedInvoice.tglvaksin ?? ''}
                              onChange={(e) =>
                                handleInputChange(
                                  originalIndex,
                                  'tglvaksin',
                                  e.target.value
                                )
                              }
                            >
                              {(inputProps) => (
                                <input
                                  {...inputProps}
                                  type="text"
                                  placeholder="dd-mm-yyyy"
                                  className="h-9 w-full rounded-md border border-zinc-300 p-2 text-zinc-600 focus:outline-none focus:ring-0"
                                />
                              )}
                            </InputMask>

                            <Popover
                              open={
                                popOverTglLahirState[originalIndex] ?? false
                              }
                              onOpenChange={(open) =>
                                setPopOverTglLahirState((prev) => ({
                                  ...prev,
                                  [originalIndex]: open
                                }))
                              }
                            >
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className="absolute right-2 top-1/2 -translate-y-1/2 transform cursor-pointer border-none bg-transparent"
                                >
                                  <CalendarIcon className="h-5 w-5 text-gray-500" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="absolute left-[-15px] right-[15px] mt-2 w-fit max-w-xs border border-blue-500 bg-white lg:right-2">
                                <Calendar
                                  mode="single"
                                  // initialFocus
                                  // defaultMonth={
                                  //   field.value
                                  //     ? parse(
                                  //         field.value,
                                  //         'dd-MM-yyyy',
                                  //         new Date()
                                  //       )
                                  //     : new Date()
                                  // }
                                  selected={
                                    sortedInvoice.tglvaksin
                                      ? parseDateFromDDMMYYYY(
                                          sortedInvoice.tglvaksin
                                        )
                                      : undefined
                                  }
                                  onSelect={(value: any) => {
                                    if (value) {
                                      const formattedDate =
                                        formatDateCalendar(value);
                                      handleInputChange(
                                        originalIndex,
                                        'tglvaksin',
                                        formattedDate
                                      );
                                      // Tutup popover setelah tanggal dipilih
                                      setPopOverTglLahirState((prev) => ({
                                        ...prev,
                                        [originalIndex]: false
                                      }));
                                    }
                                  }}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          {errorMessage && (
                            <span className="text-xs text-red-500">
                              {renderErrorMessage(originalIndex)}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* File Foto */}
                      <TableCell className="w-[500px] border border-blue-500">
                        <div className="flex flex-col">
                          <ImageDropzone
                            value={sortedInvoice.filefoto}
                            onChange={(files: File[] | null) =>
                              handleInputChange(
                                originalIndex,
                                'filefoto',
                                files || []
                              )
                            }
                          />
                          {errorMessage && (
                            <span className="text-xs text-red-500">
                              {renderErrorMessage(originalIndex)}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Keterangan */}
                      <TableCell className="border border-blue-500 align-top">
                        <Input
                          type="text"
                          value={sortedInvoice.keterangan}
                          onChange={(e) =>
                            handleInputChange(
                              originalIndex,
                              'keterangan',
                              e.target.value
                            )
                          }
                          className="w-full rounded border border-gray-300 px-2 py-1"
                        />
                      </TableCell>

                      {/* Status Aktif (LookUp Component) */}
                      <TableCell className="border border-blue-500 align-top">
                        {lookUpProps.map((props, index) => (
                          <LookUp
                            key={index}
                            {...props}
                            lookupValue={(id) =>
                              handleInputChange(
                                originalIndex,
                                'statusaktif',
                                Number(id)
                              )
                            }
                            inputLookupValue={Number(sortedInvoice.statusaktif)}
                          />
                        ))}
                      </TableCell>

                      {/* Info */}
                      <TableCell className="border border-blue-500 align-top">
                        <Input
                          type="text"
                          value={sortedInvoice.info}
                          onChange={(e) =>
                            handleInputChange(
                              originalIndex,
                              'info',
                              e.target.value
                            )
                          }
                          className="w-full rounded border border-gray-300 px-2 py-1"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>

              <TableFooter>
                <TableRow>
                  <TableCell className="border border-blue-500 text-center">
                    <button
                      className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
                      onClick={addRow}
                    >
                      <FaPlus />
                    </button>
                  </TableCell>
                  <TableCell colSpan={5} className="border border-blue-500" />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>
        <div className="flex items-end gap-2">
          <Button
            type="button"
            className="mt-6 flex w-fit items-center gap-1"
            loading={isLoadingUpdate}
            onClick={() => onSubmit(rows)}
          >
            <FaSave />
            <p className="text-center">SAVE</p>
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="mt-6 flex w-fit items-center gap-1"
            onClick={() => setPopOverTable(false)}
          >
            <IoMdClose /> <p className="text-center">Cancel</p>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default FormVaksin;
