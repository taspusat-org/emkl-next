'use client';
import { Metadata } from 'next';
import { Input } from '@/components/ui/input';
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
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import {
  EmailInput,
  PasswordInput,
  passwordValidation
} from '@/lib/validations/auth.validation';
import { Button } from '@/components/ui/button';
import { checkTokenFn, newPasswordFn } from '@/lib/apis/auth.api';
import bgImage from '@/public/image/bg-top.png';
import { useEffect, useState } from 'react';
import { useAlert } from '@/lib/store/client/useAlert';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { ImSpinner2 } from 'react-icons/im';
export default function Page() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const { alert } = useAlert();
  const token = searchParams?.get('token'); // Ambil token dari URL
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConf, setShowPasswordConf] = useState(false);
  const [confPassword, setConfPassword] = useState('');
  const forms = useForm<PasswordInput>({
    resolver: zodResolver(passwordValidation),
    mode: 'onSubmit',
    defaultValues: {
      newPassword: '',
      token: token || ''
    }
  });
  const [isTokenValid, setIsTokenValid] = useState<boolean>(false);
  const [checkingToken, setCheckingToken] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        router.replace('/auth/reset-password/expired');
        return;
      }

      try {
        const res = await checkTokenFn({ token });
        if (res.data.valid) {
          setIsTokenValid(true);
        } else {
          router.replace('/auth/reset-password/expired');
        }
      } catch (err) {
        router.replace('/auth/reset-password/expired');
      } finally {
        setCheckingToken(false);
      }
    };

    checkToken();
  }, [token, router]);

  if (checkingToken) {
    return (
      <div
        className="flex h-screen w-full items-center justify-center"
        style={{ textAlign: 'center', gridColumn: '1/-1' }}
      >
        <ImSpinner2 className="animate-spin text-3xl text-primary" />
      </div>
    );
  }

  if (!isTokenValid) {
    return null;
  }

  const onSubmit = async (value: PasswordInput) => {
    setLoading(true);

    if (forms.getValues('newPassword') !== confPassword) {
      setLoading(true);
      alert({
        title: 'Password dan Konfirmasi Password tidak sama',
        variant: 'danger',
        submitText: 'OK'
      });
      setLoading(false);
      return;
    }
    if (!token) {
      setLoading(true);
      alert({
        title: 'Link reset password sudah tidak valid, coba lagi',
        variant: 'danger',
        submitText: 'OK'
      });
      setLoading(false);
      return;
    }
    if (forms.getValues('newPassword').length < 8) {
      setLoading(true);
      alert({
        title: 'Password minimal 8 karakter',
        variant: 'danger',
        submitText: 'OK'
      });
      setLoading(false);

      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Kirim request ke API untuk mereset password
      const res = await newPasswordFn(value);
      if (res.status === 200 || res.status === 201) {
        alert({
          title: 'Password Berhasil Diubah',
          variant: 'success',
          submitText: 'ok'
        });
        router.push('/auth/signin');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Error:', error);
      const errorMessage =
        error?.response?.data?.message ||
        'Terjadi kesalahan saat mereset password. Mohon coba lagi.';

      setError('An error occurred while resetting the password');
      alert({
        title: errorMessage,
        variant: 'danger',
        submitText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex max-h-screen min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#e9ecef]"
      style={{
        maxHeight: '100vh', // Full screen height
        width: '100%' // Full width
      }}
    >
      <div className="flex h-fit w-full flex-col items-center justify-between bg-[#fff] pb-2 shadow-xl lg:w-[20%]">
        <div
          className="mb-3 w-full border border-blue-500 px-3 py-2"
          style={{
            background: 'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 100%)'
          }}
        >
          <h2 className="text-center text-lg font-bold text-gray-800 dark:text-white">
            Reset Password
          </h2>
        </div>
        <Form {...forms}>
          <form
            onSubmit={forms.handleSubmit(onSubmit)}
            className="flex w-full flex-col gap-6 px-2"
          >
            <div className="flex flex-col gap-4">
              <FormField
                name="newPassword"
                control={forms.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-gray-700 dark:text-gray-200">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="flex flex-1 flex-row rounded-md border border-zinc-300 px-2">
                        <input
                          {...field}
                          value={field.value ?? ''}
                          type={showPassword ? 'text' : 'password'}
                          className="h-9 w-full border-none p-0 text-sm text-zinc-900 focus:border-0 focus:outline-none focus:ring-0 focus-visible:ring-0"
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
                  </FormItem>
                )}
              />
              <div className="flex flex-col">
                <label
                  htmlFor=""
                  className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200"
                >
                  Konfirmasi Password
                </label>
                <div className="flex flex-1 flex-row rounded-md border border-zinc-300 px-2">
                  <input
                    type={showPasswordConf ? 'text' : 'password'}
                    className="h-9 w-full border-none p-0 text-sm text-zinc-900 focus:border-0 focus:outline-none focus:ring-0 focus-visible:ring-0"
                    value={confPassword}
                    onChange={(e) => setConfPassword(e.target.value)}
                  />
                  <div
                    onClick={() => setShowPasswordConf(!showPasswordConf)}
                    className="flex cursor-pointer items-center justify-center text-gray-400"
                  >
                    {showPasswordConf ? <FaEyeSlash /> : <FaEye />}
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" className="mt-6 w-full" loading={loading}>
              Submit
            </Button>

            <div className="text-center">
              <p className="text-center text-sm text-gray-600">
                <Link
                  href="/auth/signin"
                  className="text-blue-600 hover:underline"
                >
                  Kembali ke Login
                </Link>
              </p>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
