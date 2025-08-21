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
import { useEffect, useState } from 'react';
import { api, api2 } from '@/lib/utils/AxiosInstance';
import LookUp from '@/components/custom-ui/LookUp';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { IoMdClose } from 'react-icons/io';
import { FaSave } from 'react-icons/fa';

const FormCabang = ({
  popOver,
  setPopOver,
  forms,
  onSubmit,
  deleteMode,
  handleClose,
  viewMode,
  isLoadingCreate,
  isLoadingDelete,
  isLoadingUpdate
}: any) => {
  const { fieldLength } = useSelector((state: RootState) => state.fieldLength);
  const [submitClick, setSubmitClick] = useState(false);
  interface FieldLengthDetails {
    column: string;
    length: number;
  }
  const lookUpProps = [
    {
      columns: [{ key: 'text', name: 'TEXT' }],
      // filterby: { class: 'system', method: 'get' },
      selectedRequired: false,
      endpoint: 'parameter?grp=status+aktif',
      label: 'status aktif',
      singleColumn: true,
      pageSize: 20,
      showOnButton: true,
      postData: 'text'
    }
  ];
  const lookUpPeriode = [
    {
      columns: [{ key: 'text', name: 'TEXT' }],
      // filterby: { class: 'system', method: 'get' },
      selectedRequired: false,
      required: true,
      isSubmitClicked: submitClick,
      endpoint: 'parameter?grp=periodecabang',
      label: 'periode cabang',
      singleColumn: true,
      pageSize: 20,
      dataToPost: 'id',
      showOnButton: true,
      postData: 'text'
    }
  ];
  const lookUpMinusCuti = [
    {
      columns: [{ key: 'text', name: 'TEXT' }],
      // filterby: { class: 'system', method: 'get' },
      selectedRequired: false,
      required: true,
      isSubmitClicked: submitClick,
      endpoint: 'parameter?grp=minus+cuti',
      label: 'MINUS CUTI',
      singleColumn: true,
      pageSize: 20,
      dataToPost: 'id',
      showOnButton: true,
      postData: 'text'
    }
  ];

  const fetchFieldLengths = async () => {
    try {
      Object.entries(fieldLength).forEach(([index, value]) => {
        if (
          typeof index === 'string' &&
          value !== null &&
          value !== undefined
        ) {
          const inputElement = document.getElementsByName(value.column)[0]; // Get input

          if (inputElement) {
            inputElement.setAttribute('maxlength', value.length.toString());
          } else {
            console.warn(`Input with name '${value.column}' not found.`);
          }
        }
      });
    } catch (error) {
      console.error('Error fetching field lengths:', error);
    }
  };

  useEffect(() => {
    if (fieldLength.length > 0 && popOver) {
      setTimeout(() => {
        fetchFieldLengths();
      }, 100);
    }
  }, [fieldLength, popOver]);

  return (
    <Dialog open={popOver} onOpenChange={setPopOver}>
      <DialogTitle hidden={true}>Cabang Form</DialogTitle>
      <DialogContent className="flex h-full min-w-full flex-col overflow-hidden border bg-white">
        <div className="flex items-center justify-between bg-[#e0ecff] px-2 py-2">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Form Cabang
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
              <form onSubmit={onSubmit} className="flex h-full flex-col gap-6">
                <div className="flex h-[100%] flex-col gap-2 lg:gap-3">
                  <FormField
                    name="kodecabang"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel
                          required={true}
                          className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]"
                        >
                          Kode Cabang
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <Input
                              {...field}
                              value={(field.value as string) ?? ''}
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
                    name="nama"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel
                          required={true}
                          className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]"
                        >
                          Nama Cabang
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <Input
                              {...field}
                              value={(field.value as string) ?? ''}
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
                    name="keterangan"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]">
                          Keterangan
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <Input
                              {...field}
                              value={(field.value as string) ?? ''}
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
                  <div className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                    <div className="w-full lg:w-[15%]">
                      <FormLabel
                        required
                        className="text-sm font-semibold text-gray-700"
                      >
                        PERIODE
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookUpPeriode.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(id) => forms.setValue('periode', id)}
                          inputLookupValue={forms.getValues('periode')}
                          lookupNama={forms.getValues('periode_text')}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                    <div className="w-full lg:w-[15%]">
                      <FormLabel
                        required
                        className="text-sm font-semibold text-gray-700"
                      >
                        MINUS CUTI
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookUpMinusCuti.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(id) => forms.setValue('minuscuti', id)}
                          inputLookupValue={forms.getValues('minuscuti')}
                          lookupNama={forms.getValues('minuscuti_text')}
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

export default FormCabang;
