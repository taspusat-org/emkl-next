import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';
import { RootState, store } from '../store/store';
import { setCredentials, clearCredentials } from '../store/authSlice/authSlice';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (newToken: string) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

const configureAxios = (baseURL: string): AxiosInstance => {
  const apiInstance = axios.create({
    baseURL: baseURL || ''
  });

  apiInstance.interceptors.request.use(
    async (
      config: InternalAxiosRequestConfig
    ): Promise<InternalAxiosRequestConfig> => {
      const dispatch = store.dispatch;

      // Perbarui autoLogoutExpires menjadi 1 menit dari sekarang
      const newAutoLogoutExpires = Date.now();
      dispatch(
        setCredentials({
          ...store.getState().auth,
          autoLogoutExpires: Date.now(),
          cabang_id: store.getState().auth.cabang_id || null
        })
      );

      const { token } = store.getState().auth;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (config.data instanceof FormData) {
        config.headers['Content-Type'] = 'multipart/form-data';
      } else {
        config.headers['Content-Type'] = 'application/json';
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  apiInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };
      const { refreshToken, user, id } = store.getState().auth;

      const dispatch = store.dispatch;
      if (
        error.response?.status === 403 &&
        refreshToken &&
        !originalRequest._retry
      ) {
        if (!isRefreshing) {
          isRefreshing = true;

          try {
            const response = await axios.post(
              `${process.env.NEXT_PUBLIC_BASE_URL2}/auth/refresh-token`,
              {
                refreshToken: refreshToken
              }
            );

            dispatch(
              setCredentials({
                user: response.data.users,
                token: response.data.accessToken,
                id: response.data.users.id,
                refreshToken: response.data.refreshToken,
                accessTokenExpires: response.data.accessTokenExpires,
                autoLogoutExpires: Date.now(),
                cabang_id: response.data.cabang_id
              })
            );

            isRefreshing = false;
            onRefreshed(response.data.accessToken);
          } catch (refreshError) {
            console.error('Failed to refresh access token:', refreshError);
            dispatch(clearCredentials());
            window.location.href = '/auth/signin';
            isRefreshing = false;
            return Promise.reject(refreshError);
          }
        }

        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken: string) => {
            originalRequest._retry = true;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(apiInstance(originalRequest));
          });
        });
      }

      return Promise.reject(error);
    }
  );

  return apiInstance;
};

const api = configureAxios(process.env.NEXT_PUBLIC_BASE_URL || '');
const api2 = configureAxios(process.env.NEXT_PUBLIC_BASE_URL2 || '');

export { api, api2 };
