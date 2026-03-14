import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware to protect routes and handle auth redirects.
 * 
 * Logic:
 * 1. If path starts with /board, /agents, /research, /memory, /chat, /policies, /logs:
 *    - Check for InsForge auth cookie.
 *    - Redirect to /auth/login if missing.
 * 2. If path is /auth/login and session exists:
 *    - Redirect to /board.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define protected routes
  const isProtectedRoute = 
    pathname.startsWith('/board') || 
    pathname.startsWith('/agents') || 
    pathname.startsWith('/research') || 
    pathname.startsWith('/memory') || 
    pathname.startsWith('/chat') || 
    pathname.startsWith('/policies') || 
    pathname.startsWith('/logs') ||
    pathname === '/settings';

  const isAuthRoute = pathname.startsWith('/auth/login');

  // Skip middleware for API, static files, images, etc.
  if (
    pathname.includes('.') || 
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next')
  ) {
    return NextResponse.next();
  }

  // InsForge SDK typically stores session in a cookie prefixed with 'ins-'
  // We check for the presence of the access token
  // Use 'insforge-auth-token' or similar based on SDK config
  const authToken = request.cookies.get('insforge-auth-token');

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
    '/agents/:path*',
    '/research/:path*',
    '/memory/:path*',
    '/chat/:path*',
    '/policies/:path*',
    '/logs/:path*',
    '/settings/:path*',
    '/auth/login',
  ],
};
