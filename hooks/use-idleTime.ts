'use client';

import { clearCredentials } from '@/lib/store/authSlice/authSlice';
import { RootState } from '@/lib/store/store';
import { deleteCookie } from '@/lib/utils/cookie-actions';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const IDLE_TIMEOUT = 60 * 60 * 1000; // 10 menit

// Normalisasi ke epoch ms (number) secara aman di semua browser
function toEpochMs(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (v instanceof Date) return v.getTime();
  if (typeof v === 'string') {
    // jika string angka murni -> Number, kalau bukan -> Date.parse
    const trimmed = v.trim();
    if (/^\d+$/.test(trimmed)) return Number(trimmed);
    const parsed = Date.parse(trimmed);
    return Number.isFinite(parsed) ? parsed : NaN;
  }
  return NaN;
}

export const useIdleTimer = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { autoLogoutExpires, accessTokenExpires, isRefreshing } = useSelector(
    (state: RootState) => state.auth
  );

  // simpan id interval agar aman di cleanup
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // pastikan ada timestamp activity dan ada expiry token
    const expMs = toEpochMs(accessTokenExpires);
    if (autoLogoutExpires == null || !Number.isFinite(expMs)) {
      // Debugging: lihat nilai mentahnya jika masih NaN
      // console.log('Raw accessTokenExpires:', accessTokenExpires);
      return;
    }

    // Bersihkan interval sebelumnya
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const now = Date.now();

      // 1) Token sudah kadaluarsa -> logout (kecuali sedang refresh)
      if (now >= expMs) {
        console.log('masuk');
        // console.log('Token expired -> auto logout');
        dispatch(clearCredentials());
        deleteCookie(); // hapus cookie custom milikmu; NextAuth cookie httpOnly dikelola server
        router.push('/auth/signin');
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }

      // 2) Token masih valid tapi user idle terlalu lama -> logout
      if (now - autoLogoutExpires > IDLE_TIMEOUT) {
        // console.log('Idle timeout -> auto logout');
        dispatch(clearCredentials());
        deleteCookie();
        router.push('/auth/signin');
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoLogoutExpires, accessTokenExpires, isRefreshing, dispatch, router]);
};
