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

const FormPenerimaanEmkl = ({
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

  const lookupPropsStatusAktif = [
    {
      columns: [{ key: 'text', name: 'NAMA' }],
      labelLookup: 'STATUS AKTIF LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'parameter?grp=status+aktif',
      label: 'STATUS AKTIF',
      singleColumn: true,
      pageSize: 20,
      disabled: mode === 'view' || mode === 'delete' ? true : false,
      postData: 'text',
      dataToPost: 'id'
    }
  ];

  const lookupPropsFormat = [
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

  const lookUpPropsCoaDebet = [
    {
      columns: [
        { key: 'coa', name: 'COA' },
        { key: 'keterangancoa', name: 'KETERANGANCOA' }
      ],
      labelLookup: 'COA DEBET',
      required: true,
      selectedRequired: false,
      endpoint: 'akunpusat',
      label: 'COA_DEBET',
      singleColumn: false,
      pageSize: 20,
      disabled: mode === 'view' || mode === 'delete' ? true : false,
      postData: 'keterangancoa',
      dataToPost: 'coa',
      showOnButton: true
    }
  ];

  const lookUpPropsCoaKredit = [
    {
      columns: [
        { key: 'coa', name: 'COA' },
        { key: 'keterangancoa', name: 'KETERANGANCOA' }
      ],
      labelLookup: 'COA KREDIT',
      required: true,
      selectedRequired: false,
      endpoint: 'akunpusat',
      label: 'COA_KREDIT',
      singleColumn: false,
      pageSize: 20,
      disabled: mode === 'view' || mode === 'delete' ? true : false,
      postData: 'keterangancoa',
      dataToPost: 'coa',
      showOnButton: true
    }
  ];

  const lookUpPropsCoaBankDebet = [
    {
      columns: [
        { key: 'coa', name: 'COA' },
        { key: 'keterangancoa', name: 'KETERANGANCOA' }
      ],
      labelLookup: 'COA_BANK_DEBET',
      required: true,
      selectedRequired: false,
      endpoint: 'akunpusat',
      label: 'COA_BANK_DEBET',
      singleColumn: false,
      pageSize: 20,
      disabled: mode === 'view' || mode === 'delete' ? true : false,
      postData: 'keterangancoa',
      dataToPost: 'coa',
      showOnButton: true
    }
  ];

  const lookUpPropsCoaBankKredit = [
    {
      columns: [
        { key: 'coa', name: 'COA' },
        { key: 'keterangancoa', name: 'KETERANGANCOA' }
      ],
      labelLookup: 'COA_BANK_KREDIT',
      required: true,
      selectedRequired: false,
      endpoint: 'akunpusat',
      label: 'COA_BANK_KREDIT',
      singleColumn: false,
      pageSize: 20,
      disabled: mode === 'view' || mode === 'delete' ? true : false,
      postData: 'keterangancoa',
      dataToPost: 'coa',
      showOnButton: true
    }
  ];

  const lookUpPropsCoaHutangDebet = [
    {
      columns: [
        { key: 'coa', name: 'COA' },
        { key: 'keterangancoa', name: 'KETERANGANCOA' }
      ],
      labelLookup: 'COA_HUTANG_DEBET',
      required: true,
      selectedRequired: false,
      endpoint: 'akunpusat',
      label: 'COA_HUTANG_DEBET',
      singleColumn: false,
      pageSize: 20,
      disabled: mode === 'view' || mode === 'delete' ? true : false,
      postData: 'keterangancoa',
      dataToPost: 'coa',
      showOnButton: true
    }
  ];

  const lookUpPropsCoaHutangKredit = [
    {
      columns: [
        { key: 'coa', name: 'COA' },
        { key: 'keterangancoa', name: 'KETERANGANCOA' }
      ],
      labelLookup: 'COA_HUTANG_KREDIT',
      required: true,
      selectedRequired: false,
      endpoint: 'akunpusat',
      label: 'COA_HUTANG_KREDIT',
      singleColumn: false,
      pageSize: 20,
      disabled: mode === 'view' || mode === 'delete' ? true : false,
      postData: 'keterangancoa',
      dataToPost: 'coa',
      showOnButton: true
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

  return (
    <Dialog open={popOver} onOpenChange={setPopOver}>
      <DialogTitle hidden={true}>Title</DialogTitle>
      <DialogContent className="flex h-full min-w-full flex-col overflow-hidden border bg-white">
        <div className="flex items-center justify-between bg-[#e0ecff] px-2 py-2">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {mode === 'add'
              ? 'Add Penerimaan Emkl'
              : mode === 'edit'
              ? 'Edit Penerimaan Emkl'
              : mode === 'delete'
              ? 'Delete Penerimaan Emkl'
              : 'View Penerimaan Emkl'}
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
                    name="nama"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel
                          required={true}
                          className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]"
                        >
                          NAMA
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

                  <div className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                    <div className="w-full lg:w-[15%]">
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        COA DEBET
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookUpPropsCoaDebet.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(value: any) => {
                            forms.setValue('coadebet', value);
                          }}
                          onSelectRow={(val) => {
                            forms.setValue('coadebet_nama', val?.keterangancoa);
                          }}
                          name="coadebet"
                          forms={forms}
                          lookupNama={forms.getValues('coadebet_nama')}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                    <div className="w-full lg:w-[15%]">
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        COA KREDIT
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookUpPropsCoaKredit.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(value: any) => {
                            forms.setValue('coakredit', value);
                          }}
                          onSelectRow={(val) => {
                            forms.setValue(
                              'coakredit_nama',
                              val?.keterangancoa
                            );
                          }}
                          name="coakredit"
                          forms={forms}
                          lookupNama={forms.getValues('coakredit_nama')}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                    <div className="w-full lg:w-[15%]">
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        COA POSTING KASBANK DEBET
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookUpPropsCoaBankDebet.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(value: any) => {
                            forms.setValue('coapostingkasbankdebet', value);
                          }}
                          onSelectRow={(val) => {
                            forms.setValue(
                              'coabankdebet_nama',
                              val?.keterangancoa
                            );
                          }}
                          name="coapostingkasbankdebet"
                          forms={forms}
                          lookupNama={forms.getValues('coabankdebet_nama')}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                    <div className="w-full lg:w-[15%]">
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        COA POSTING KASBANK KREDIT
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookUpPropsCoaBankKredit.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(value: any) => {
                            forms.setValue('coapostingkasbankkredit', value);
                          }}
                          onSelectRow={(val) => {
                            forms.setValue(
                              'coabankkredit_nama',
                              val?.keterangancoa
                            );
                          }}
                          name="coapostingkasbankkredit"
                          forms={forms}
                          lookupNama={forms.getValues('coabankkredit_nama')}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                    <div className="w-full lg:w-[15%]">
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        COA POSTING HUTANG DEBET
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookUpPropsCoaHutangDebet.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(value: any) => {
                            forms.setValue('coapostinghutangdebet', value);
                          }}
                          onSelectRow={(val) => {
                            forms.setValue(
                              'coahutangdebet_nama',
                              val?.keterangancoa
                            );
                          }}
                          name="coapostinghutangdebet"
                          forms={forms}
                          lookupNama={forms.getValues('coahutangdebet_nama')}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                    <div className="w-full lg:w-[15%]">
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        COA POSTING HUTANG KREDIT
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookUpPropsCoaHutangKredit.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(value: any) => {
                            forms.setValue('coapostinghutangkredit', value);
                          }}
                          onSelectRow={(val) => {
                            forms.setValue(
                              'coahutangkredit_nama',
                              val?.keterangancoa
                            );
                          }}
                          name="coapostinghutangkredit"
                          forms={forms}
                          lookupNama={forms.getValues('coahutangkredit_nama')}
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
                        FORMAT
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookupPropsFormat.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(id) => forms.setValue('format', id)}
                          onSelectRow={(val) =>
                            forms.setValue('format_nama', val?.text)
                          }
                          inputLookupValue={forms.getValues('format')}
                          lookupNama={forms.getValues('format_nama')}
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
                        Status Aktif
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookupPropsStatusAktif.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(id) =>
                            forms.setValue('statusaktif', id)
                          }
                          onSelectRow={(val) =>
                            forms.setValue('statusaktif_nama', val?.text)
                          }
                          inputLookupValue={forms.getValues('statusaktif')}
                          lookupNama={forms.getValues('statusaktif_nama')}
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

export default FormPenerimaanEmkl;
