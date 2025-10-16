'use client';
import React from 'react';
import ThemeProvider from './ThemeToggle/theme-provider';
import { SessionProvider } from 'next-auth/react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { LoadingOverlay } from '../custom-ui/LoadingOverlay';

export default function Providers({ children }: { children: React.ReactNode }) {
  const { isLoading, isProcessing } = useSelector(
    (state: RootState) => state.loading
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <LoadingOverlay
        isLoading={isLoading || false}
        isProcessing={isProcessing || false}
      />
      {/* ✅ PERBAIKAN: Disable auto refetch untuk menghindari session call berulang */}
      <SessionProvider
        refetchInterval={0} // Tidak auto-refetch berdasarkan interval
        refetchOnWindowFocus={true} // ✅ KUNCI: Disable refetch saat window focus
        // refetchWhenOffline={true} // Disable refetch saat offline
      >
        {children}
      </SessionProvider>
    </ThemeProvider>
  );
}
