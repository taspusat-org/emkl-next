/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
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
import { useEffect, useState } from 'react';
import { FaRegPlusSquare, FaSave, FaTrashAlt } from 'react-icons/fa';
import { useFormContext } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { IoMdClose } from 'react-icons/io';
import LookUp from '@/components/custom-ui/LookUp';
interface RowData {
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

const FormError = ({
  popOver,
  setPopOver,
  forms,
  onSubmit,
  deleteMode,
  handleClose,
  isLoadingCreate,
  isLoadingUpdate,
  viewMode,
  isLoadingDelete
}: any) => {
  const lookUpPropsStatusAktif = [
    {
      columns: [{ key: 'text', name: 'NAMA' }],
      // filterby: { class: 'system', method: 'get' },
      labelLookup: 'STATUS AKTIF LOOKUP',
      selectedRequired: false,
      endpoint: 'parameter?grp=status+aktif',
      label: 'status aktif',
      singleColumn: true,
      pageSize: 20,
      showOnButton: true,
      postData: 'text'
    }
  ];
  return (
    <Dialog open={popOver} onOpenChange={setPopOver} modal={true}>
      <DialogContent className="flex h-full min-w-full flex-col overflow-hidden border bg-white">
        <div className="flex items-center justify-between bg-[#e0ecff] px-2 py-2">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Error Form
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
                <div className="flex-grow">
                  <div className="grid grid-cols-1 gap-2">
                    <FormField
                      name="kode"
                      control={forms.control}
                      render={({ field }) => (
                        <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                          <FormLabel
                            required
                            className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]"
                          >
                            Kode Error
                          </FormLabel>
                          <div className="flex flex-col lg:w-[85%]">
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
                      name="ket"
                      control={forms.control}
                      render={({ field }) => (
                        <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                          <FormLabel
                            required
                            className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[15%]"
                          >
                            Keterangan
                          </FormLabel>
                          <div className="flex flex-col lg:w-[85%]">
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
                            disabled={deleteMode}
                            lookupValue={(id) =>
                              forms.setValue('statusaktif', Number(id))
                            }
                            inputLookupValue={forms.getValues('statusaktif')}
                            lookupNama={forms.getValues('statusaktif_text')}
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

export default FormError;
