import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware to protect routes and handle auth redirects.
 * 
 * Logic:
 * 1. Protect only private app areas (/board, /manager, /agents, /memory, /policies, /logs, /pricing, /settings).
 *    - Check for InsForge auth cookie.
 *    - Redirect to /auth/login if missing.
 * 2. Keep exploration routes public (/chat/* and /research) and redirect /auth/login when already authenticated:
 *    - Redirect to /board.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define protected routes
  const isProtectedRoute = 
    pathname.startsWith('/board') || 
    pathname.startsWith('/manager') ||
    pathname.startsWith('/agents') || 
    pathname.startsWith('/memory') || 
    pathname.startsWith('/policies') || 
    pathname.startsWith('/logs') ||
    pathname.startsWith('/pricing') ||
    pathname === '/settings';

  const isAuthRoute = pathname.startsWith('/auth/login');
  const isCallbackRoute = pathname.startsWith('/auth/callback');

  // Root landing page is ALWAYS public
  if (pathname === '/') {
    return NextResponse.next();
  }

  // Skip middleware for API, static files, images, callback, etc.
  if (
    pathname.includes('.') || 
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next') ||
    isCallbackRoute
  ) {
    return NextResponse.next();
  }

  // Check all cookies for an auth token
  // InsForge/Supabase uses: insforge-auth-token, sb-access-token, or sb-[project-id]-auth-token
  const cookies = request.cookies.getAll();
  const authToken = cookies.find(c => 
    c.name === 'insforge-auth-token' || 
    c.name === 'sb-access-token' || 
    (c.name.startsWith('sb-') && c.name.endsWith('-auth-token'))
  );

  if (isProtectedRoute && !authToken) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && authToken) {
    return NextResponse.redirect(new URL('/board', request.url));
  }

  return NextResponse.next();
}

/**
 * Configure which paths the middleware runs on
 */
export const config = {
  matcher: [
    '/board/:path*',
    '/manager/:path*',
    '/agents/:path*',
    '/memory/:path*',
    '/policies/:path*',
    '/logs/:path*',
    '/pricing/:path*',
    '/settings/:path*',
    '/auth/login',
  ],
};
