// middleware.ts
import { NextResponse, NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';

// ✅ Custom JWT type dengan semua field yang dibutuhkan
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
  error?: string; // ✅ PENTING: Field error untuk detect refresh failure
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

  // ✅ 2. Public routes (signin, signup, dll)
  const publicRoutes = ['/auth/signin', '/auth/signup', '/auth/error'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Get session token
  const session = (await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET
  })) as CustomJWT | null;

  // ✅ 3. CHECK ERROR FIELD - Ini yang paling penting!
  if (session?.error) {
    console.log('⛔ Middleware: Session has error, forcing logout');

    const response = NextResponse.redirect(new URL('/auth/signin', req.url));

    // Clear semua cookies
    response.cookies.delete('next-auth.session-token');
    response.cookies.delete('__Secure-next-auth.session-token'); // untuk production HTTPS

    return response;
  }

  // ✅ 4. Handle public routes dengan valid session
  if (isPublicRoute) {
    if (session?.accessToken) {
      // User sudah login, redirect ke dashboard
      const expiresAt = session.accessTokenExpires
        ? new Date(session.accessTokenExpires).getTime()
        : 0;

      // Check apakah token masih valid
      if (Date.now() < expiresAt) {
        console.log('✅ User already authenticated, redirecting to dashboard');
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // Belum login atau token expired, allow access to public route
    return NextResponse.next();
  }

  // ✅ 5. Protected routes - require valid session
  if (!session || !session.accessToken) {
    console.log('⚠️ No session found, redirecting to signin');

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
  const bufferTime = 2 * 60 * 1000; // 2 menit buffer

  // ✅ 7. Refresh token sudah expired
  if (refreshTokenExpires && now >= refreshTokenExpires) {
    console.log('⛔ Refresh token expired, forcing logout');

    const response = NextResponse.redirect(new URL('/auth/signin', req.url));
    response.cookies.delete('next-auth.session-token');
    response.cookies.delete('__Secure-next-auth.session-token');

    return response;
  }

  // ✅ 8. Access token expired tapi refresh token masih valid
  // Biarkan NextAuth & axios interceptor handle refresh
  // Middleware TIDAK perlu refresh token (next-auth sudah handle di jwt callback)
  if (now >= accessTokenExpires - bufferTime) {
    console.log(
      '⚠️ Access token expired/expiring, will be refreshed by NextAuth'
    );
    // Just continue, NextAuth jwt callback akan auto-refresh
  }

  // ✅ 9. Add custom headers (optional, untuk debugging)
  const response = NextResponse.next();

  response.headers.set('x-user-id', session.users?.id || '');
  response.headers.set('x-cabang-id', session.cabang_id || '');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - api routes (handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, etc
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf)$).*)'
  ]
};
