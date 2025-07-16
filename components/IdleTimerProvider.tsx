// src/components/layout/IdleTimerProvider.tsx
'use client';

import { useIdleTimer } from '@/hooks/use-idleTime';

export default function IdleTimerProvider({
  children
}: {
  children: React.ReactNode;
}) {
  useIdleTimer(); // Jalankan hook untuk memantau waktu idle
  return <>{children}</>;
}
