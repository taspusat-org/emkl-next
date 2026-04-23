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
import InputDatePicker from '@/components/custom-ui/InputDatePicker';
import InputCurrency from '@/components/custom-ui/InputCurrency';

interface FormMasterbiayaProps {
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

const FormMasterbiaya = ({
  popOver,
  setPopOver,
  forms,
  onSubmit,
  mode,
  handleClose,
  isLoadingCreate,
  isLoadingUpdate,
  isLoadingDelete
}: FormMasterbiayaProps) => {
  const lookUpPropsTujuankapal = [
    {
      columns: [{ key: 'nama', name: 'TUJUAN KAPAL' }],
      labelLookup: 'TUJUAN KAPAL LOOKUP',
      required: false,
      selectedRequired: false,
      endpoint: 'tujuankapal',
      label: 'TUJUAN KAPAL',
      singleColumn: true,
      pageSize: 20,
      postData: 'nama',
      dataToPost: 'id',
      showOnButton: true
    }
  ];

  const lookUpPropsSandarkapal = [
    {
      columns: [{ key: 'nama', name: 'SANDAR KAPAL' }],
      labelLookup: 'SANDAR KAPAL LOOKUP',
      required: false,
      selectedRequired: false,
      endpoint: 'sandarkapal',
      label: 'SANDAR KAPAL',
      singleColumn: true,
      pageSize: 20,
      postData: 'nama',
      dataToPost: 'id',
      showOnButton: true
    }
  ];

  const lookUpPropsPelayaran = [
    {
      columns: [{ key: 'nama', name: 'PELAYARAN' }],
      labelLookup: 'PELAYARAN LOOKUP',
      required: false,
      selectedRequired: false,
      endpoint: 'pelayaran',
      label: 'PELAYARAN',
      singleColumn: true,
      pageSize: 20,
      postData: 'nama',
      dataToPost: 'id',
      showOnButton: true
    }
  ];

  const lookUpPropsContainer = [
    {
      columns: [{ key: 'nama', name: 'CONTAINER' }],
      labelLookup: 'CONTAINER LOOKUP',
      required: false,
      selectedRequired: false,
      endpoint: 'container',
      label: 'CONTAINER',
      singleColumn: true,
      pageSize: 20,
      postData: 'nama',
      dataToPost: 'id',
      showOnButton: true
    }
  ];

  const lookUpPropsBiayaemkl = [
    {
      columns: [{ key: 'nama', name: 'BIAYA EMKL' }],
      labelLookup: 'BIAYA EMKL LOOKUP',
      required: false,
      selectedRequired: false,
      endpoint: 'biayaemkl',
      label: 'BIAYA EMKL',
      singleColumn: true,
      pageSize: 20,
      postData: 'nama',
      dataToPost: 'id',
      showOnButton: true
    }
  ];

  const lookUpPropsJenisorderan = [
    {
      columns: [{ key: 'nama', name: 'JENIS ORDERAN' }],
      labelLookup: 'JENIS ORDERAN LOOKUP',
      required: false,
      selectedRequired: false,
      endpoint: 'jenisorderan',
      singleColumn: true,
      pageSize: 20,
      postData: 'nama',
      dataToPost: 'id',
      showOnButton: true
    }
  ];

  const lookUpPropsStatusAktif = [
    {
      columns: [{ key: 'text', name: 'NAMA' }],
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

  return (
    <Dialog open={popOver} onOpenChange={setPopOver}>
      <DialogTitle hidden={true}>Title</DialogTitle>
      <DialogContent className="flex h-full min-w-full flex-col overflow-hidden border border-border bg-background">
        <div className="flex items-center justify-between bg-background-form-header px-2 py-2">
          <h2 className="text-sm font-semibold">
            {mode === 'add'
              ? 'Add Master Biaya '
              : mode === 'edit'
              ? 'Edit Master Biaya '
              : mode === 'delete'
              ? 'Delete Master Biaya '
              : 'View Master Biaya '}
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

        <div className="h-full flex-1 overflow-y-auto bg-background-card pl-1 pr-2">
          <div className="h-full bg-background-card px-5 py-3">
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
                  <div className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                    <div className="w-full lg:w-[15%]">
                      <FormLabel className="text-sm font-semibold">
                        Tujuan Kapal
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookUpPropsTujuankapal.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(value) => {
                            forms.setValue('tujuankapal_id', Number(value));
                          }}
                          lookupNama={forms.getValues('tujuankapal_text')}
                          disabled={mode === 'view' || mode === 'delete'}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                    <div className="w-full lg:w-[15%]">
                      <FormLabel className="text-sm font-semibold">
                        Sandar Kapal
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookUpPropsSandarkapal.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(value) => {
                            forms.setValue('sandarkapal_id', Number(value));
                          }}
                          lookupNama={forms.getValues('sandarkapal_text')}
                          disabled={mode === 'view' || mode === 'delete'}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                    <div className="w-full lg:w-[15%]">
                      <FormLabel className="text-sm font-semibold">
                        Pelayaran
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookUpPropsPelayaran.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(value) => {
                            forms.setValue('pelayaran_id', Number(value));
                          }}
                          lookupNama={forms.getValues('pelayaran_text')}
                          disabled={mode === 'view' || mode === 'delete'}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                    <div className="w-full lg:w-[15%]">
                      <FormLabel className="text-sm font-semibold">
                        Container
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookUpPropsContainer.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(value) => {
                            forms.setValue('container_id', Number(value));
                          }}
                          lookupNama={forms.getValues('container_text')}
                          disabled={mode === 'view' || mode === 'delete'}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                    <div className="w-full lg:w-[15%]">
                      <FormLabel className="text-sm font-semibold">
                        Biaya Emkl
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookUpPropsBiayaemkl.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(value) => {
                            forms.setValue('biayaemkl_id', Number(value));
                          }}
                          lookupNama={forms.getValues('biayaemkl_text')}
                          disabled={mode === 'view' || mode === 'delete'}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                    <div className="w-full lg:w-[15%]">
                      <FormLabel className="text-sm font-semibold">
                        Jenis Orderan
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookUpPropsJenisorderan.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(value) => {
                            forms.setValue('jenisorder_id', Number(value));
                          }}
                          lookupNama={forms.getValues('jenisorderan_text')}
                          disabled={mode === 'view' || mode === 'delete'}
                        />
                      ))}
                    </div>
                  </div>

                  <FormField
                    name="tglberlaku"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel
                          required={true}
                          className="font-semibold lg:w-[15%]"
                        >
                          TGL BERLAKU
                        </FormLabel>
                        <div className="flex flex-col lg:w-[85%]">
                          <FormControl>
                            <InputDatePicker
                              value={field.value}
                              onChange={field.onChange}
                              disabled={mode === 'view' || mode === 'delete'}
                              showCalendar
                              onSelect={(date) =>
                                forms.setValue('tglberlaku', date)
                              }
                            />
                            {/* <InputDateTimePicker
                                                  value={field.value} // '' saat kosong
                                                  onChange={field.onChange} // string keluar (mis. "16-08-2025 09:25 AM")
                                                  showCalendar
                                                  showTime // aktifkan 12h + AM/PM
                                                  minuteStep={1}
                                                  fromYear={1960}
                                                  toYear={2035}
                                                  // outputFormat="dd-MM-yyyy hh:mm a" // default sudah begini saat showTime
                                                /> */}
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
                          className="font-semibold lg:w-[15%]"
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

                  <div className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                    <div className="w-full lg:w-[15%]">
                      <FormLabel
                        required={true}
                        className="text-sm font-semibold"
                      >
                        Status Aktif
                      </FormLabel>
                    </div>
                    <div className="w-full lg:w-[85%]">
                      {lookUpPropsStatusAktif.map((props, index) => (
                        <LookUp
                          key={index}
                          {...props}
                          lookupValue={(id) =>
                            forms.setValue('statusaktif', id)
                          }
                          inputLookupValue={forms.getValues('statusaktif')}
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

        <div className="m-0 flex h-fit items-end gap-2 bg-background-form-footer px-3 py-2">
          <Button
            type="submit"
            variant="save"
            onClick={(e) => {
              e.preventDefault();
              onSubmit(false);
              dispatch(setSubmitClicked(true));
            }}
            disabled={mode === 'view'}
            className="flex w-fit items-center gap-1 text-sm"
            loading={isLoadingCreate || isLoadingUpdate || isLoadingDelete}
          >
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
                <p className="text-center">SAVE & ADD</p>
              </Button>
            </div>
          )}

          <Button type="button" variant="cancel" onClick={handleClose}>
            <p>Cancel</p>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormMasterbiaya;
