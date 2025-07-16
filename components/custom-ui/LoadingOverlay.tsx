'use client';
import SandTimer from '@/public/image/lottie/clock-time.json';

import dynamic from 'next/dynamic';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export const LoadingOverlay = ({
  isLoading,
  isProcessing
}: {
  isLoading: boolean;
  isProcessing: boolean;
}) => {
  if (!isLoading && !isProcessing) return null; // Don't render the overlay if neither is loading nor processing

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-15">
      <div className="flex items-center border border-blue-500 bg-white p-2">
        {isProcessing ? (
          <Lottie
            animationData={SandTimer}
            loop={true}
            className="lg:w-18 m-0 w-16 object-contain p-0"
          />
        ) : (
          <div className="mr-2 h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent"></div>
        )}

        <div className="flex items-center space-x-1">
          <span className="text-base font-semibold text-zinc-700">
            {isProcessing ? 'Processing' : 'Loading'}
          </span>
          <span className="animate-pulse text-base font-bold text-zinc-900">
            .
          </span>
          <span className="animation-delay-200 animate-pulse text-base font-bold text-zinc-900">
            .
          </span>
          <span className="animation-delay-400 animate-pulse text-base font-bold text-zinc-900">
            .
          </span>
        </div>
      </div>
    </div>
  );
};
