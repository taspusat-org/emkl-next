// middleware.ts
import { NextResponse, NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { api2 } from './lib/utils/AxiosInstance';
import {
  clearCredentials,
  setCredentials
} from './lib/store/authSlice/authSlice';
import { store } from './lib/store/store';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Lewati asset statis
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.match(/\.[^\/]+$/)
  ) {
    return NextResponse.next();
  }

  // 1) Halaman signin → selalu next() (atau redirect ke dashboard jika session masih valid)
  if (pathname === '/auth/signin') {
    const session = (await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET
    })) as JWT & { accessTokenExpires?: string };

    if (
      session?.accessTokenExpires &&
      Date.now() < new Date(session.accessTokenExpires).getTime()
    ) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // 2) Selain signin → harus ada cookie session-token
  const cookieToken = req.cookies.get('next-auth.session-token')?.value;
  if (!cookieToken) {
    const resp = NextResponse.redirect(new URL('/auth/signin', req.url));
    resp.cookies.delete('next-auth.session-token');
    return resp;
  }

  // 3) Decode session dan cek expiry
  const session = (await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET
  })) as JWT & {
    accessTokenExpires?: string;
    refreshToken?: string;
    users?: { id: string };
  };

  const expiresAt = session?.accessTokenExpires
    ? new Date(session.accessTokenExpires).getTime()
    : 0;
  console.log('session', session);

  // 4) Kalau sudah expired → opsi A: langsung redirect ke signin
  // (mencegah forced refresh loop kalau refreshToken juga invalid)
  if (Date.now() >= expiresAt) {
    // Kalau Anda **tidak** ingin auto-refresh sama sekali, langsung pakai blok ini:
    store.dispatch(clearCredentials());
    const resp = NextResponse.redirect(new URL('/auth/signin', req.url));
    resp.cookies.delete('next-auth.session-token');
    return resp;

    /* ———— Kalau mau AUTO-REFRESH, ganti blok di atas menjadi blok di bawah ini ————
    if (!session.refreshToken) {
      // gak punya refreshToken, langsung masuk signin
      store.dispatch(clearCredentials());
      const resp = NextResponse.redirect(new URL('/auth/signin', req.url));
      resp.cookies.delete('next-auth.session-token');
      return resp;
    }
    try {
      const { data } = await api2.post('/auth/refresh-token', {
        refreshToken: session.refreshToken
      });
      // sukses refresh:
      store.dispatch(setCredentials({
        user: data.users,
        token: data.accessToken,
        id: data.users.id,
        refreshToken: data.refreshToken,
        accessTokenExpires: data.accessTokenExpires,
        autoLogoutExpires: Date.now(),
        cabang_id: data.cabang_id
      }));
      const ok = NextResponse.next();
      ok.cookies.set('next-auth.session-token', data.accessToken, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax'
      });
      return ok;
    } catch (e) {
      console.error('Refresh gagal:', e);
      store.dispatch(clearCredentials());
      const resp = NextResponse.redirect(new URL('/auth/signin', req.url));
      resp.cookies.delete('next-auth.session-token');
      return resp;
    }
    */
  }

  // 5) Token masih valid → teruskan
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/signin']
};
