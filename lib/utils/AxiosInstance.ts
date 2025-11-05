import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';
import { getSession, signOut } from 'next-auth/react';

interface TokenCache {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number;
}

class SessionTokenCache {
  private static instance: SessionTokenCache;
  private cache: TokenCache = {
    accessToken: null,
    refreshToken: null,
    expiresAt: 0
  };

  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];
  private sessionPromise: Promise<string | null> | null = null;

  private constructor() {
    this.initializeToken();
  }

  static getInstance(): SessionTokenCache {
    if (!SessionTokenCache.instance) {
      SessionTokenCache.instance = new SessionTokenCache();
    }
    return SessionTokenCache.instance;
  }

  /**
   * ✅ Helper: Check if current route is public
   */
  private isPublicRoute(): boolean {
    if (typeof window === 'undefined') return false;

    const publicPaths = [
      '/auth/signin',
      '/auth/signup',
      '/auth/reset-password',
      '/auth/forgot-password',
      '/auth/error'
    ];

    return publicPaths.some((path) =>
      window.location.pathname.startsWith(path)
    );
  }

  private async initializeToken(): Promise<void> {
    try {
      const session = await getSession();

      if (session?.error) {
        console.error('⛔ Session has error, logging out...');
        await this.handleLogout();
        return;
      }

      if (session?.token) {
        this.updateCache({
          accessToken: session.token,
          refreshToken: session.refreshToken || null,
          expiresAt: session.accessTokenExpires
            ? new Date(session.accessTokenExpires).getTime()
            : 0
        });
      }
    } catch (error) {
      console.error('❌ Failed to initialize token:', error);
    }
  }

  async getAccessToken(): Promise<string | null> {
    // 1. Check cache
    if (this.cache.accessToken && this.isTokenValid()) {
      return this.cache.accessToken;
    }

    // 2. Use existing session promise
    if (this.sessionPromise) {
      return this.sessionPromise;
    }

    // 3. Fetch new session
    this.sessionPromise = this.fetchSessionToken();

    try {
      const token = await this.sessionPromise;
      return token;
    } finally {
      this.sessionPromise = null;
    }
  }

  private async fetchSessionToken(): Promise<string | null> {
    try {
      const session = await getSession();

      if (session?.error) {
        console.error('⛔ Session contains error:', session.error);

        // ✅ PERBAIKAN: Jangan logout jika di public route
        if (!this.isPublicRoute()) {
          await this.handleLogout();
        }
        return null;
      }

      if (session?.token) {
        this.updateCache({
          accessToken: session.token,
          refreshToken: session.refreshToken || null,
          expiresAt: session.accessTokenExpires
            ? new Date(session.accessTokenExpires).getTime()
            : 0
        });
        return session.token;
      }

      // ✅ No session
      console.warn('⚠️ No valid session found');

      // ✅ PERBAIKAN: Jangan logout jika di public route
      if (!this.isPublicRoute()) {
        await this.handleLogout();
      }
      return null;
    } catch (error) {
      console.error('❌ Failed to fetch session token:', error);
      return null;
    }
  }

  private isTokenValid(): boolean {
    if (!this.cache.expiresAt) return true;
    const bufferTime = 2 * 60 * 1000;
    return Date.now() < this.cache.expiresAt - bufferTime;
  }

  updateCache(newCache: TokenCache): void {
    this.cache = newCache;
  }

  async handleTokenRefresh(): Promise<string | null> {
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.refreshSubscribers.push((token: string) => {
          resolve(token);
        });
      });
    }

    this.isRefreshing = true;

    try {
      const session = await getSession();

      if (session?.error) {
        console.error('⛔ Session has error during refresh:', session.error);
        throw new Error('Session contains error: ' + session.error);
      }

      if (!session?.token) {
        console.error('⛔ No session or token available');
        throw new Error('No valid session');
      }

      this.updateCache({
        accessToken: session.token,
        refreshToken: session.refreshToken || null,
        expiresAt: session.accessTokenExpires
          ? new Date(session.accessTokenExpires).getTime()
          : 0
      });

      this.refreshSubscribers.forEach((callback) =>
        callback(session.token as string)
      );
      this.refreshSubscribers = [];

      return session.token;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);

      this.refreshSubscribers.forEach((callback) => callback(''));
      this.refreshSubscribers = [];

      // ✅ PERBAIKAN: Jangan logout jika di public route
      if (!this.isPublicRoute()) {
        await this.handleLogout();
      }
      return null;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * ✅ Centralized logout handler
   */
  private async handleLogout(): Promise<void> {
    this.clearCache();

    if (typeof window !== 'undefined') {
      await signOut({
        callbackUrl: '/auth/signin',
        redirect: true
      });
    }
  }

  clearCache(): void {
    this.cache = {
      accessToken: null,
      refreshToken: null,
      expiresAt: 0
    };
    this.sessionPromise = null;
  }

  async forceRefresh(): Promise<void> {
    this.cache.accessToken = null;
    await this.getAccessToken();
  }

  getCacheInfo() {
    const now = Date.now();
    const expiresIn = this.cache.expiresAt ? this.cache.expiresAt - now : 0;

    return {
      hasToken: !!this.cache.accessToken,
      tokenPreview: this.cache.accessToken
        ? `${this.cache.accessToken.substring(0, 20)}...`
        : null,
      expiresAt: this.cache.expiresAt
        ? new Date(this.cache.expiresAt).toISOString()
        : null,
      expiresInSeconds: Math.floor(expiresIn / 1000),
      isValid: this.isTokenValid(),
      isRefreshing: this.isRefreshing
    };
  }
}

const tokenCache = SessionTokenCache.getInstance();

const configureAxios = (baseURL: string): AxiosInstance => {
  const apiInstance = axios.create({
    baseURL: baseURL || '',
    timeout: 30000
  });

  apiInstance.interceptors.request.use(
    async (
      config: InternalAxiosRequestConfig
    ): Promise<InternalAxiosRequestConfig> => {
      // ✅ Skip authentication untuk auth endpoints
      if (
        config.url?.includes('/auth/login') ||
        config.url?.includes('/auth/refresh-token') ||
        config.url?.includes('/auth/reset-password') ||
        config.url?.includes('/auth/forgot-password') ||
        config.url?.includes('/auth/check-token')
      ) {
        return config;
      }

      const token = await tokenCache.getAccessToken();
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('⚠️ No token available for request:', config.url);
      }

      const hasBody = !!config.data;
      const isFormData =
        typeof FormData !== 'undefined' && config.data instanceof FormData;

      if (hasBody && !isFormData) {
        config.headers['Content-Type'] = 'application/json';
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  apiInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
      const originalRequest = error.config;

      if (
        (error.response?.status === 401 || error.response?.status === 403) &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        console.log('🔄 Token expired, refreshing...');
        const newToken = await tokenCache.handleTokenRefresh();

        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiInstance(originalRequest);
        }
      }

      if (!error.response) {
        console.error('🌐 Network Error:', error.message);
      }

      return Promise.reject(error);
    }
  );

  return apiInstance;
};

const api = configureAxios(process.env.NEXT_PUBLIC_BASE_URL || '');
const api2 = configureAxios(process.env.NEXT_PUBLIC_BASE_URL2 || '');

export { api, api2, tokenCache };
