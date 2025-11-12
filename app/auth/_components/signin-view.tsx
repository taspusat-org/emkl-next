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
import { getSession, signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { LoginInput, loginValidation } from '@/lib/validations/auth.validation';
import { Button } from '@/components/ui/button';
import { setCredentials, User } from '@/lib/store/authSlice/authSlice';
import IcTasSmall from '@/public/image/IcTas-Small.png';
import { useDispatch } from 'react-redux';
import Image from 'next/image';
import { FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';
import bgImage from '@/public/image/bg-top.png';
import IcHeader from '@/public/image/header.png';
import { useLottie } from 'lottie-react';
import LoginAnimation from '@/public/image/lottie/login.json';
import { storeEmailVerificationFn } from '@/lib/apis/auth.api';
import { useAlert } from '@/lib/store/client/useAlert';
import {
  setLoaded,
  setLoading,
  setProcessed,
  setProcessing
} from '@/lib/store/loadingSlice/loadingSlice';
import { truncateSync } from 'fs';
export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};

export default function SignInViewPage() {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const { alert } = useAlert();
  const router = useRouter();
  const [loadings, setLoadings] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pageLoadTime, setPageLoadTime] = useState<number | null>(2000);
  const forms = useForm<LoginInput>({
    resolver: zodResolver(loginValidation),
    mode: 'onTouched',
    defaultValues: {
      username: '',
      password: ''
    }
  });
  const onSubmitResetPassword = async () => {
    setLoadings(true);
    dispatch(setProcessing());
    const value = forms.getValues('username');
    try {
      const res = await storeEmailVerificationFn({ username: value ?? '' });
      if (res.status === 200 || res.status === 201) {
        alert({
          title: res?.data.message,
          variant: 'success',
          submitText: 'OK'
        });
      } else {
        const errorMessage =
          res.data?.message || 'Terjadi kesalahan, silakan coba lagi.';
        alert({
          title: errorMessage,
          variant: 'danger',
          submitText: 'OK'
        });
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        'Terjadi kesalahan saat mereset password. Mohon coba lagi.';

      alert({
        title: errorMessage,
        variant: 'danger',
        submitText: 'OK'
      });
    } finally {
      setLoadings(false);
      dispatch(setProcessed());
    }
  };
  const onSubmit = async (values: LoginInput) => {
    setLoadings(true);
    dispatch(setProcessing());
    try {
      if (!values.username && !values.password) {
        alert({
          title: 'USERNAME DAN PASSWORD WAJIB DIISI',
          variant: 'danger',
          submitText: 'OK'
        });
        return;
      } else {
        if (!values.username) {
          alert({
            title: 'USERNAME WAJIB DIISI',
            variant: 'danger',
            submitText: 'OK'
          });
          return;
        }
        if (!values.password) {
          alert({
            title: 'PASSWORD WAJIB DIISI',
            variant: 'danger',
            submitText: 'OK'
          });
          return;
        }
      }

      const result = await signIn('credentials', {
        redirect: false,
        username: values.username,
        password: values.password
      });

      setLoadings(false);

      if (result?.error) {
        alert({
          title: result.error,
          variant: 'danger',
          submitText: 'OK'
        });
      } else {
        // Gunakan getSession untuk mendapatkan session setelah login
        const session = await getSession();

        if (session) {
          // Jika sesi sudah ada, arahkan ke dashboard
          router.replace('/dashboard'); // Menggunakan replace agar tidak menambah riwayat
        } else {
          // Jika sesi gagal diinisialisasi, kembali ke halaman login
          router.push('/auth/signin');
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      dispatch(setProcessed());
      setLoadings(false);
    }
  };

  const options = {
    animationData: LoginAnimation,
    loop: true
  };

  const { View } = useLottie(options);
  useEffect(() => {
    if (session) {
      dispatch(
        setCredentials({
          user: (session.user as User) ?? null,
          id: session.user.id ?? null,
          cabang_id: session.cabang_id ?? null
        })
      );
      // Jika sesi sudah diupdate, arahkan ke dashboard
      router.replace('/dashboard');
    }
  }, [session, dispatch, router]);

  useEffect(() => {
    const navigationEntries = performance.getEntriesByType('navigation');
    if (navigationEntries.length > 0) {
      const navigation = navigationEntries[0] as PerformanceNavigationTiming;
      const loadDuration = navigation.loadEventEnd - navigation.startTime;
      setPageLoadTime(loadDuration);
    } else {
      // Fallback untuk browser lama
      const timing = performance.timing;
      const loadDuration = timing.loadEventEnd - timing.navigationStart;
      setPageLoadTime(loadDuration);
    }
  }, []);
  const formRef = useRef<HTMLFormElement | null>(null); // Ref untuk form
  useEffect(() => {
    // Fungsi untuk menangani pergerakan fokus berdasarkan tombol
    const handleKeyDown = (event: KeyboardEvent) => {
      const form = formRef.current;

      if (!form) return;

      const inputs = Array.from(
        form.querySelectorAll('input, select, textarea, button')
      ).filter(
        (element) =>
          element.id !== 'image-dropzone' &&
          element.tagName !== 'BUTTON' &&
          !element.hasAttribute('readonly') // Pengecualian jika input readonly
      ) as HTMLElement[]; // Ambil semua input dalam form kecuali button

      const focusedElement = document.activeElement as HTMLElement;

      // Cek apakah elemen yang difokuskan adalah dropzone
      const isImageDropzone =
        document.querySelector('input#image-dropzone') === focusedElement;
      const isFileInput =
        document.querySelector('input#file-input') === focusedElement;

      if (isImageDropzone || isFileInput) return; // Jangan pindah fokus jika elemen fokus adalah dropzone atau input file

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
  }, []); // Tambahkan openName sebagai dependensi

  return (
    <div
      className="relative flex max-h-screen min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#e9ecef]"
      style={{
        maxHeight: '100vh', // Full screen height
        width: '100%' // Full width
      }}
    >
      <div className="flex w-full items-end justify-center">
        <div className="mb-5 flex flex-col items-center gap-2">
          <Image src={IcTasSmall} alt="icon tas" width={150} height={150} />
          <p className="text-header text-lg font-semibold tracking-wider text-zinc-900">
            PT. TRANSPORINDO AGUNG SEJAHTERA
          </p>
          <p className="text-header text-base font-semibold tracking-wider text-red-500">
            TAS EMKL SYSTEM
          </p>
        </div>
      </div>

      <div className="3xl:w-[25%] mb-5 h-fit w-[95%] lg:h-fit lg:w-[40%] xl:w-[35%] 2xl:w-[27%]">
        <div className="flex h-full w-full flex-col items-center justify-between bg-[#fff] shadow-xl">
          <div
            className="w-full border border-blue-500 px-3 py-1"
            style={{
              background: 'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 100%)'
            }}
          >
            <h2 className="text-base text-gray-600 ">LOGIN</h2>
          </div>

          <div className="flex h-full w-full flex-row items-center justify-between px-4">
            <div className="hidden h-full w-[40%] lg:block">{View}</div>
            <div className="flex h-full w-full flex-col justify-center py-4 lg:w-[60%]">
              <Form {...forms}>
                <form
                  ref={formRef}
                  onSubmit={forms.handleSubmit(onSubmit)}
                  className="flex flex-col gap-2"
                >
                  <div className="flex flex-col gap-2">
                    {/* Username Field */}
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

                    {/* Password Field */}
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

                  <Button
                    type="submit"
                    className="mt-2 w-fit justify-end px-10 text-white"
                  >
                    Login
                  </Button>
                  <p className="mt-2 text-xs text-gray-600">
                    <p
                      onClick={onSubmitResetPassword}
                      className="cursor-pointer text-blue-600 hover:underline"
                    >
                      RESET PASSWORD
                    </p>
                  </p>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
      {pageLoadTime ? (
        <p className="mt-1 text-gray-600">
          Halaman ini dimuat dalam{' '}
          <span className="font-semibold">
            {(pageLoadTime / 1000).toFixed(2)}
          </span>{' '}
          detik
        </p>
      ) : (
        <p className="mt-1 text-gray-600">
          Halaman ini dimuat dalam <span className="font-semibold">0.2</span>{' '}
          detik
        </p>
      )}
      <p className="text-zinc-900">
        Copyright &#169; {new Date().getFullYear()}
      </p>
    </div>
  );
}
