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
import InputCurrency from '@/components/custom-ui/InputCurrency';
import InputDatePicker from '@/components/custom-ui/InputDatePicker';
import { formatCurrency } from '@/lib/utils';
import InputNumeric from '@/components/custom-ui/InputNumeric';
import InputMask from '@mona-health/react-input-mask';

interface FormShipperProps {
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

const FormShipper = ({
  popOver,
  setPopOver,
  forms,
  onSubmit,
  mode,
  handleClose,
  isLoadingCreate,
  isLoadingUpdate,
  isLoadingDelete
}: FormShipperProps) => {
  const lookUpPropsShipperAsal = [
    {
      columns: [{ key: 'nama', name: 'SHIPPER ASAL' }],
      labelLookup: 'SHIPPER ASAL LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'shipper',
      label: 'SHIPPER ASAL',
      singleColumn: true,
      pageSize: 20,
      dataToPost: 'id',
      showOnButton: true,
      postData: 'nama'
    }
  ];

  const lookUpPropsShipperParent = [
    {
      columns: [{ key: 'nama', name: 'SHIPPER PARENT' }],
      labelLookup: 'SHIPPER PARENT LOOKUP',
      required: false,
      selectedRequired: false,
      endpoint: 'shipper',
      label: 'SHIPPER PARENT',
      singleColumn: true,
      pageSize: 20,
      dataToPost: 'id',
      showOnButton: true,
      postData: 'nama'
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

  const lookUpPropsCOA = [
    {
      columns: [
        { key: 'coa', name: 'COA' },
        { key: 'keterangancoa', name: 'KETERANGANCOA' }
      ],
      labelLookup: 'COA LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'akunpusat',
      label: 'coa',
      singleColumn: false,
      pageSize: 20,
      postData: 'keterangancoa',
      dataToPost: 'coa',
      showOnButton: true
    }
  ];

  const lookUpPropsCOAPiutang = [
    {
      columns: [
        { key: 'coa', name: 'COA' },
        { key: 'keterangancoa', name: 'KETERANGANCOA' }
      ],
      labelLookup: 'COA PIUTANG LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'akunpusat',
      label: 'coapiutang',
      singleColumn: false,
      pageSize: 20,
      showOnButton: true,
      postData: 'keterangancoa',
      dataToPost: 'coa'
    }
  ];

  const lookUpPropsCOAHutang = [
    {
      columns: [
        { key: 'coa', name: 'COA' },
        { key: 'keterangancoa', name: 'KETERANGANCOA' }
      ],
      labelLookup: 'COA HUTANG LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'akunpusat',
      label: 'coahutang',
      singleColumn: false,
      pageSize: 20,
      showOnButton: true,
      postData: 'keterangancoa',
      dataToPost: 'coa'
    }
  ];

  const lookUpPropsCOAGiro = [
    {
      columns: [
        { key: 'coa', name: 'COA' },
        { key: 'keterangancoa', name: 'KETERANGANCOA' }
      ],
      labelLookup: 'COA GIRO LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'akunpusat',
      label: 'coagiro',
      singleColumn: false,
      pageSize: 20,
      showOnButton: true,
      postData: 'keterangancoa',
      dataToPost: 'coa'
    }
  ];

  const lookUpPropsMarketing = [
    {
      columns: [{ key: 'nama', name: 'MARKETING' }],
      labelLookup: 'MARKETING LOOKUP',
      required: true,
      selectedRequired: false,
      endpoint: 'marketing',
      label: 'MARKETING',
      singleColumn: true,
      pageSize: 20,
      showOnButton: true,
      postData: 'nama',
      dataToPost: 'id'
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
              ? 'Add Shipper '
              : mode === 'edit'
              ? 'Edit Shipper '
              : mode === 'delete'
              ? 'Delete Shipper '
              : 'View Shipper '}
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
          <div className="min-h-full bg-white  ">
            <Form {...forms}>
              <form
                ref={formRef}
                onSubmit={(e) => {
                  e.preventDefault();
                  onSubmit(false);
                }}
                className="flex h-full flex-col gap-6"
              >
                <div className="flex h-[100%] flex-col gap-2 px-5 py-3 lg:gap-3">
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
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
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

                  <FormField
                    name="contactperson"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          CONTACT PERSON
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
                    name="alamat"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          ALAMAT
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <Textarea
                              {...field}
                              value={field.value ?? ''}
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
                        COA
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookUpPropsCOA.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(value: any) => {
                            forms.setValue('coa', value);
                          }}
                          name="coa"
                          forms={forms}
                          lookupNama={forms.getValues('coa_text')}
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
                        COA PIUTANG
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookUpPropsCOAPiutang.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(value: any) => {
                            forms.setValue('coapiutang', value);
                          }}
                          name="coapiutang"
                          forms={forms}
                          lookupNama={forms.getValues('coapiutang_text')}
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
                        COA HUTANG
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookUpPropsCOAHutang.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(value: any) => {
                            forms.setValue('coahutang', value);
                          }}
                          name="coahutang"
                          forms={forms}
                          lookupNama={forms.getValues('coahutang_text')}
                          disabled={['view', 'delete'].includes(mode)}
                        />
                      ))}
                    </div>
                  </div>

                  <FormField
                    name="kota"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          KOTA
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
                    name="kodepos"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          KODEPOS
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
                    name="telp"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          TELP
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <InputMask
                              {...field}
                              mask="999999999999999"
                              maskPlaceholder={null}
                              value={field.value ?? ''}
                              className={`h-9 w-full rounded-sm border border-zinc-300 px-3 py-2 text-sm text-zinc-600 focus:border-blue-500 focus:bg-[#ffffee] ${
                                mode === 'delete'
                                  ? 'text-zinc-400'
                                  : 'text-zinc-900'
                              } focus:outline-none focus:ring-0`}
                              onChange={field.onChange}
                              type="text"
                              readOnly={mode === 'view' || mode === 'delete'}
                            ></InputMask>
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
                          EMAIL
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              value={field.value ?? ''}
                              className={`h-9 w-full rounded-sm border border-zinc-300 px-3 py-2 text-sm text-zinc-600 focus:border-blue-500 focus:bg-[#ffffee] ${
                                mode === 'delete'
                                  ? 'text-zinc-400'
                                  : 'text-zinc-900'
                              } focus:outline-none focus:ring-0`}
                              readOnly={mode === 'view' || mode === 'delete'}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="fax"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          FAX
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
                    name="web"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          WEB
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
                    name="creditlimit"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel
                          required={true}
                          className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]"
                        >
                          CREDIT LIMIT
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
                    name="creditterm"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel
                          required={true}
                          className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]"
                        >
                          CREDIT TERM
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <InputNumeric
                              value={field.value ?? ''}
                              onValueChange={(value: any) =>
                                forms.setValue('creditterm', Number(value))
                              }
                              readOnly={mode === 'view' || mode === 'delete'}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="credittermplus"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel
                          required={true}
                          className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]"
                        >
                          CREDIT TERM PLUS
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <InputNumeric
                              value={field.value ?? ''}
                              onValueChange={(value: any) =>
                                forms.setValue('credittermplus', Number(value))
                              }
                              readOnly={mode === 'view' || mode === 'delete'}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="npwp"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel
                          required={true}
                          className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]"
                        >
                          NPWP
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <InputMask
                              {...field}
                              mask="99.999.999.9-999.999"
                              maskPlaceholder={null}
                              value={field.value ?? ''}
                              className={`h-9 w-full rounded-sm border border-zinc-300 px-3 py-2 text-sm text-zinc-600 focus:border-blue-500 focus:bg-[#ffffee] ${
                                mode === 'delete'
                                  ? 'text-zinc-400'
                                  : 'text-zinc-900'
                              } focus:outline-none focus:ring-0`}
                              onChange={field.onChange}
                              type="text"
                              readOnly={mode === 'view' || mode === 'delete'}
                            ></InputMask>
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
                        COA GIRO
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookUpPropsCOAGiro.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(value: any) => {
                            forms.setValue('coagiro', value);
                          }}
                          name="coagiro"
                          forms={forms}
                          lookupNama={forms.getValues('coagiro_text')}
                          disabled={['view', 'delete'].includes(mode)}
                        />
                      ))}
                    </div>
                  </div>

                  <FormField
                    name="ppn"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          PPN
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
                    name="titipke"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          TITIP KE
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
                    name="ppnbatalmuat"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          PPN BATAL MUAT
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
                    name="grup"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          GRUP
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
                    name="formatdeliveryreport"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          FORMAT DELIVERY REPORT
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <InputNumeric
                              value={field.value ?? ''}
                              onValueChange={(value: any) =>
                                forms.setValue(
                                  'formatdeliveryreport',
                                  Number(value)
                                )
                              }
                              readOnly={mode === 'view' || mode === 'delete'}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="comodity"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          COMODITY
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
                    name="namashippercetak"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          NAMA SHIPPER CETAK
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
                    name="formatcetak"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          FORMAT CETAK
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <InputNumeric
                              value={field.value ?? ''}
                              onValueChange={(value: any) =>
                                forms.setValue('formatcetak', Number(value))
                              }
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
                        MARKETING
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookUpPropsMarketing.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(value: any) => {
                            forms.setValue('marketing_id', Number(value));
                          }}
                          lookupNama={forms.getValues('marketing_text')}
                          disabled={['view', 'delete'].includes(mode)}
                        />
                      ))}
                    </div>
                  </div>

                  <FormField
                    name="blok"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          BLOK
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
                    name="nomor"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          NOMOR
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
                    name="rt"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          RT
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
                    name="rw"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          RW
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
                    name="kelurahan"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          KELURAHAN
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
                    name="kabupaten"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          KABUPATEN
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
                    name="kecamatan"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          KECAMATAN
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
                    name="propinsi"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          PROPINSI
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
                    name="isdpp10psn"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          ISDPP10PSN
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
                    name="usertracing"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          USER TRACING
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
                    name="passwordtracing"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          PASSWORD TRACING
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
                    name="kodeprospek"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel
                          required={true}
                          className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]"
                        >
                          KODE PROSPEK
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
                    name="namashipperprospek"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel
                          required={true}
                          className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]"
                        >
                          NAMA SHIPPER PROSPEK
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
                    name="emaildelay"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          EMAIL DELAY
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ''}
                              type="email"
                              readOnly={mode === 'view' || mode === 'delete'}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="keterangan1barisinvoice"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          KETERANGAN 1 BARIS INVOICE
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
                    name="nik"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          NIK
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <InputMask
                              {...field}
                              mask="9999999999999999"
                              maskPlaceholder={null}
                              value={field.value ?? ''}
                              className={`h-9 w-full rounded-sm border border-zinc-300 px-3 py-2 text-sm text-zinc-600 focus:border-blue-500 focus:bg-[#ffffee] ${
                                mode === 'delete'
                                  ? 'text-zinc-400'
                                  : 'text-zinc-900'
                              } focus:outline-none focus:ring-0`}
                              onChange={field.onChange}
                              type="text"
                              readOnly={mode === 'view' || mode === 'delete'}
                            ></InputMask>
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="namaparaf"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          NAMA PARAF
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
                    name="saldopiutang"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          SALDO PIUTANG
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
                    name="keteranganshipperjobminus"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          KETERANGAN SHIPPER JOB MINUS
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
                    name="tglemailshipperjobminus"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          TANGGAL EMAIL SHIPPER JOB MINUS
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <InputDatePicker
                              value={field.value}
                              onChange={field.onChange}
                              showCalendar
                              onSelect={(date) =>
                                forms.setValue('tglemailshipperjobminus', date)
                              }
                              disabled={mode === 'view' || mode === 'delete'}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="tgllahir"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel
                          required={true}
                          className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]"
                        >
                          TANGGAL LAHIR
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <InputDatePicker
                              value={field.value}
                              onChange={field.onChange}
                              showCalendar
                              onSelect={(date) =>
                                forms.setValue('tgllahir', date)
                              }
                              disabled={mode === 'view' || mode === 'delete'}
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
                        SHIPPER ASAL
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookUpPropsShipperAsal.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(id) => {
                            forms.setValue('idshipperasal', Number(id));
                          }}
                          lookupNama={forms.getValues('shipperasal_text')}
                          disabled={mode === 'view' || mode === 'delete'}
                        />
                      ))}
                    </div>
                  </div>

                  <FormField
                    name="initial"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          INITIAL
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
                    name="tipe"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          TIPE
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
                    name="idtipe"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          ID TIPE
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <InputNumeric
                              value={field.value ?? ''}
                              onValueChange={(value: any) =>
                                forms.setValue('idtipe', Number(value))
                              }
                              readOnly={mode === 'view' || mode === 'delete'}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="idinitial"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          ID INITIAL
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <InputNumeric
                              value={field.value ?? ''}
                              onValueChange={(value: any) =>
                                forms.setValue('idinitial', Number(value))
                              }
                              readOnly={mode === 'view' || mode === 'delete'}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="nshipperprospek"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          NAMA SHIPPER PROSPEK
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
                    name="parentshipper_id"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          PARENT SHIPPER
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          {lookUpPropsShipperParent.map((props, index) => (
                            <LookUp
                              key={index}
                              {...props}
                              lookupValue={(id) =>
                                forms.setValue('parentshipper_id', Number(id))
                              }
                              inputLookupValue={forms.getValues(
                                'parentshipper_id'
                              )}
                              lookupNama={forms.getValues('parentshipper_text')}
                              disabled={mode === 'view' || mode === 'delete'}
                            />
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="npwpnik"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          NPWP NIK
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <InputMask
                              {...field}
                              mask="9999999999999999"
                              maskPlaceholder={null}
                              value={field.value ?? ''}
                              className={`h-9 w-full rounded-sm border border-zinc-300 px-3 py-2 text-sm text-zinc-600 focus:border-blue-500 focus:bg-[#ffffee] ${
                                mode === 'delete'
                                  ? 'text-zinc-400'
                                  : 'text-zinc-900'
                              } focus:outline-none focus:ring-0`}
                              onChange={field.onChange}
                              type="text"
                              readOnly={mode === 'view' || mode === 'delete'}
                            ></InputMask>
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="nitku"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          NITKU
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
                    name="kodepajak"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          KODE PAJAK
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
                        Status Aktif
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookUpPropsStatusAktif.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(value) => {
                            forms.setValue('statusaktif', value);
                          }}
                          lookupNama={forms.getValues('text')}
                          disabled={mode === 'view' || mode === 'delete'}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 z-10 m-0 flex h-fit items-end gap-2 bg-zinc-200 px-3 py-2">
                  <Button
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      onSubmit(false);
                      dispatch(setSubmitClicked(true));
                    }}
                    disabled={mode === 'view'}
                    className="flex w-fit items-center gap-1 text-sm"
                    loading={
                      isLoadingCreate || isLoadingUpdate || isLoadingDelete
                    }
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
                        loading={
                          isLoadingCreate || isLoadingUpdate || isLoadingDelete
                        }
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
                    <IoMdClose />
                    <p className="text-center text-white">Cancel</p>
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormShipper;
