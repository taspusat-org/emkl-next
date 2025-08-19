'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { handleJenismuatan } from './services/reportJenismuatan';

export default function DashboardPage() {
  const router = useRouter();
  const isOpened = useRef(false);

  useEffect(() => {
    if (!isOpened.current) {
      isOpened.current = true;
      handleJenismuatan();
      router.back();
    }
  }, [router]);

  return null;
}
