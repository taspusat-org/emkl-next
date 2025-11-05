// middleware.ts
import { NextResponse, NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';

interface CustomJWT extends JWT {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: string;
  refreshTokenExpires?: string;
  users?: {
    id: string;
    username: string;
    name: string;
    email: string;
  };
  cabang_id?: string;
  error?: string;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ 1. Skip static assets & API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/static/') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next();
  }

  // ✅ 2. Public routes - TAMBAHKAN reset-password routes
  const publicRoutes = [
    '/auth/signin',
    '/auth/signup',
    '/auth/error',
    '/auth/reset-password',
    '/auth/reset-password/expired',
    '/auth/forgot-password'
  ];

  // Check jika path dimulai dengan public route (untuk handle query params)
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Get session token
  const session = (await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET
  })) as CustomJWT | null;

  // ✅ 3. CHECK ERROR FIELD
  if (session?.error && !isPublicRoute) {
    const response = NextResponse.redirect(new URL('/auth/signin', req.url));
    response.cookies.delete('next-auth.session-token');
    response.cookies.delete('__Secure-next-auth.session-token');
    return response;
  }

  // ✅ 4. Handle public routes dengan valid session
  if (isPublicRoute) {
    // Jika user sudah login dan mencoba akses signin/signup, redirect ke dashboard
    if (
      (pathname === '/auth/signin' || pathname === '/auth/signup') &&
      session?.accessToken
    ) {
      const expiresAt = session.accessTokenExpires
        ? new Date(session.accessTokenExpires).getTime()
        : 0;

      if (Date.now() < expiresAt) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // Allow access to all public routes
    return NextResponse.next();
  }

  // ✅ 5. Protected routes - require valid session
  if (!session || !session.accessToken) {
    const signInUrl = new URL('/auth/signin', req.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // ✅ 6. Check token expiration
  const accessTokenExpires = session.accessTokenExpires
    ? new Date(session.accessTokenExpires).getTime()
    : 0;

  const refreshTokenExpires = session.refreshTokenExpires
    ? new Date(session.refreshTokenExpires).getTime()
    : 0;

  const now = Date.now();
  const bufferTime = 2 * 60 * 1000;

  // ✅ 7. Refresh token sudah expired
  if (refreshTokenExpires && now >= refreshTokenExpires) {
    const response = NextResponse.redirect(new URL('/auth/signin', req.url));
    response.cookies.delete('next-auth.session-token');
    response.cookies.delete('__Secure-next-auth.session-token');
    return response;
  }

  // ✅ 8. Access token expired tapi refresh token masih valid
  if (now >= accessTokenExpires - bufferTime) {
    console.log(
      '⚠️ Access token expired/expiring, will be refreshed by NextAuth'
    );
  }

  // ✅ 9. Add custom headers
  const response = NextResponse.next();
  response.headers.set('x-user-id', session.users?.id || '');
  response.headers.set('x-cabang-id', session.cabang_id || '');

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf)$).*)'
  ]
};
