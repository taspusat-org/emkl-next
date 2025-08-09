import { clearCredentials } from '@/lib/store/authSlice/authSlice';
import { RootState } from '@/lib/store/store';
import { deleteCookie } from '@/lib/utils/cookie-actions';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const IDLE_TIMEOUT = 60 * 60 * 1000; // 1 jam

export const useIdleTimer = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const autoLogoutExpires = useSelector(
    (state: RootState) => state.auth.autoLogoutExpires
  );

  useEffect(() => {
    // Pastikan autoLogoutExpires bukan null atau undefined
    if (autoLogoutExpires == null) return;

    const checkIdle = setInterval(() => {
      if (Date.now() - autoLogoutExpires > IDLE_TIMEOUT) {
        dispatch(clearCredentials()); // Auto logout jika sudah idle lebih dari 5 menit
        clearInterval(checkIdle);
        deleteCookie(); // Hapus cookie
        router.refresh();
      }
    }, 1000); // Cek setiap detik

    return () => {
      clearInterval(checkIdle);
    };
  }, [autoLogoutExpires, dispatch]);
};
