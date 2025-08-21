'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { handleDaftarbank } from './services/reportDaftarbank';

export default function DashboardPage() {
  const router = useRouter();
  const isOpened = useRef(false);

  useEffect(() => {
    if (!isOpened.current) {
      isOpened.current = true;
      handleDaftarbank();
      router.back();
    }
  }, [router]);

  return null;
}
