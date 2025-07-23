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
import { signIn, useSession } from 'next-auth/react';
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
import { setMenu } from '@/lib/store/menuSlice/menuSlice';
import { useGetMenuSidebar } from '@/lib/server/useMenu';
import { useLottie } from 'lottie-react';
import LoginAnimation from '@/public/image/lottie/login.json';
export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};

export default function SignInViewPage() {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const usernameRef = useRef<HTMLInputElement | null>(null);
  const forms = useForm<LoginInput>({
    resolver: zodResolver(loginValidation),
    mode: 'onSubmit',
    defaultValues: {
      username: '',
      password: ''
    }
  });

  const onSubmit = async (values: LoginInput) => {
    setLoading(true);
    const result = await signIn('credentials', {
      redirect: false,
      username: values.username,
      password: values.password
    });
    setLoading(false);
    if (result?.error) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: result.error
      });
    } else {
      toast({
        title: 'Login Success',
        description: 'You have successfully logged in.'
      });
      router.push('/dashboard');
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
          token: session.token ?? null,
          refreshToken: session.refreshToken ?? null,
          cabang_id: session.cabang_id ?? null,
          accessTokenExpires: session?.accessTokenExpires ?? undefined,
          autoLogoutExpires: Date.now()
        })
      );
    }
  }, [session, dispatch]);
  useEffect(() => {
    // Fokus ke input username ketika halaman dimuat
    if (usernameRef.current) {
      usernameRef?.current?.focus();
    }
  }, []);
  return (
    <div
      className="relative flex min-h-screen w-full flex-col items-center justify-center"
      style={{
        height: '100vh', // Penuh layar
        width: '100%', // Lebar penuh
        background: 'url(' + bgImage.src + ')', // Background gambar di bagian atas
        backgroundSize: 'contain'
      }}
    >
      <div className="flex w-full items-end justify-center">
        <div className="mb-5 flex flex-col items-center gap-2">
          <Image src={IcTasSmall} alt="icon tas" width={150} height={150} />
          <p className="font-bold">PT. TRANSPORINDO AGUNG SEJAHTERA</p>
          <p className="font-bold text-red-500">HUMAN RESOURCE</p>
          <Image src={IcHeader} alt="header-icon" width={300} height={50} />
        </div>
      </div>
      <div className="mb-5 h-[40vh] w-[25%] ">
        <div className="flex h-full w-full flex-row items-center justify-between rounded-lg bg-[#e6d7c7] px-4">
          <div className="w-[40%]">{View}</div>
          <div className="flex h-full w-[60%] flex-col justify-center py-4">
            <h2 className="text-center text-lg font-bold text-gray-600 ">
              LOGIN
            </h2>
            <Form {...forms}>
              <form
                onSubmit={forms.handleSubmit(onSubmit)}
                className="flex flex-col gap-2"
              >
                <div className="flex flex-col gap-6">
                  <FormField
                    name="username"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-gray-600">
                          Username
                        </FormLabel>
                        <FormControl>
                          <div className="flex flex-1 flex-row rounded-md border border-zinc-300 bg-white px-2">
                            <Input
                              {...field}
                              ref={usernameRef}
                              value={field.value ?? ''}
                              autoFocus
                              type="text"
                              className="w-full border-none p-0 text-sm placeholder:text-xs focus:border-0 focus:outline-none focus:ring-0 focus-visible:ring-0"
                            />
                            <div className="flex items-center justify-center text-gray-600 ">
                              <FaUser />
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="password"
                    control={forms.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-gray-600 ">
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="flex flex-1 flex-row rounded-md border border-zinc-300 bg-white px-2">
                            <input
                              {...field}
                              value={field.value ?? ''}
                              type={showPassword ? 'text' : 'password'}
                              className="h-9 w-full border-none p-0 text-sm focus:border-0 focus:outline-none focus:ring-0 focus-visible:ring-0"
                            />
                            <div
                              onClick={() => setShowPassword(!showPassword)}
                              className="ttext-gray-600 flex cursor-pointer items-center justify-center text-gray-600"
                            >
                              {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="mt-2 w-fit justify-end bg-[#7f4f24] px-10 text-white hover:bg-[#582f0e]"
                  loading={loading}
                >
                  Login
                </Button>
                <p className="mt-2 text-sm text-gray-600">
                  <Link
                    prefetch={true}
                    href="/auth/email-verification"
                    className="text-gray-600 hover:underline"
                  >
                    RESET PASSWORD
                  </Link>
                </p>
              </form>
            </Form>
          </div>
        </div>
      </div>
      <Image
        src={IcHeader}
        alt="header-icon"
        width={300}
        height={50}
        className="z-[9999] rotate-180"
      />
      <p>Copyright &#169; {new Date().getFullYear()}</p>
      <div
        className="absolute flex w-full flex-col items-center"
        style={{
          bottom: 0, // Tempatkan di bagian bawah container
          left: 0,
          height: '45vh', // Setengah layar; bisa juga memakai '50%' jika diinginkan
          background:
            'repeating-linear-gradient(to right, #fff, #fff 50%, #f0f0f0 50%, #f0f0f0 100%)', // Gradient garis belang
          backgroundSize: '4% 100%' // Ukuran pola garis
        }}
      ></div>
    </div>
  );
}
