'use client';
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
import Link from 'next/link';
import { EmailInput, emailValidation } from '@/lib/validations/auth.validation';
import { Button } from '@/components/ui/button';
import { storeEmailVerificationFn } from '@/lib/apis/auth.api';
import bgImage from '@/public/image/bg-top.png';
import { useState } from 'react';
import { useAlert } from '@/lib/store/client/useAlert';
export default function Page() {
  const { alert } = useAlert();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const forms = useForm<EmailInput>({
    resolver: zodResolver(emailValidation),
    mode: 'onSubmit',
    defaultValues: {
      username: ''
    }
  });
  const onSubmit = async (value: EmailInput) => {
    setLoading(true);
    setError(null);

    try {
      const res = await storeEmailVerificationFn(value);
      if (res.status === 200 || res.status === 201) {
        alert({
          title:
            'Link Ubah Password Terkirim ke Email Anda, Silahkan cek Email Anda',
          variant: 'success',
          submitText: 'OK'
        });
      } else {
        const errorMessage =
          res.data?.message || 'Terjadi kesalahan, silakan coba lagi.';
        alert({
          title: 'Error',
          variant: 'danger',
          submitText: 'OK'
        });
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        'Terjadi kesalahan saat mereset password. Mohon coba lagi.';

      setError(errorMessage);

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
      className="flex min-h-screen w-full flex-col items-center justify-center"
      style={{
        backgroundImage: `url(${bgImage.src})`,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backgroundBlendMode: 'darken'
      }}
    >
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white">
          Password Reset
        </h2>
        <Form {...forms}>
          <form
            onSubmit={forms.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-4">
              <FormField
                name="username"
                control={forms.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-gray-700 dark:text-gray-200">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        type="text"
                        placeholder="Masukkan Email Anda"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="mt-6 w-full" loading={loading}>
              Login
            </Button>

            <div className="mt-4 text-center">
              <p className="mt-4 text-center text-sm text-gray-600">
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
