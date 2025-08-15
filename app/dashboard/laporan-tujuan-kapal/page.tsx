'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { handleTujuankapalBank } from './services/reportTujuankapal';

export default function DashboardPage() {
  const router = useRouter();
  const isOpened = useRef(false);

  useEffect(() => {
    if (!isOpened.current) {
      isOpened.current = true;
      handleTujuankapalBank();
      router.back();
    }
  }, [router]);

  return null;
}
