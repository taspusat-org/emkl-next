import { FaSave } from 'react-icons/fa';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
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
import InputDatePicker from '@/components/custom-ui/InputDatePicker';
import InputCurrency from '@/components/custom-ui/InputCurrency';

const FormPindahBuku = ({
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
  const selectLookup = useSelector(
    (state: RootState) => state.selectLookup.selectLookup
  );

  const lookupPropsBankDari = [
    {
      columns: [{ key: 'keterangan', name: 'NAMA' }],
      labelLookup: 'BANK DARI LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'bank',
      label: 'BANK DARI',
      singleColumn: true,
      pageSize: 20,
      disabled: mode === 'view' || mode === 'delete' ? true : false,
      postData: 'text',
      dataToPost: 'id'
    }
  ];

  const lookupPropsBankKe = [
    {
      columns: [{ key: 'keterangan', name: 'NAMA' }],
      labelLookup: 'BANK KE LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'bank',
      label: 'BANK KE',
      singleColumn: true,
      pageSize: 20,
      disabled: mode === 'view' || mode === 'delete' ? true : false,
      postData: 'keterangan',
      dataToPost: 'id'
    }
  ];

  const lookupPropsAlatBayar = [
    {
      columns: [{ key: 'keterangan', name: 'NAMA' }],
      labelLookup: 'ALAT BAYAR LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'alatbayar',
      label: 'ALAT BAYAR',
      singleColumn: true,
      pageSize: 20,
      disabled: mode === 'view' || mode === 'delete' ? true : false,
      postData: 'keterangan',
      dataToPost: 'id'
    }
  ];

  const lookupPropsStatusFormat = [
    {
      columns: [{ key: 'text', name: 'NAMA' }],
      labelLookup: 'FORMAT LOOKUP',
      required: true,
      selectedRequired: false,
      // filterby: { exclude: 'true', kelompok: '' },
      endpoint: `parameter?exclude=true&kelompok=`,
      // endpoint: 'parameter',
      label: 'FORMAT',
      singleColumn: true,
      pageSize: 20,
      disabled: mode === 'view' || mode === 'delete' ? true : false,
      postData: 'text',
      dataToPost: 'id'
    }
  ];

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
  console.log('mode', mode);

  return (
    <Dialog open={popOver} onOpenChange={setPopOver}>
      <DialogTitle hidden={true}>Title</DialogTitle>
      <DialogContent className="flex h-full min-w-full flex-col overflow-hidden border bg-white">
        <div className="flex items-center justify-between bg-[#e0ecff] px-2 py-2">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {mode === 'add'
              ? 'Add Pindah Buku'
              : mode === 'edit'
              ? 'Edit Pindah Buku'
              : mode === 'delete'
              ? 'Delete Pindah Buku'
              : 'View Pindah Buku'}
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
                  <div className="flex flex-row">
                    <FormField
                      name="nobukti"
                      control={forms.control}
                      render={({ field }) => (
                        <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                          <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[30%]">
                            NO BUKTI
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
                                showCalendar={mode == 'add' || mode == 'edit'}
                                disabled={mode == 'delete' || mode == 'view'}
                                onSelect={(date) => {
                                  forms.setValue('tglbukti', date);
                                  forms.setValue('tgljatuhtempo', date);
                                }}
                              />
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
                        BANK DARI
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookupPropsBankDari.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(value: any) => {
                            forms.setValue('bankdari_id', Number(value));
                          }}
                          onSelectRow={(val) => {
                            forms.setValue('bankdari_nama', val?.keterangan);
                          }}
                          name="bankdari_id"
                          forms={forms}
                          lookupNama={forms.getValues('bankdari_nama')}
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
                        BANK KE
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookupPropsBankKe.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(value: any) => {
                            forms.setValue('bankke_id', Number(value));
                          }}
                          onSelectRow={(val) => {
                            forms.setValue('bankke_nama', val?.keterangan);
                          }}
                          name="bankke_id"
                          forms={forms}
                          lookupNama={forms.getValues('bankke_nama')}
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
                        ALAT BAYAR
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookupPropsAlatBayar.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(value: any) => {
                            forms.setValue('alatbayar_id', Number(value));
                          }}
                          onSelectRow={(val) => {
                            forms.setValue('alatbayar_nama', val?.keterangan);
                            console.log(
                              'tess',
                              forms.getValues('alatbayar_nama')
                            );
                            forms.setValue('nowarkat', '');
                          }}
                          lookupNama={forms.getValues('alatbayar_nama')}
                        />
                      ))}
                    </div>
                  </div>

                  <FormField
                    name="nowarkat"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          NO WARKAT
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ''}
                              type="text"
                              readOnly={mode === 'view' || mode === 'delete'}
                              disabled={
                                forms.getValues('alatbayar_nama') == 'Tunai'
                              }
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
                          TGL JATUH TEMPO
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <InputDatePicker
                              value={field.value}
                              onChange={field.onChange}
                              showCalendar={mode == 'add' || mode == 'edit'}
                              disabled={
                                mode == 'delete' ||
                                mode == 'view' ||
                                forms.getValues('alatbayar_nama') != 'Giro'
                              }
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

                  <FormField
                    name="nominal"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel
                          required={true}
                          className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]"
                        >
                          NOMINAL
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

export default FormPindahBuku;
