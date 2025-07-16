'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Expired from '@/public/image/expired.png';

export default function ExpiredPage() {
  return (
    <div className="flex max-h-screen min-h-screen w-full items-center justify-center bg-gray-100 p-4 sm:p-6">
      <Card className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-w-md lg:w-[30%]">
        <CardContent className="h-fit p-6 text-center sm:p-8">
          <div className="mb-4 flex justify-center sm:mb-6">
            <div className="h-20 w-20 sm:h-24 sm:w-24">
              <Image
                src={Expired}
                alt="Link Expired"
                width={96}
                height={96}
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="mb-2 text-xl font-extrabold text-gray-800 sm:text-2xl">
            Oops! Link Anda Telah Kedaluwarsa
          </h1>
          <p className="mb-6 text-sm text-gray-600 sm:text-base">
            Mohon maaf, tautan reset password yang Anda gunakan sudah tidak
            valid atau telah kadaluwarsa. Silakan minta ulang untuk mendapatkan
            link baru.
          </p>
          <div className="flex flex-col gap-3">
            <Button variant="outline" className="w-full py-2" asChild>
              <Link href="/auth/signin" className="text-blue-600">
                Kembali ke Halaman Login
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
