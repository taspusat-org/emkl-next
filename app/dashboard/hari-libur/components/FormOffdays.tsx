/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useGetMenu } from '@/lib/server/useMenu';
import { Button } from '@/components/ui/button';
import { useGetAcos } from '@/lib/server/useAcos';
import { api } from '@/lib/utils/AxiosInstance';
import { useEffect, useRef, useState } from 'react';
import ReactInputDateMask from '../../../../components/custom-ui/InputMask/ReactInputDateMask';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { CalendarCheck, CalendarIcon } from 'lucide-react';
import { format, isValid, parse, set } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  formatDateCalendar,
  isLeapYear,
  parseDateFromDDMMYYYY
} from '@/lib/utils';
import InputMask from 'react-input-mask';
import LookUp from '@/components/custom-ui/LookUp';
import { FaSave } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { Textarea } from '@/components/ui/textarea';
const FormOffdays = ({
  popOver,
  setPopOver,
  forms,
  onSubmit,
  deleteMode,
  handleClose,
  popOverDate,
  setPopOverDate,
  isLoadingCreate,
  isLoadingUpdate,
  isLoadingDelete
}: any) => {
  const [submitClick, setSubmitClick] = useState(false);

  interface FieldLengthDetails {
    column: string;
    length: number;
  }

  interface FieldLengths {
    data: {
      [key: string]: FieldLengthDetails;
    };
  }

  const [dataMaxLength, setDataMaxLength] = useState<{ [key: string]: number }>(
    {}
  );
  const lookUpProps = [
    {
      columns: [{ key: 'text', name: 'TEXT' }],
      // filterby: { class: 'system', method: 'get' },
      selectedRequired: false,
      endpoint: 'parameter?grp=status+aktif',
      singleColumn: true,
      pageSize: 20,
      label: 'STATUS AKTIF',
      lookupLabel: 'LOOKUP STATUS AKTIF',
      showOnButton: true,
      postData: 'text'
    }
  ];
  const lookupPropsCabang = [
    {
      columns: [{ key: 'namacabang', name: 'nama cabang' }],
      // filterby: { class: 'system', method: 'get' },
      required: true,
      labelLookup: 'LOOKUP CABANG',
      disabled: deleteMode,
      selectedRequired: true,
      endpoint: 'cabang',
      label: 'CABANG',
      singleColumn: true,
      pageSize: 20,
      showOnButton: true,
      postData: 'namacabang'
    }
  ];
  useEffect(() => {
    if (popOver) {
      fetchFieldLengths('offdays');
    }
  }, [popOver]);

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
    <Dialog open={popOver} onOpenChange={setPopOver}>
      <DialogTitle hidden={true}>Title</DialogTitle>
      <DialogContent className="flex h-full min-w-full flex-col overflow-hidden border bg-white">
        <div className="flex items-center justify-between bg-[#e0ecff] px-2 py-2">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Form hari libur
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
                    name="tgl"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel
                          required={true}
                          className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]"
                        >
                          Tanggal
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <div className="relative">
                              <InputMask
                                mask="99-99-9999"
                                // maskChar="dmy"
                                maskChar={null} // Tidak menampilkan karakter mask saat input kosong
                                maskPlaceholder="dd-mm-yyyy"
                                value={field.value ?? ''}
                                alwaysShowMask={true}
                                onChange={(e) => {
                                  let rawValue = e.target.value;
                                  let [day, month, year] = rawValue.split('-');

                                  if (
                                    month &&
                                    Number(month) > 1 &&
                                    month.length === 1
                                  ) {
                                    month = `0${month}`;
                                  }

                                  rawValue = `${day ?? ''}-${month ?? ''}-${
                                    year ?? ''
                                  }`;

                                  const isDayValid = day && day.length === 2;
                                  const isMonthValid =
                                    month && month.length === 2;
                                  const isYearValid = year && year.length === 4;

                                  const dayNum = Number(day);
                                  const monthNum = Number(month);
                                  const yearNum = Number(year);

                                  if (isDayValid && dayNum > 31) return;
                                  if (isMonthValid && monthNum > 12) return;

                                  const monthsWith31Days = [
                                    '01',
                                    '03',
                                    '05',
                                    '07',
                                    '08',
                                    '10',
                                    '12'
                                  ];
                                  if (
                                    isDayValid &&
                                    day === '31' &&
                                    isMonthValid &&
                                    !monthsWith31Days.includes(month)
                                  ) {
                                    return;
                                  }

                                  if (
                                    isDayValid &&
                                    isMonthValid &&
                                    day === '29' &&
                                    month === '02'
                                  ) {
                                    if (isYearValid && !isLeapYear(yearNum)) {
                                      return;
                                    }
                                  }

                                  if (
                                    isDayValid &&
                                    isMonthValid &&
                                    month === '02'
                                  ) {
                                    if (isYearValid) {
                                      const maxFeb = isLeapYear(yearNum)
                                        ? 29
                                        : 28;
                                      if (dayNum > maxFeb) return;
                                    }
                                  }

                                  field.onChange({
                                    ...e,
                                    target: { ...e.target, value: rawValue }
                                  });
                                }}
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
                                open={popOverDate}
                                onOpenChange={setPopOverDate}
                              >
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 transform cursor-pointer border-none bg-transparent"
                                  >
                                    <CalendarIcon className="h-5 w-5 text-gray-500" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="absolute right-2 mt-2 w-fit max-w-xs border border-blue-500 bg-white"
                                  style={{ position: 'fixed' }}
                                >
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
                                      field.value
                                        ? parseDateFromDDMMYYYY(field.value)
                                        : undefined
                                    } // Memastikan format yang dipilih sesuai dengan input
                                    onSelect={(value: any) => {
                                      if (value) {
                                        const formattedDate =
                                          formatDateCalendar(value);
                                        field.onChange(formattedDate); // Memastikan format yang dikirim yyyy-mm-dd
                                        setPopOverDate(false);
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

                  <FormField
                    name="keterangan"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel
                          required={true}
                          className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]"
                        >
                          Keterangan
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <Textarea
                              {...field}
                              value={field.value ?? ''}
                              className="border border-zinc-300"
                              readOnly={deleteMode}
                            >
                              {field.value}
                            </Textarea>
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
                        className="text-sm font-semibold text-gray-700 lg:w-[15%]"
                      >
                        Cabang
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookupPropsCabang.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          required={true}
                          isSubmitClicked={submitClick}
                          lookupValue={(id) => forms.setValue('cabang_id', id)}
                          inputLookupValue={forms.getValues('cabang_id')}
                          lookupNama={forms.getValues('cabang_nama')}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                    <div className="w-full lg:w-[15%]">
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        Status Aktif
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookUpProps.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(id) =>
                            forms.setValue('statusaktif', id)
                          }
                          inputLookupValue={forms.getValues('statusaktif')}
                        />
                      ))}
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
            onClick={async (e) => {
              setSubmitClick(true); // Set true saat pertama kali klik

              // Panggil onSubmit dengan menggunakan async await jika diperlukan untuk operasi yang async
              await onSubmit(e); // Tunggu sampai onSubmit selesai

              // Setelah 2 detik (misalnya), setSubmitClick menjadi false
              setTimeout(() => {
                setSubmitClick(false);
              }, 2000); // 2000ms = 2 detik
            }}
            className="flex w-fit items-center gap-1 text-sm"
            loading={isLoadingCreate || isLoadingUpdate || isLoadingDelete}
          >
            <FaSave />
            <p className="text-center">{deleteMode ? 'DELETE' : 'SAVE'}</p>
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="flex w-fit items-center gap-1 bg-zinc-500 text-sm text-white hover:bg-zinc-400"
            onClick={(e) => {
              // Set your state here
              setSubmitClick(false); // Ganti dengan logika state yang diinginkan
              handleClose(e); // Panggil onSubmit setelahnya
            }}
          >
            <IoMdClose /> <p className="text-center text-white">Cancel</p>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormOffdays;
