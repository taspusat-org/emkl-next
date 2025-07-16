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
      <SessionProvider>{children}</SessionProvider>
    </ThemeProvider>
  );
}
