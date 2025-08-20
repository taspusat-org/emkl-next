'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { handleJenisorderan } from './services/reportJenisorderan';

export default function DashboardPage() {
  const router = useRouter();
  const isOpened = useRef(false);

  useEffect(() => {
    if (!isOpened.current) {
      isOpened.current = true;
      handleJenisorderan();
      router.back();
    }
  }, [router]);

  return null;
}
