import 'next-auth';

declare module 'next-auth' {
  interface User {
    accessToken?: string;
    refreshToken?: string;
    username?: string;
    twoFASecret?: string;
    accessTokenExpires?: string | number;
    refreshTokenExpires?: string | number;
    cabang_id?: string;
    expiresAt?: number;
    users: {};
  }

  interface Session {
    id?: string;
    token?: string;
    userId?: string;
    accessToken?: string;
    refreshToken?: string; // Tambahkan refreshToken di sini
    error?: string;
    twoFASecret?: string;
    accessTokenExpires?: string;
    refreshTokenExpires?: string;
    cabang_id?: string;
    user: {
      id?: string;
      username?: string;
    };
  }
}

interface Token {
  accessToken: string;
  refreshToken: string;
  accessTokenExpires?: string;
  twoFASecret?: string;
  username?: string;
}
