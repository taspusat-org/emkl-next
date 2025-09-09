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
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store/store';
import LookUp from '@/components/custom-ui/LookUp';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { IoMdClose } from 'react-icons/io';
import { FaSave } from 'react-icons/fa';
import { setSubmitClicked } from '@/lib/store/lookupSlice/lookupSlice';

interface FormBiayaemklProps {
  popOver: boolean;
  setPopOver: (value: boolean) => void;
  forms: any;
  onSubmit: any;
  mode: any;
  handleClose: () => void;
  isLoadingCreate: boolean;
  isLoadingUpdate: boolean;
  isLoadingDelete: boolean;
}

const FormBiayaemkl = ({
  popOver,
  setPopOver,
  forms,
  onSubmit,
  mode,
  handleClose,
  isLoadingCreate,
  isLoadingUpdate,
  isLoadingDelete
}: FormBiayaemklProps) => {
  const lookUpPropsBiaya = [
    {
      columns: [{ key: 'nama', name: 'BIAYA' }],
      labelLookup: 'BIAYA LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'biaya',
      label: 'BIAYA',
      singleColumn: true,
      pageSize: 20,
      dataToPost: 'id',
      showOnButton: true,
      postData: 'nama'
    }
  ];

  const lookUpPropsCOAHut = [
    {
      columns: [
        { key: 'coa', name: 'COA' },
        { key: 'keterangancoa', name: 'KETERANGAN COA' }
      ],
      labelLookup: 'COA HUTANG LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'akunpusat',
      label: 'COAHUT',
      singleColumn: false,
      pageSize: 20,
      postData: 'keterangancoa',
      dataToPost: 'coa',
      showOnButton: true
    }
  ];

  const lookUpPropsJenisorderan = [
    {
      columns: [{ key: 'nama', name: 'JENISORDERAN' }],
      labelLookup: 'JENIS ORDERAN LOOKUP',
      required: false,
      selectedRequired: false,
      endpoint: 'jenisorderan',
      label: 'JENISORDERAN',
      singleColumn: true,
      pageSize: 20,
      postData: 'nama',
      dataToPost: 'id',
      showOnButton: true
    }
  ];

  const lookUpPropsStatusAktif = [
    {
      columns: [{ key: 'text', name: 'STATUS' }],
      labelLookup: 'STATUS AKTIF LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'parameter?grp=status+aktif',
      label: 'STATUS AKTIF',
      singleColumn: true,
      pageSize: 20,
      dataToPost: 'id',
      showOnButton: true,
      postData: 'text'
    }
  ];

  const formRef = useRef<HTMLFormElement | null>(null);
  const openName = useSelector((state: RootState) => state.lookup.openName);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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
          !element.hasAttribute('readonly')
      ) as HTMLElement[];

      const focusedElement = document.activeElement as HTMLElement;

      const isImageDropzone =
        document.querySelector('input#image-dropzone') === focusedElement;
      const isFileInput =
        document.querySelector('input#file-input') === focusedElement;

      if (isImageDropzone || isFileInput) return;

      let nextElement: HTMLElement | null = null;

      if (event.key === 'ArrowDown' || event.key === 'Tab') {
        nextElement = getNextFocusableElement(inputs, focusedElement, 'down');
        if (event.key === 'Tab') {
          event.preventDefault();
        }
      } else if (
        event.key === 'ArrowUp' ||
        (event.shiftKey && event.key === 'Tab')
      ) {
        nextElement = getNextFocusableElement(inputs, focusedElement, 'up');
      }

      if (nextElement) {
        nextElement.focus();
      }
    };

    const getNextFocusableElement = (
      inputs: HTMLElement[],
      currentElement: HTMLElement,
      direction: 'up' | 'down'
    ): HTMLElement | null => {
      const index = Array.from(inputs).indexOf(currentElement as any);

      if (direction === 'down') {
        if (index === inputs.length - 1) {
          return null;
        }
        return inputs[index + 1];
      } else {
        return inputs[index - 1];
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openName]);

  return (
    <Dialog open={popOver} onOpenChange={setPopOver}>
      <DialogTitle hidden={true}>Title</DialogTitle>
      <DialogContent className="flex h-full min-w-full flex-col overflow-hidden border bg-white">
        <div className="flex items-center justify-between bg-[#e0ecff] px-2 py-2">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {mode === 'add'
              ? 'Add Biaya '
              : mode === 'edit'
              ? 'Edit Biaya '
              : mode === 'delete'
              ? 'Delete Biaya '
              : 'View Biaya '}
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
          <div className="min-h-full bg-white px-5 py-3 lg:h-full">
            <Form {...forms}>
              <form
                ref={formRef}
                onSubmit={(e) => {
                  e.preventDefault();
                  onSubmit(false);
                }}
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
                      <FormLabel
                        required={true}
                        className="text-sm font-semibold text-gray-700"
                      >
                        BIAYA
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookUpPropsBiaya.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(id) => {
                            forms.setValue('biaya_id', Number(id));
                          }}
                          lookupNama={forms.getValues('biaya_text')}
                          disabled={['view', 'delete'].includes(mode)}
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
                        COA Hutang
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookUpPropsCOAHut.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(value: any) => {
                            forms.setValue('coahut', value);
                          }}
                          name="coahut"
                          forms={forms}
                          lookupNama={forms.getValues('coahut_text')}
                          disabled={['view', 'delete'].includes(mode)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                    <div className="w-full lg:w-[15%]">
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        Jenis Orderan
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookUpPropsJenisorderan.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(value) => {
                            forms.setValue('jenisorderan_id', Number(value));
                          }}
                          lookupNama={forms.getValues('jenisorderan_text')}
                          disabled={mode === 'view' || mode === 'delete'}
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
                          lookupValue={(id) => {
                            forms.setValue('statusaktif', id);
                          }}
                          lookupNama={forms.getValues('text')}
                          disabled={mode === 'view' || mode === 'delete'}
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

export default FormBiayaemkl;
