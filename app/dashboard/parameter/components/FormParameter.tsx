/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import { FaRegPlusSquare, FaSave, FaTrashAlt } from 'react-icons/fa';
import { useFormContext } from 'react-hook-form';
import LookUp from '@/components/custom-ui/LookUp';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { X } from 'lucide-react';
import { FileUploader } from '@/components/file-uploader';
import {
  Dropzone,
  ExtFile,
  FileMosaic,
  FileMosaicProps,
  FullScreen,
  ImagePreview,
  VideoPreview
} from '@files-ui/react';
import { api, api2 } from '@/lib/utils/AxiosInstance';
import { IoMdClose } from 'react-icons/io';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
interface RowData {
  key: string;
  value: string;
}
interface RowError {
  key: string;
  value: string;
}

interface FieldLengthDetails {
  column: string;
  length: number;
}

interface FieldLengths {
  data: {
    [key: string]: FieldLengthDetails;
  };
}

const FormParameter = ({
  popOver,
  setPopOver,
  forms,
  onSubmit,
  deleteMode,
  handleClose,
  viewMode,
  isLoadingCreate,
  isLoadingUpdate
}: any) => {
  const lookUpProps = [
    {
      columns: [{ key: 'text', name: 'TEXT' }],
      // filterby: { class: 'system', method: 'get' },
      selectedRequired: false,
      // endpoint: 'parameter?grp=status+aktif',
      label: 'Status Aktif',
      singleColumn: true,
      pageSize: 20,
      showOnButton: true,
      postData: 'grp'
    }
  ];

  const [rows, setRows] = useState<RowData[]>([{ key: '', value: '' }]);
  const [dataMaxLength, setDataMaxLength] = useState<{ [key: string]: number }>(
    {}
  );

  const [color, setColor] = useState(''); // Warna default

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
  };
  const [rowErrors, setRowErrors] = useState<RowError[]>([]);
  const sendRowsToAPI = async () => {
    try {
      const response = await api2.post('/parameter/validate', { rows }); // Kirim semua row ke API
      const result = response.data;

      if (result.status === false) {
        // Jika ada error, perbarui pesan error pada baris tertentu
        const newErrors = [...rowErrors];

        result.errors.forEach(
          (error: { rowIndex: number; message: string }) => {
            newErrors[error.rowIndex] = {
              key: error.message.includes('Key') ? error.message : '',
              value: error.message.includes('Value') ? error.message : ''
            };
          }
        );

        setRowErrors(newErrors);
      } else {
        // Jika tidak ada error, reset error dan tambahkan baris baru
        setRowErrors(rows.map(() => ({ key: '', value: '' }))); // Reset semua error
        setRows([...rows, { key: '', value: '' }]); // Tambahkan baris baru
      }
    } catch (error) {
      console.error('Error sending rows to API:', error);
    }
  };
  const addRow = async () => {
    await sendRowsToAPI();
  };

  const deleteRow = (index: number) => {
    const newRows = rows.filter((_, i) => i !== index);
    const newErrors = rowErrors.filter((_, i) => i !== index);
    setRows(newRows);
    setRowErrors(newErrors);
    updateFormMemo(newRows);
  };

  const handleInputChange = (
    index: number,
    field: 'key' | 'value',
    value: string
  ) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
    updateFormMemo(newRows);
  };

  const updateFormMemo = (updatedRows: RowData[]) => {
    const memoValue = updatedRows.reduce(
      (acc, row) => {
        if (row.key && row.value) acc[row.key] = row.value;
        return acc;
      },
      {} as Record<string, string>
    );
    forms.setValue('memo', memoValue);
  };

  useEffect(() => {
    if (popOver) {
      let memo = forms.getValues('memo');

      fetchFieldLengths('parameter');

      // Periksa apakah memo adalah string JSON

      if (typeof memo === 'string') {
        try {
          memo = JSON.parse(memo);
        } catch (error) {
          memo = {};
        }
      }

      if (memo && typeof memo === 'object' && Object.keys(memo).length > 0) {
        const mappedRows = Object.entries(memo).map(([key, value]) => ({
          key: key,
          value: String(value)
        }));
        setRows(mappedRows);
        setRowErrors(Array(mappedRows.length).fill({ message: '' }));
      } else {
        setRows([{ key: '', value: '' }]);
        setRowErrors([{ key: '', value: '' }]);
      }
    }
  }, [popOver, forms]);

  const fetchFieldLengths = async (mytable: any) => {
    try {
      const formData = new FormData();
      formData.append('table', mytable);

      const response = await api.post<{ data: FieldLengths }>(
        '/api/fieldlength',
        formData
      );

      if (response.status !== 200) {
        throw new Error('Network response was not ok');
      }

      const result = response.data.data;
      const maxLengthMap: { [key: string]: number } = {};
      Object.entries(result).forEach(([key, value]) => {
        maxLengthMap[key] = value.length;
      });

      setDataMaxLength(maxLengthMap);

      Object.entries(result).forEach(([index, value]) => {
        if (
          typeof index === 'string' &&
          value !== null &&
          value !== 0 &&
          value !== undefined
        ) {
          const field = document.querySelector(
            `input[name=${value.column}]`
          ) as HTMLInputElement | null;

          if (field) {
            field.setAttribute('maxlength', value.length.toString());
          }
        }
      });
    } catch (error) {}
  };
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
  return (
    <Dialog open={popOver} onOpenChange={setPopOver} modal={true}>
      <DialogTitle hidden={true}>Title</DialogTitle>
      <DialogContent className="flex h-full min-w-full flex-col overflow-hidden border bg-white">
        <div className="flex items-center justify-between bg-[#e0ecff] px-2 py-2">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Parameter Form
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
          <div className="h-full bg-white px-5 py-3">
            <Form {...forms}>
              <form
                ref={formRef}
                onSubmit={onSubmit}
                className="flex h-full flex-col gap-6"
              >
                <div className="flex h-[100%] flex-col gap-2 lg:gap-3">
                  <FormField
                    name="grp"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[20%]">
                          Nama Grup
                        </FormLabel>
                        <div className="flex flex-col lg:w-[80%]">
                          <FormControl>
                            <Input
                              {...field}
                              type="text"
                              readOnly={deleteMode}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="subgrp"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[20%]">
                          Nama Sub Grup
                        </FormLabel>
                        <div className="flex flex-col lg:w-[80%]">
                          <FormControl>
                            <Input
                              {...field}
                              readOnly={deleteMode}
                              type="text"
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="kelompok"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[20%]">
                          Kelompok
                        </FormLabel>
                        <div className="flex flex-col lg:w-[80%]">
                          <FormControl>
                            <Input
                              {...field}
                              type="text"
                              readOnly={deleteMode}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="text"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[20%]">
                          Nama Parameter
                        </FormLabel>
                        <div className="flex flex-col lg:w-[80%]">
                          <FormControl>
                            <Input
                              {...field}
                              type="text"
                              readOnly={deleteMode}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="type"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[20%]">
                          Type
                        </FormLabel>
                        <div className="flex flex-col lg:w-[80%]">
                          <FormControl>
                            <Input
                              {...field}
                              type="text"
                              readOnly={deleteMode}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <div className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                    <div className="w-full lg:w-[20%]">
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        Status Aktif
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[80%]">
                      {lookUpProps.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(id) =>
                            forms.setValue('statusaktif', id)
                          }
                          inputLookupValue={forms.getValues('statusaktif')}
                          lookupNama={forms.getValues('statusaktif_nama')}
                        />
                      ))}
                    </div>
                  </div>
                  <FormField
                    name="default"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[20%]">
                          Default Value
                        </FormLabel>
                        <FormControl>
                          <div className="relative lg:w-[80%]">
                            {/* Select Component */}
                            <Select
                              onValueChange={(value) => field.onChange(value)} // Set nilai ke field React Hook Form
                              value={field.value || ''} // Nilai diambil dari field
                            >
                              <SelectTrigger className="w-full border-zinc-300 placeholder:text-zinc-400">
                                <SelectValue
                                  placeholder="Select Default Value"
                                  className="placeholder:text-zinc-400"
                                />
                                {field.value && (
                                  <button
                                    type="button"
                                    className="absolute right-2 top-1/2 mr-8 -translate-y-1/2 transform text-gray-400 hover:text-red-500"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      field.onChange(''); // Reset value field ke kosong
                                    }}
                                  >
                                    <X size={16} />
                                  </button>
                                )}
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>DEFAULT</SelectLabel>
                                  <SelectItem value="YA">YA</SelectItem>
                                  <SelectItem value="TIDAK">TIDAK</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="memo"
                    control={forms.control}
                    render={() => (
                      <FormItem>
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200">
                          Memo
                        </FormLabel>
                        <FormControl>
                          <table className="min-w-full border-collapse border border-blue-500">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="w-16 border border-blue-500 p-2 text-left">
                                  AKSI
                                </th>
                                <th className="border border-blue-500 p-2 text-left">
                                  KEY *
                                </th>
                                <th className="border border-blue-500 p-2 text-left">
                                  VALUE *
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((row, index) => (
                                <tr
                                  key={index}
                                  className="border border-blue-500"
                                >
                                  <td className="border border-blue-500 p-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() => deleteRow(index)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <FaTrashAlt />
                                    </button>
                                  </td>
                                  <td className="w-[50%] border border-blue-500 p-2">
                                    <Input
                                      type="text"
                                      value={row.key}
                                      onChange={(e) =>
                                        handleInputChange(
                                          index,
                                          'key',
                                          e.target.value
                                        )
                                      }
                                      placeholder="Masukkan Key"
                                    />
                                    {rowErrors[index]?.key && (
                                      <p className="text-sm text-red-500">
                                        {rowErrors[index].key}
                                      </p>
                                    )}
                                  </td>
                                  <td className="w-[50%] border border-blue-500 p-2">
                                    {row.key.toLowerCase().includes('warna') ? (
                                      <div className="flex items-center space-x-2">
                                        {/* Input Picker */}
                                        <Input
                                          type="color"
                                          value={row.value}
                                          onChange={(e) =>
                                            handleInputChange(
                                              index,
                                              'value',
                                              e.target.value
                                            )
                                          }
                                          className="h-10 w-20 rounded border border-blue-500"
                                        />
                                        {/* Input Text */}
                                        <Input
                                          type="text"
                                          value={row.value}
                                          maxLength={7}
                                          onChange={(e) =>
                                            handleInputChange(
                                              index,
                                              'value',
                                              e.target.value
                                            )
                                          }
                                          placeholder="#FFFFFF"
                                          className="w-full rounded border border-blue-500 px-2 py-1"
                                        />
                                      </div>
                                    ) : (
                                      <Input
                                        type="text"
                                        value={row.value}
                                        onChange={(e) =>
                                          handleInputChange(
                                            index,
                                            'value',
                                            e.target.value
                                          )
                                        }
                                        placeholder="Masukkan Value"
                                      />
                                    )}
                                    {rowErrors[index]?.value && (
                                      <p className="text-sm text-red-500">
                                        {rowErrors[index].value}
                                      </p>
                                    )}
                                  </td>
                                </tr>
                              ))}
                              <tr>
                                <td className="border border-blue-500 p-2 text-center">
                                  <button
                                    type="button"
                                    onClick={addRow}
                                    className="text-blue-500 hover:text-blue-700"
                                  >
                                    <FaRegPlusSquare />
                                  </button>
                                </td>
                                <td colSpan={3}></td>
                              </tr>
                            </tbody>
                          </table>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </div>
        </div>
        <div className="m-0 flex h-fit items-end gap-2 bg-zinc-200 px-3 py-2">
          <Button
            type="submit"
            onClick={onSubmit}
            disabled={viewMode}
            className="flex w-fit items-center gap-1 text-sm"
          >
            <FaSave />
            <p className="text-center">{deleteMode ? 'DELETE' : 'SAVE'}</p>
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

export default FormParameter;
