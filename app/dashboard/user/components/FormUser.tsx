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
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/utils/AxiosInstance';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { CalendarCheck } from '@/components/custom-ui/calendar-check';
import LookUp from '@/components/custom-ui/LookUp';
import { RootState } from '@/lib/store/store';
import { useSelector } from 'react-redux';
import { FaSave } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';

const FormUser = ({
  popOver,
  setPopOver,
  forms,
  onSubmit,
  handleClose,
  mode,
  isLoadingCreate,
  isLoadingDelete,
  isLoadingUpdate
}: any) => {
  interface FieldLengthDetails {
    column: string;
    length: number;
  }

  interface FieldLengths {
    data: {
      [key: string]: FieldLengthDetails;
    };
  }
  const [submitClick, setSubmitClick] = useState(false);

  const formRef = useRef<HTMLFormElement | null>(null); // Ref untuk form
  const lookUpProps = [
    {
      columns: [
        { key: 'username', name: 'USERNAME' },
        { key: 'name', name: 'NAME' }
      ],
      // filterby: { class: 'system', method: 'get' },
      selectedRequired: false,
      endpoint: 'user',
      label: 'USER ASAL',
      singleColumn: false,
      pageSize: 20,
      showOnButton: true,
      postData: 'username'
    }
  ];
  const lookUpPropsStatusAktif = [
    {
      columns: [{ key: 'text', name: 'NAMA' }],
      // filterby: { class: 'system', method: 'get' },
      labelLookup: 'STATUS AKTIF LOOKUP',
      selectedRequired: false,
      label: 'Status Aktif',
      singleColumn: true,
      pageSize: 20,
      showOnButton: true,
      postData: 'text'
    }
  ];
  const lookUpPropsKaryawan = [
    {
      columns: [{ key: 'namakaryawan', name: 'NAMA KARYAWAN' }],
      // filterby: { class: 'system', method: 'get' },
      selectedRequired: false,
      endpoint: 'karyawan',
      required: true,
      isSubmitClicked: submitClick,
      label: 'NAMA KARYAWAN',
      singleColumn: true,
      pageSize: 20,
      showOnButton: true,
      postData: 'namakaryawan'
    }
  ];
  const [dataMaxLength, setDataMaxLength] = useState<{ [key: string]: number }>(
    {}
  );
  const openName = useSelector((state: RootState) => state.lookup.openName);

  useEffect(() => {
    if (popOver) {
      fetchFieldLengths('users');
    }
  }, [popOver]);
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

  return (
    <Dialog open={popOver} onOpenChange={setPopOver}>
      <DialogTitle hidden={true}>User Form</DialogTitle>
      <DialogContent className="flex h-full min-w-full flex-col overflow-hidden border bg-white">
        <div className="flex items-center justify-between bg-[#e0ecff] px-2 py-2">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            User Form
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
                <div className="flex-grow">
                  <div className="grid grid-cols-1 gap-2 gap-y-4">
                    <FormField
                      name="username"
                      control={forms.control}
                      render={({ field }) => (
                        <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                          <FormLabel
                            required={true}
                            className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]"
                          >
                            Username
                          </FormLabel>
                          <div className="flex flex-col lg:w-[85%]">
                            <FormControl>
                              <Input
                                {...field}
                                value={(field.value as string) ?? ''}
                                type="text"
                                readOnly={mode === 'delete' || mode === 'view'}
                              />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="name"
                      control={forms.control}
                      render={({ field }) => (
                        <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                          <FormLabel
                            required={true}
                            className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]"
                          >
                            Name
                          </FormLabel>
                          <div className="flex flex-col lg:w-[85%]">
                            <FormControl>
                              <Input
                                {...field}
                                value={(field.value as string) ?? ''}
                                type="text"
                                readOnly={mode === 'delete' || mode === 'view'}
                              />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="email"
                      control={forms.control}
                      render={({ field }) => (
                        <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                          <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                            Email
                          </FormLabel>
                          <div className="flex flex-col lg:w-[85%]">
                            <FormControl>
                              <Input
                                {...field}
                                value={(field.value as string) ?? ''}
                                type="email"
                                readOnly={mode === 'delete' || mode === 'view'}
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
                          KARYAWAN
                        </FormLabel>
                      </div>
                      <div className="w-full lg:w-[85%]">
                        {lookUpPropsKaryawan.map((props, index) => (
                          <LookUp
                            key={index}
                            {...props}
                            lookupValue={(id: any) => {
                              forms.setValue('karyawan_id', id);
                            }}
                            disabled={mode === 'delete' || mode === 'view'}
                            inputLookupValue={forms.getValues('karyawan_id')}
                            lookupNama={forms.getValues('namakaryawan')}
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
                        {lookUpPropsStatusAktif.map((props, index) => (
                          <LookUp
                            key={index}
                            {...props}
                            disabled={mode === 'delete' || mode === 'view'}
                            lookupValue={(id) =>
                              forms.setValue('statusaktif', Number(id))
                            }
                            inputLookupValue={forms.getValues('statusaktif')}
                            lookupNama={forms.getValues('statusaktif_text')}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                      <div className="w-full lg:w-[15%]">
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          Hak Akses User Asal
                        </FormLabel>
                      </div>
                      <div className="w-full lg:w-[85%]">
                        {lookUpProps.map((props, index) => (
                          <LookUp
                            key={index}
                            {...props}
                            disabled={mode === 'delete' || mode === 'view'}
                            lookupValue={(id) => forms.setValue('userId', id)}
                            inputLookupValue={forms.getValues('userId')}
                          />
                        ))}
                      </div>
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

export default FormUser;
