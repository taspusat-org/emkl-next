'use client';
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
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { MultiSelect } from '@/components/custom-ui/MultiSelect';
import { useGetRole } from '@/lib/server/useRole';
import { useGetUserRole } from '@/lib/server/useUser';
import { FaSave } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';

const FormUserRole = ({
  popOver,
  setPopOver,
  forms,
  onSubmit,
  deleteMode,
  handleClose,
  isLoadingCreate,
  isLoadingUpdate
}: any) => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const { data: roleData, refetch } = useGetRole();
  const roleUserDetail = useSelector((state: RootState) => state.user.value);
  const { data: userrole, isLoading: isLoadingUserRole } = useGetUserRole(
    roleUserDetail?.id ?? 0 // Gunakan default 0 jika id undefined
  );
  useEffect(() => {
    if (popOver) {
      refetch();
    }
  }, [popOver, refetch]);
  useEffect(() => {
    if (popOver && userrole && userrole.data) {
      // Ambil role IDs dari data userrole
      const roleIds = userrole.data.map((item: any) => item.id);
      // Set nilai roleIds ke forms dan selectedRoles
      setSelectedRoles(roleIds);
      forms.setValue('roleIds', roleIds);
    }
  }, [popOver, userrole, forms]);
  const rolesList =
    roleData?.data.map((role: any) => ({
      value: role.id.toString(),
      label: role.rolename
    })) || [];
  return (
    <Dialog open={popOver} onOpenChange={setPopOver}>
      <DialogTitle hidden={true}>User Form</DialogTitle>
      <DialogContent className="flex h-full min-w-full flex-col overflow-hidden border bg-white">
        <div className="flex items-center justify-between bg-[#e0ecff] px-2 py-2">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            User Role Form
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
                      name="username"
                      control={forms.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-gray-700 dark:text-gray-200">
                            Username
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={(field.value as string) ?? ''}
                              type="text"
                              readOnly={true}
                              placeholder="Masukkan Username"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="roleIds"
                      control={forms.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-gray-700 dark:text-gray-200">
                            Role
                          </FormLabel>
                          <FormControl>
                            <MultiSelect
                              options={rolesList}
                              defaultValue={selectedRoles}
                              onValueChange={(values) => {
                                setSelectedRoles(values);
                                forms.setValue(
                                  'roleIds',
                                  values.map((value) => value)
                                );
                              }}
                              value={selectedRoles}
                              placeholder="Select roles"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
            className="flex w-fit items-center gap-1 text-sm"
          >
            <FaSave />
            <p className="text-center">{deleteMode ? 'DELETE' : 'SAVE'}</p>
          </Button>
          <Button type="button" variant="cancel" onClick={handleClose}>
            <p>Cancel</p>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormUserRole;
