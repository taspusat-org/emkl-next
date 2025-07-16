import { NextResponse, NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { api2 } from './lib/utils/AxiosInstance';

// Defining types for the menu structure
type MenuItem = {
  title: string;
  icon: string;
  isActive: boolean;
  parentId: number;
  order: number;
  items?: MenuItem[];
};

type MenuSidebarResponse = {
  data: MenuItem[];
};

let cachedMenu: MenuSidebarResponse | null = null;

// Whitelisted URLs to bypass access control
const whitelistedUrls = [
  '/dashboard', // Example: login page
  '/dashboard/cuti/overview', // Example: public pages
  '/dashboard/izin/overview', // Example: help page
  '/dashboard/resequence', // Example: help page
  '/dashboard/cuti', // Example: help page
  '/dashboard/izin' // Example: help page
];

export async function middleware(req: NextRequest) {
  // Get the token from cookies
  const isMaintenance = process.env.MAINTENANCE_MODE === 'true';
  const publicPaths = ['/maintenance', '/auth/signin', '/api/auth/*'];

  // Jika aplikasi dalam mode pemeliharaan dan URL yang diakses bukan bagian dari rute yang diizinkan
  if (isMaintenance && !publicPaths.some((path) => req.url.includes(path))) {
    // Redirect ke halaman maintenance jika mode pemeliharaan aktif
    return NextResponse.redirect(new URL('/maintenance', req.url));
  }
  const token = req.cookies.get('next-auth.session-token')?.value;
  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }

  const tokenAccess = (await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET
  })) as JWT & { users?: { id?: string } };

  if (!tokenAccess) {
    return NextResponse.redirect(new URL('/auth/signin', req.url)); // Redirect to login if no token
  }

  const userId = tokenAccess?.users?.id;
  // Check if the cached menu is available, else fetch it
  if (!cachedMenu && userId) {
    try {
      const navResponse = await api2.get(`/menu/menu-sidebar?userId=${userId}`);
      cachedMenu = navResponse; // Cache the menu data
    } catch (error) {
      console.error('Error fetching menu data:', error);
    }
  }

  // Ensure navItems is available before proceeding
  const navItems = cachedMenu?.data;

  // If no menu data found, redirect to 404
  if (!navItems) {
    return NextResponse.redirect(new URL('/404', req.url));
  }

  // Get the requested URL and check if it matches any title
  const requestedUrl = req.nextUrl.pathname.toLowerCase();

  // Check if the requested URL is in the whitelist
  if (whitelistedUrls.includes(requestedUrl)) {
    return NextResponse.next(); // Allow access if the URL is in the whitelist
  }

  // Normalize title to URL path (e.g., "KARYAWAN" -> "/dashboard/karyawan")
  const normalizedTitleToUrl = (title: string) => {
    return `/dashboard/${title.toLowerCase()}`; // Assuming titles map directly to URL like this
  };

  // Check if any menu item or its subitems match the requested URL
  const hasAccess = navItems.some((item: MenuItem) => {
    const itemUrl = normalizedTitleToUrl(item.title); // Convert title to URL path
    return (
      requestedUrl === itemUrl ||
      item.items?.some(
        (subItem) => requestedUrl === normalizedTitleToUrl(subItem.title)
      )
    );
  });

  // if (!hasAccess) {
  //   // Redirect to 404 if the requested URL is not found in navItems
  //   return NextResponse.redirect(new URL('/404', req.url));
  // }

  // Check for mobile devices via User-Agent and block certain pages for mobile if needed
  const userAgent = req.headers.get('user-agent') || '';
  const isMobile = /mobile/i.test(userAgent);

  // If on mobile and trying to access restricted URL, redirect
  if (isMobile && requestedUrl.includes('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }

  // Continue to the requested page if the user has access
  return NextResponse.next();
}

// Configuring matcher to apply this middleware to specific paths
export const config = {
  matcher: ['/dashboard/:path*']
};
