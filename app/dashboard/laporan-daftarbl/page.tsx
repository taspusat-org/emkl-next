'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { handleDaftarbl } from './services/reportDaftarbl';

export default function DashboardPage() {
  const router = useRouter();
  const isOpened = useRef(false);

  useEffect(() => {
    if (!isOpened.current) {
      isOpened.current = true;
      handleDaftarbl();
      router.back();
    }
  }, [router]);

  return null;
}
