'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { handleReportBank } from './services/reportBank';

export default function DashboardPage() {
  const router = useRouter();
  const isOpened = useRef(false);

  useEffect(() => {
    if (!isOpened.current) {
      isOpened.current = true;
      handleReportBank();
      router.back();
    }
  }, [router]);

  return null;
}
