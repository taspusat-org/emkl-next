'use client';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { changePasswordFn } from '@/lib/apis/auth.api';
import { useAlert } from '@/lib/store/client/useAlert';
import { RootState } from '@/lib/store/store';
import {
  ChangePasswordInput,
  changePasswordValidation
} from '@/lib/validations/auth.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const Page = () => {
  const { id } = useSelector((state: RootState) => state.auth);
  const { alert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const forms = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordValidation),
    mode: 'onSubmit',
    defaultValues: {
      newPassword: '',
      id: 0 // Memastikan id terisi dengan benar
    }
  });

  const onSubmit = async (value: ChangePasswordInput) => {
    if (forms.getValues('newPassword').length < 8) {
      alert({
        title: 'Password minimal 8 karakter',
        variant: 'danger',
        submitText: 'OK'
      });
      return;
    }
    try {
      setLoading(true);
      const res = await changePasswordFn(value);
      if (res.status === 200) {
        alert({
          title: 'Password Berhasil Diubah',
          variant: 'success',
          submitText: 'ok'
        });
        forms.setValue('newPassword', '');
      } else {
        console.error('Response status bukan 200:', res);
      }
    } catch (error: any) {
      console.error('Error:', error);
      const errorMessage =
        error?.response?.data?.message ||
        'Terjadi kesalahan saat mereset password. Mohon coba lagi.';
      alert({
        title: 'Error',
        variant: 'danger',
        submitText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      forms.setValue('id', Number(id)); // Memastikan id terupdate jika ada
    }
  }, [id]);

  return (
    <PageContainer scrollable>
      <div className="flex h-fit  w-full flex-col rounded-sm border border-blue-500 bg-white">
        <div
          className="flex h-[38px] w-full flex-row items-center rounded-t-sm border-b border-blue-500 px-2"
          style={{
            background: 'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 100%)'
          }}
        >
          <p className="font-bold text-zinc-500">UBAH PASSWORD</p>
        </div>
        <div className="px-4 py-4">
          <Form {...forms}>
            <form
              onSubmit={forms.handleSubmit(onSubmit)}
              className="flex flex-col gap-6"
            >
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <FormField
                    name="newPassword"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                        <FormLabel className="font-semibold text-gray-700 dark:text-gray-200 lg:w-[10%]">
                          Password
                        </FormLabel>
                        <div className="flex flex-col lg:w-[90%]">
                          <FormControl>
                            <div className="flex flex-1 flex-row rounded-md border border-zinc-300 px-2 focus-within:border-blue-500 focus-within:bg-[#ffffee]">
                              <input
                                {...field}
                                autoFocus
                                value={field.value ?? ''}
                                type={showPassword ? 'text' : 'password'}
                                className="h-9 w-full border-none bg-transparent p-0 text-sm text-zinc-600 focus:border-0 focus:outline-none focus:ring-0 focus-visible:ring-0"
                              />
                              <div
                                onClick={() => setShowPassword(!showPassword)}
                                className="flex cursor-pointer items-center justify-center text-gray-400"
                              >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  className="mt-6 flex w-fit items-center gap-1"
                  loading={loading}
                  variant="save"
                >
                  Save
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </PageContainer>
  );
};

export default Page;
