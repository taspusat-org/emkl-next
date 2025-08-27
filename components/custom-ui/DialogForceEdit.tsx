import React, { useState } from 'react';
import { Input } from '../ui/input';
import { LoginInput, loginValidation } from '@/lib/validations/auth.validation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';
import {
  setProcessed,
  setProcessing
} from '@/lib/store/loadingSlice/loadingSlice';
import { useDispatch } from 'react-redux';
import { useToast } from '@/hooks/use-toast';
import { verifyForceEditFn } from '@/lib/apis/global.api';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSubmit: (username: string, password: string) => void;
  value?: string | number;
  tableNameForceEdit?: string;
}

const DialogForceEdit: React.FC<LoginDialogProps> = ({
  open,
  onClose,
  value,
  onSuccess,
  tableNameForceEdit
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { forceedit } = useSelector((state: RootState) => state.forceedit);

  const dispatch = useDispatch();
  const { toast } = useToast();
  const forms = useForm<LoginInput>({
    resolver: zodResolver(loginValidation),
    mode: 'onTouched',
    defaultValues: {
      username: '',
      password: ''
    }
  });
  console.log('forceedit', forceedit);
  const onSubmit = async (values: LoginInput) => {
    dispatch(setProcessing());

    // Log the payload to check
    const payload = {
      ...values,
      tableName: forceedit,
      fieldValue: value
    };

    try {
      const result = await verifyForceEditFn(payload);
      if (result?.error) {
        toast({
          title: 'Login Gagal',
          description: 'Login Gagal Coba sekali lagi.'
        });
      } else {
        toast({
          title: 'Login Success',
          description: 'You have successfully logged in.'
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      dispatch(setProcessed());
    }
  };

  return (
    open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50 p-4">
        <div className="w-full max-w-sm rounded bg-white p-6 shadow-lg">
          <h3 className="text-center text-lg font-medium">Login Form</h3>
          <Form {...forms}>
            <form onSubmit={forms.handleSubmit(onSubmit)} className="mt-4">
              <div className="mb-4">
                <FormField
                  name="username"
                  control={forms.control}
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                      <FormLabel className="font-semibold text-gray-700 lg:w-[15%]">
                        Username
                      </FormLabel>
                      <div className="flex flex-col lg:w-[70%]">
                        <FormControl>
                          <div className="flex flex-1 flex-row rounded-[3px] border border-zinc-300 bg-white focus-within:border-blue-500 focus-within:bg-[#ffffee]">
                            <Input
                              {...field}
                              autoFocus
                              value={field.value ?? ''}
                              type="text"
                              className="w-full rounded-[5px] border-none p-0 pl-2 text-sm placeholder:text-xs focus:outline-none focus:ring-0 focus-visible:ring-0"
                            />
                            <div className="flex w-10 items-center justify-center rounded-br-[3px] rounded-tr-[3px] bg-gray-200 text-gray-600">
                              <FaUser />
                            </div>
                          </div>
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <div className="mb-4">
                <FormField
                  name="password"
                  control={forms.control}
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
                      <FormLabel className="font-semibold text-gray-700 lg:w-[15%]">
                        Password
                      </FormLabel>
                      <div className="flex flex-col lg:w-[70%]">
                        <FormControl>
                          <div className="flex flex-1 flex-row rounded-[3px] border border-zinc-300 bg-white focus-within:border-blue-500 focus-within:bg-[#ffffee]">
                            <input
                              {...field}
                              value={field.value ?? ''}
                              type={showPassword ? 'text' : 'password'}
                              className="h-9 w-full rounded-[5px] border-none bg-white p-0 pl-2 text-sm text-zinc-900 focus:bg-[#ffffee] focus:outline-none focus:ring-0 focus-visible:ring-0"
                            />
                            <div
                              onClick={() => setShowPassword(!showPassword)}
                              className="flex w-10 cursor-pointer items-center justify-center rounded-br-[3px] rounded-tr-[3px] bg-gray-200 text-gray-600"
                            >
                              {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </div>
                          </div>
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-sm text-red-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-blue-500 px-4 py-2 text-sm text-white"
                >
                  Submit
                </button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    )
  );
};

export default DialogForceEdit;
