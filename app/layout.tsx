// app/layout.tsx
'use client';

import Providers from '@/components/layout/providers';
import { Lato } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { PersistGate } from 'redux-persist/integration/react';
import { SessionProvider } from 'next-auth/react';
import { persistor, RootState, store } from '@/lib/store/store';
import Alert, { AlertOptions } from '@/components/custom-ui/AlertCustom';
import { useDispatch } from 'react-redux';
import { useAlert } from '@/lib/store/client/useAlert';
import IdleTimerProvider from '@/components/IdleTimerProvider';
import { Roboto } from 'next/font/google';
import { useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { setLoaded, setLoading } from '../lib/store/loadingSlice/loadingSlice';
import { useRouter } from 'next/navigation';
import { pdfjs } from 'react-pdf';
import ForceEditDialogHost from '@/components/custom-ui/ForceEditDialogHost';
import { FormErrorProvider } from '@/lib/hooks/formErrorContext';
import ApprovalDialog from '@/components/custom-ui/ApprovalDialog';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700'], // Pilih berat font sesuai kebutuhan
  variable: '--font-roboto'
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5 // 5 menit
    },
    mutations: {
      retry: 1
    }
  }
});

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { alertOptions, handleClose, handleSubmit } = useAlert();
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
  return (
    <html lang="en" className={`${roboto.className}`} suppressHydrationWarning>
      <body className="overflow-hidden">
        <SidebarProvider>
          <Provider store={store}>
            <QueryClientProvider client={queryClient}>
              <Alert
                open={Boolean(alertOptions)}
                onSubmit={handleSubmit}
                onClose={handleClose}
                {...(alertOptions as AlertOptions)}
              />
              {/* <ForceEditDialogHost /> */}
              <ApprovalDialog />
              <FormErrorProvider>
                <PersistGate loading={null} persistor={persistor}>
                  <NextTopLoader showSpinner={false} />
                  <Providers>
                    <Toaster />
                    <IdleTimerProvider>{children}</IdleTimerProvider>
                  </Providers>
                </PersistGate>
              </FormErrorProvider>
            </QueryClientProvider>
          </Provider>
        </SidebarProvider>
      </body>
    </html>
  );
}
