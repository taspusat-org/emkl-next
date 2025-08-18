'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { handleAlatbayar } from './services/reportAlatbayar';

export default function DashboardPage() {
  const router = useRouter();
  const isOpened = useRef(false);

  useEffect(() => {
    if (!isOpened.current) {
      isOpened.current = true;
      handleAlatbayar();
      router.back();
    }
  }, [router]);

  return null;
}
