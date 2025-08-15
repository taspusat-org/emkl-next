'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { handleContainerBank } from './services/reportContainer';

export default function DashboardPage() {
  const router = useRouter();
  const isOpened = useRef(false);

  useEffect(() => {
    if (!isOpened.current) {
      isOpened.current = true;
      handleContainerBank();
      router.back();
    }
  }, [router]);

  return null;
}
