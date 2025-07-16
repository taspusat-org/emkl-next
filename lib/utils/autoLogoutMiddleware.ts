// src/store/middleware/autoLogoutMiddleware.ts
import { Middleware } from '@reduxjs/toolkit';
import { clearCredentials } from '../store/authSlice/authSlice';

const autoLogoutMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();

  // Logika untuk memeriksa apakah sudah lebih dari 1 menit sejak aktivitas terakhir
  const now = Date.now();
  const autoLogoutExpires = state.auth.autoLogoutExpires;

  if (autoLogoutExpires && Number(now) > Number(autoLogoutExpires)) {
    // Jika sudah lewat, lakukan auto logout
    store.dispatch(clearCredentials());
  }

  return result;
};

export default autoLogoutMiddleware;
