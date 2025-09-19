import { FaSave } from 'react-icons/fa';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { IoMdClose } from 'react-icons/io';
import { RootState } from '@/lib/store/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import LookUp from '@/components/custom-ui/LookUp';
import InputNumeric from '@/components/custom-ui/InputNumeric';
import { setSubmitClicked } from '@/lib/store/lookupSlice/lookupSlice';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import InputMask from '@mona-health/react-input-mask';
import InputCurrency from '@/components/custom-ui/InputCurrency';
import InputDatePicker from '@/components/custom-ui/InputDatePicker';
import InputMonthPicker from '@/components/custom-ui/InputMonthPicker';

const FormLabaRugiKalkulasi = ({
  forms,
  popOver,
  setPopOver,
  onSubmit,
  mode,
  handleClose,
  isLoadingCreate,
  isLoadingUpdate,
  isLoadingDelete
}: any) => {
  const dispatch = useDispatch();
  const formRef = useRef<HTMLFormElement | null>(null);
  const openName = useSelector((state: RootState) => state.lookup.openName);

  const lookupStatusFinalKomisi = [
    {
      columns: [{ key: 'text', name: 'NAMA' }],
      labelLookup: 'STATUS FINAL KOMISI MARKETING LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'parameter?grp=status+nilai',
      label: 'STATUS NILAI KOMISI',
      singleColumn: true,
      pageSize: 20,
      disabled: mode === 'view' || mode === 'delete' ? true : false,
      postData: 'text',
      dataToPost: 'id'
    }
  ];

  const lookupStatusFinalBonus = [
    {
      columns: [{ key: 'text', name: 'NAMA' }],
      labelLookup: 'STATUS FINAL BONUS TRIWULAN LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'parameter?grp=status+nilai',
      label: 'STATUS NILAI BONUS',
      singleColumn: true,
      pageSize: 20,
      disabled: mode === 'view' || mode === 'delete' ? true : false,
      postData: 'text',
      dataToPost: 'id'
    }
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Fungsi untuk menangani pergerakan fokus berdasarkan tombolc
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

    document.addEventListener('keydown', handleKeyDown); // Menambahkan event listener untuk keydown

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
            {mode === 'add'
              ? 'Add Laba Rugi Kalkulasi'
              : mode === 'edit'
              ? 'Edit Laba Rugi Kalkulasi'
              : mode === 'delete'
              ? 'Delete Laba Rugi Kalkulasi'
              : 'View Laba Rugi Kalkulasi'}
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
        <div className="h-full flex-1 overflow-y-auto bg-white pl-1 pr-2">
          <div className="min-h-full bg-white px-3 py-3">
            <Form {...forms}>
              <form
                ref={formRef}
                onSubmit={onSubmit}
                className="flex h-full flex-col gap-6"
              >
                <div className="flex h-[100%] flex-col gap-2 lg:gap-3">
                  <FormField
                    name="periode"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          PERIODE
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <InputMonthPicker
                              value={field.value}
                              onChange={field.onChange}
                              // onSelectDate={(date) =>
                              //   forms.setValue('periode', date)
                              // }
                              showCalendar
                              disabled={mode === 'view' || mode === 'delete'}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="estkomisimarketing"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          EST KOMISI MARKETING
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <InputCurrency
                              value={field.value}
                              onValueChange={(val) => {
                                field.onChange(val);
                              }}
                              readOnly={mode === 'view' || mode === 'delete'}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="komisimarketing"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          KOMISI MARKETING
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <InputCurrency
                              value={field.value}
                              onValueChange={(val) => {
                                field.onChange(val);
                              }}
                              readOnly={mode === 'view' || mode === 'delete'}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="biayakantorpusat"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          BIAYA KANTOR PUSAT
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <InputCurrency
                              value={field.value}
                              onValueChange={(val) => {
                                field.onChange(val);
                              }}
                              readOnly={mode === 'view' || mode === 'delete'}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="biayatour"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          BIAYA TOUR
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <InputCurrency
                              value={field.value}
                              onValueChange={(val) => {
                                field.onChange(val);
                              }}
                              readOnly={mode === 'view' || mode === 'delete'}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="gajidireksi"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          GAJI DIREKSI
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <InputCurrency
                              value={field.value}
                              onValueChange={(val) => {
                                field.onChange(val);
                              }}
                              readOnly={mode === 'view' || mode === 'delete'}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="estkomisikacab"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          EST KOMISI KACAB
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <InputCurrency
                              value={field.value}
                              onValueChange={(val) => {
                                field.onChange(val);
                              }}
                              readOnly={mode === 'view' || mode === 'delete'}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="biayabonustriwulan"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          BIAYA BONUS TRI WULAN
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <InputCurrency
                              value={field.value}
                              onValueChange={(val) => {
                                field.onChange(val);
                              }}
                              readOnly={mode === 'view' || mode === 'delete'}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="estkomisimarketing2"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          EST KOMISI MARKETING 2
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <InputCurrency
                              value={field.value}
                              onValueChange={(val) => {
                                field.onChange(val);
                              }}
                              readOnly={mode === 'view' || mode === 'delete'}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="estkomisikacabcabang1"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          EST KOMISI KACAB CABANG 1
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <InputCurrency
                              value={field.value}
                              onValueChange={(val) => {
                                field.onChange(val);
                              }}
                              readOnly={mode === 'view' || mode === 'delete'}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="estkomisikacabcabang2"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          EST KOMISI KACAB CABANG 2
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <InputCurrency
                              value={field.value}
                              onValueChange={(val) => {
                                field.onChange(val);
                              }}
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
                        STATUS FINAL KOMISI MARKETING
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookupStatusFinalKomisi.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(id) =>
                            forms.setValue('statusfinalkomisimarketing', id)
                          }
                          onSelectRow={(val) =>
                            forms.setValue('statusfinalkomisi_nama', val?.text)
                          }
                          inputLookupValue={forms.getValues(
                            'statusfinalkomisimarketing'
                          )}
                          lookupNama={forms.getValues('statusfinalkomisi_nama')}
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
                        STATUS FINAL BONUS TRI WULAN
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookupStatusFinalBonus.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(id) =>
                            forms.setValue('statusfinalbonustriwulan', id)
                          }
                          onSelectRow={(val) =>
                            forms.setValue('statusfinalbonus_nama', val?.text)
                          }
                          inputLookupValue={forms.getValues(
                            'statusfinalbonustriwulan'
                          )}
                          lookupNama={forms.getValues('statusfinalbonus_nama')}
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
                <p className="text-center">SAVE & ADD</p>
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

export default FormLabaRugiKalkulasi;
