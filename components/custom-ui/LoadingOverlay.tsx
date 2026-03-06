'use client';
import SandTimer from '@/public/image/lottie/clock-time.json';
import SandTimerDark from '@/public/image/lottie/Hourglass-Loading.json';
import Lottie from 'lottie-react';
import { useTheme } from 'next-themes';

export const LoadingOverlay = ({
  isLoading,
  isProcessing
}: {
  isLoading: boolean;
  isProcessing: boolean;
}) => {
  const { theme, resolvedTheme } = useTheme();
  const isDark = theme === 'dark' || resolvedTheme === 'dark';
  if (!isLoading && !isProcessing) return null; // Don't render the overlay if neither is loading nor processing

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-15">
      <div className="flex items-center border border-border bg-background p-2">
        {isProcessing ? (
          <Lottie
            animationData={isDark ? SandTimerDark : SandTimer}
            loop={true}
            className="lg:w-18 m-0 w-16 bg-transparent object-contain p-0"
            autoplay={true}
            rendererSettings={{
              preserveAspectRatio: 'xMidYMid slice'
            }}
          />
        ) : (
          <div className="mr-2 h-6 w-6 animate-spin rounded-full border-4 border-solid border-border border-t-transparent"></div>
        )}

        <div className="flex items-center space-x-1">
          <span className="text-primary-text text-base font-semibold">
            {isProcessing ? 'Processing' : 'Loading'}
          </span>
          <span className="text-primary-text animate-pulse text-base font-bold">
            .
          </span>
          <span className="animation-delay-200 text-primary-text animate-pulse text-base font-bold">
            .
          </span>
          <span className="animation-delay-400 text-primary-text animate-pulse text-base font-bold">
            .
          </span>
        </div>
      </div>
    </div>
  );
};
