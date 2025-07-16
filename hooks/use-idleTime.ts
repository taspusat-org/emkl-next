import { clearCredentials } from '@/lib/store/authSlice/authSlice';
import { RootState } from '@/lib/store/store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const IDLE_TIMEOUT = 30 * 60 * 1000; // 5 menit dalam milidetik

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
        router.push('/auth/signin');
      }
    }, 1000); // Cek setiap detik

    return () => {
      clearInterval(checkIdle);
    };
  }, [autoLogoutExpires, dispatch]);
};
