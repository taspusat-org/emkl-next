import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';
import { JWT } from 'next-auth/jwt';
import { tokenCache } from './AxiosInstance';

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL2}/auth/refresh-token`,
      { refreshToken: token.refreshToken },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const refreshedTokens = response.data;

    const newToken = {
      ...token,
      accessToken: refreshedTokens.accessToken,
      refreshToken: refreshedTokens.refreshToken ?? token.refreshToken,
      accessTokenExpires: refreshedTokens.accessTokenExpires,
      users: refreshedTokens.users ?? token.users,
      cabang_id: refreshedTokens.cabang_id ?? token.cabang_id,
      error: undefined
    };

    // ✅ Update cache setelah refresh berhasil
    if (typeof window !== 'undefined') {
      tokenCache.updateCache({
        accessToken: refreshedTokens.accessToken,
        refreshToken: refreshedTokens.refreshToken ?? token.refreshToken,
        expiresAt: refreshedTokens.accessTokenExpires
          ? new Date(refreshedTokens.accessTokenExpires).getTime()
          : 0
      });
    }

    return newToken;
  } catch (error) {
    console.error('❌ Error refreshing access token:', error);

    return {
      ...token,
      error: 'RefreshAccessTokenError'
    };
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (
          !credentials ||
          typeof credentials.username !== 'string' ||
          typeof credentials.password !== 'string'
        ) {
          throw new Error('No credentials provided');
        }

        try {
          const formData = new URLSearchParams();
          formData.append('username', credentials.username);
          formData.append('password', credentials.password);

          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL2}/auth/login`,
            formData,
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            }
          );

          if (response.data) {
            return {
              id: response.data.users.id,
              users: response.data.users,
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken,
              cabang_id: response.data.cabang_id,
              accessTokenExpires: response.data.accessTokenExpires
            };
          } else {
            throw new Error('Invalid username or password');
          }
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            console.error('❌ API Error Response:', error.response.data);
            throw new Error(
              error.response.data.message || 'Invalid username or password'
            );
          } else {
            console.error('❌ Login Error:', error);
            throw new Error('An error occurred while logging in');
          }
        }
      }
    })
  ],

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },

  callbacks: {
    async jwt({ token, user, trigger }) {
      // ✅ 1. Initial sign in
      if (user) {
        const newToken = {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
          users: user.users,
          cabang_id: user.cabang_id,
          error: undefined
        };

        if (typeof window !== 'undefined') {
          tokenCache.updateCache({
            accessToken: user.accessToken as string,
            refreshToken: user.refreshToken as string,
            expiresAt: user.accessTokenExpires
              ? new Date(user.accessTokenExpires).getTime()
              : 0
          });
        }

        return newToken;
      }

      // ✅ 2. PERBAIKAN: Jika ada error, return null untuk trigger logout
      if (token.error) {
        console.error('⛔ Token has error, returning null to force logout');
        return null as any; // This will trigger session to be null
      }

      // ✅ 3. Check token expiry
      const expiresAt = token.accessTokenExpires
        ? new Date(token.accessTokenExpires as string).getTime()
        : 0;

      const bufferTime = 2 * 60 * 1000;
      const shouldRefresh = Date.now() > expiresAt - bufferTime;

      // ✅ 4. Token masih valid, update cache
      if (!shouldRefresh) {
        if (typeof window !== 'undefined') {
          tokenCache.updateCache({
            accessToken: token.accessToken as string,
            refreshToken: token.refreshToken as string,
            expiresAt: token.accessTokenExpires
              ? new Date(token.accessTokenExpires as string).getTime()
              : 0
          });
        }
        return token;
      }

      // ✅ 5. Refresh token
      const refreshedToken = await refreshAccessToken(token);

      // ✅ PENTING: Check jika refresh gagal
      if (refreshedToken.error) {
        console.error('⛔ Refresh failed, returning null to force logout');
        return null as any;
      }

      return refreshedToken;
    },

    async session({ session, token }) {
      // ✅ PERBAIKAN: Jika token null atau ada error, return session null
      if (!token || token.error) {
        console.error('⛔ Invalid token in session callback');
        return null as any; // This will make session null
      }

      if (token) {
        session.userId = token.id as string;
        session.token = token.accessToken as string;
        session.refreshToken = token.refreshToken as string;
        session.accessTokenExpires = token.accessTokenExpires as string;
        session.user = token.users as any;
        session.cabang_id = token.cabang_id as string;
        session.error = token.error as string | undefined;
      }

      return session;
    }
  },

  session: {
    strategy: 'jwt'
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === 'development',

  // ✅ TAMBAHAN: Event handler untuk logout otomatis
  events: {
    async signOut() {
      if (typeof window !== 'undefined') {
        tokenCache.clearCache();
      }
    }
  }
};
