// pages/maintenance.tsx

import React from 'react';
import UnderMaintenance from '@/public/image/under-maintenance.png';
import Image from 'next/image';

const Maintenance = () => {
  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-gray-100">
      <div className="flex w-full max-w-lg flex-col items-center rounded-lg bg-white p-6 text-center shadow-lg">
        <Image
          src={UnderMaintenance}
          width={250}
          height={250}
          alt="undermaintenance"
        />
        <h1 className="mb-4 text-xl font-bold text-gray-600">
          Situs Sedang Dalam Pemeliharaan
        </h1>
        <p className="mb-6 text-lg text-gray-600">
          Mohon maaf, kami sedang melakukan pembaruan. Silakan coba lagi nanti.
        </p>
        <div className="mt-6 flex justify-center">
          <svg
            className="h-10 w-10 animate-spin text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path d="M4 12a8 8 0 0 1 8-8v8H4z" fill="currentColor" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
