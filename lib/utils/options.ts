import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

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
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
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
            console.error('API Error Response:', error.response.data);
            throw new Error(
              error.response.data.message || 'Invalid username or password'
            );
          } else {
            console.error('Login Error:', error);
            throw new Error('An error occurred while logging in');
          }
        }
      }
    })
  ],
  pages: {
    signIn: '/hr/auth/signin',
    error: '/hr/auth/error'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.users = user.users;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.cabang_id = user.cabang_id;
        token.accessTokenExpires = user.accessTokenExpires;
      }
      if (
        token.accessTokenExpires &&
        Date.now() > new Date(String(token.accessTokenExpires)).getTime()
      ) {
        // Jika access token sudah kedaluwarsa, refresh token
        return refreshAccessToken(token);
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.userId = token.id as string;
        session.token = token.accessToken as string;
        session.refreshToken = token.refreshToken as string;
        session.accessTokenExpires = token.accessTokenExpires as string;
        session.user = token.users as any;
        session.cabang_id = token.cabang_id as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};

async function refreshAccessToken(token: any) {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL2}/auth/refresh-token`,
      { refreshToken: token.refreshToken }
    );

    const refreshedTokens = response.data;

    const accessTokenExpires = new Date(
      Date.now() + refreshedTokens.accessTokenExpiresIn
    ).toLocaleString();

    return {
      ...token,
      accessToken: refreshedTokens.token,
      accessTokenExpires,
      refreshToken: refreshedTokens.refreshToken ?? token.refreshToken
    };
  } catch (error) {
    console.error('Failed to refresh access token', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError'
    };
  }
}
