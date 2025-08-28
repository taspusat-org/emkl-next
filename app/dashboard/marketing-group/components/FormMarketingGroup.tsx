/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import LookUp from '@/components/custom-ui/LookUp';
import { Input } from '@/components/ui/input';
import { IoMdClose } from 'react-icons/io';
import { FaSave } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { setSubmitClicked } from '@/lib/store/lookupSlice/lookupSlice';

const FormMarketingGroup = ({
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
  const lookUpPropsStatusAktif = [
    {
      columns: [{ key: 'text', name: 'NAMA' }],
      // filterby: { class: 'system', method: 'get' },
      labelLookup: 'STATUS AKTIF LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'parameter?grp=status+aktif',
      label: 'STATUS AKTIF',
      singleColumn: true,
      pageSize: 20,
      dataToPost: 'id',
      showOnButton: true,
      disabled: mode === 'view' || mode === 'delete' ? true : false,
      postData: 'text'
    }
  ];
  const lookUpPropsMarketing = [
    {
      columns: [{ key: 'nama', name: 'NAMA' }],
      // filterby: { class: 'system', method: 'get' },
      labelLookup: 'MARKETING LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'marketing',
      label: 'MARKETING',
      singleColumn: true,
      pageSize: 20,
      showOnButton: true,
      disabled: mode === 'view' || mode === 'delete' ? true : false,
      postData: 'nama',
      dataToPost: 'id' //untuk pilih kolom yg mau diambil valuenya, bisa selain id
    }
  ];
  const formRef = useRef<HTMLFormElement | null>(null); // Ref untuk form
  const openName = useSelector((state: RootState) => state.lookup.openName);
  const dispatch = useDispatch();

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
          element.tagName !== 'BUTTON' && !element.hasAttribute('readonly') // Pengecualian jika input readonly
      ) as HTMLElement[]; // Ambil semua input dalam form kecuali button dan readonly inputs

      const focusedElement = document.activeElement as HTMLElement;

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
              ? 'Add Marketing Group'
              : mode === 'edit'
              ? 'Edit Marketing Group'
              : mode === 'delete'
              ? 'Delete Marketing Group'
              : 'View Marketing Group'}
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
                  <div className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                    <div className="w-full lg:w-[15%]">
                      <FormLabel
                        required={true}
                        className="text-sm font-semibold text-gray-700"
                      >
                        Marketing
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookUpPropsMarketing.map((props, index) => (
                        <LookUp
                          key={index}
                          name="marketing_id"
                          forms={forms}
                          {...props}
                          lookupValue={(id) =>
                            forms.setValue('marketing_id', Number(id))
                          }
                          required={true}
                          inputLookupValue={forms.getValues('marketing_id')}
                          lookupNama={forms.getValues('marketing_nama')}
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
                      {lookUpPropsStatusAktif.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          name="statusaktif"
                          forms={forms}
                          lookupValue={(id) =>
                            forms.setValue('statusaktif', id)
                          }
                          required={true}
                          inputLookupValue={forms.getValues('statusaktif')}
                          lookupNama={forms.getValues('statusaktif_text')}
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
            // onClick={onSubmit}
            onClick={(e) => {
              e.preventDefault();
              onSubmit(false);
              dispatch(setSubmitClicked(true));
            }}
            disabled={mode === 'view'}
            className="flex w-fit items-center gap-1 text-sm"
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
                // onClick={onSubmit}
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
                <p className="text-center">
                  {mode === 'delete' ? 'DELETE' : 'SAVE & ADD'}
                </p>
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

export default FormMarketingGroup;
