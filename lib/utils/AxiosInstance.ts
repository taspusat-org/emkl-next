import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';
import { getSession } from 'next-auth/react'; // Untuk mendapatkan session token terbaru
import { setCookie, deleteCookie } from './cookie-actions'; // Mengimpor setCookie dan deleteCookie
import { RootState, store } from '../store/store';
import {
  setCredentials,
  clearCredentials,
  setIsRefreshing
} from '../store/authSlice/authSlice';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (newToken: string) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

const onRefreshFailed = () => {
  refreshSubscribers = [];
};

const configureAxios = (baseURL: string): AxiosInstance => {
  const apiInstance = axios.create({
    baseURL: baseURL || ''
  });

  // --- Request Interceptor ---
  apiInstance.interceptors.request.use(
    async (
      config: InternalAxiosRequestConfig
    ): Promise<InternalAxiosRequestConfig> => {
      const dispatch = store.dispatch;

      dispatch(
        setCredentials({
          ...store.getState().auth,
          autoLogoutExpires: Date.now(),
          cabang_id: store.getState().auth.cabang_id || null
        })
      );

      const { token } = store.getState().auth;

      if (token) {
        config.headers = config.headers ?? {};
        (config.headers as any).Authorization = `Bearer ${token}`;
      }

      const hasBody = !!config.data;
      const isFormData =
        typeof FormData !== 'undefined' && config.data instanceof FormData;

      if (hasBody && !isFormData) {
        (config.headers as any)['Content-Type'] = 'application/json';
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // --- Helper: Refresh Token (single flight) ---
  const refreshAccessToken = async (): Promise<string> => {
    const state = store.getState().auth;
    const dispatch = store.dispatch;

    if (!state?.refreshToken) {
      throw new Error('No refresh token');
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(resolve);
      });
    }

    try {
      isRefreshing = true; // Set isRefreshing ke true sebelum melakukan request refresh token
      dispatch(setIsRefreshing(true)); // Set status refreshing di Redux sebelum refresh dimulai

      // Lakukan refresh token
      const resp = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL2}/auth/refresh-token`,
        { refreshToken: state.refreshToken }
      );

      const {
        accessToken,
        refreshToken,
        users,
        accessTokenExpires,
        refreshTokenExpires,
        cabang_id
      } = resp.data;

      // Update Redux store dengan token yang baru
      dispatch(
        setCredentials({
          user: users,
          token: accessToken,
          id: users.id,
          refreshToken,
          accessTokenExpires,
          refreshTokenExpires,
          autoLogoutExpires: Date.now(),
          cabang_id
        })
      );

      await setCookie(accessToken); // Set cookies setelah berhasil refresh token
      onRefreshed(accessToken); // Notifikasi jika refresh token berhasil
      return accessToken;
    } catch (err) {
      console.error('Failed to refresh access token:', err);
      onRefreshFailed();
      dispatch(clearCredentials());

      // Jika refresh gagal, arahkan ke halaman login hanya sekali
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/signin';
      }
      throw err;
    } finally {
      isRefreshing = false; // Reset status isRefreshing di akhir proses
      dispatch(setIsRefreshing(false)); // Update Redux state isRefreshing ke false setelah selesai
    }
  };

  // --- Response Interceptor ---
  apiInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      const dispatch = store.dispatch;
      const state = store.getState().auth;
      const { accessTokenExpires } = state || {};

      const expiresAt = accessTokenExpires
        ? new Date(String(accessTokenExpires)).getTime()
        : 0;
      const isExpired = expiresAt > 0 && Date.now() >= expiresAt; // Cek kadaluarsa token

      const status = error?.response?.status;

      const shouldTryRefresh =
        !originalRequest._retry &&
        state?.refreshToken &&
        (isExpired || status === 401);

      if (shouldTryRefresh) {
        originalRequest._retry = true;

        try {
          const newToken = await refreshAccessToken(); // Refresh token jika kadaluarsa

          originalRequest.headers = originalRequest.headers ?? {};
          (originalRequest.headers as any).Authorization = `Bearer ${newToken}`;

          return apiInstance(originalRequest); // Retry request dengan token baru
        } catch (refreshErr) {
          return Promise.reject(refreshErr);
        }
      }

      // Jika refresh token gagal, lakukan logout
      if (
        status === 401 &&
        originalRequest.url?.includes('/auth/refresh-token')
      ) {
        await deleteCookie(); // Hapus cookie jika refresh token gagal
        dispatch(clearCredentials());
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/signin'; // Redirect ke login
        }
      }

      return Promise.reject(error); // Jika tidak ada error yang bisa ditangani
    }
  );

  return apiInstance;
};

const api = configureAxios(process.env.NEXT_PUBLIC_BASE_URL || '');
const api2 = configureAxios(process.env.NEXT_PUBLIC_BASE_URL2 || '');

export { api, api2 };
