'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { handleHargatrucking } from './services/reportHargatrucking';

export default function DashboardPage() {
  const router = useRouter();
  const isOpened = useRef(false);

  useEffect(() => {
    if (!isOpened.current) {
      isOpened.current = true;
      handleHargatrucking();
      router.back();
    }
  }, [router]);

  return null;
}
