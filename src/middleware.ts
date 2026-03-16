import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PREFIXES = [
  '/board',
  '/manager',
  '/agents',
  '/memory',
  '/policies',
  '/logs',
  '/pricing',
] as const;

const PROTECTED_EXACT = ['/settings'] as const;

const MIDDLEWARE_MATCHER = [
  '/board/:path*',
  '/manager/:path*',
  '/agents/:path*',
  '/memory/:path*',
  '/policies/:path*',
  '/logs/:path*',
  '/pricing/:path*',
  '/settings/:path*',
  '/auth/login',
] as const;

/**
 * Middleware to protect private routes and handle auth redirects.
 *
 * Public exploration routes intentionally remain outside matcher scope:
 * - /chat/*
 * - /research
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute =
    PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    PROTECTED_EXACT.some((path) => pathname === path);

  const isAuthRoute = pathname.startsWith('/auth/login');
  const isCallbackRoute = pathname.startsWith('/auth/callback');

  if (pathname === '/') {
    return NextResponse.next();
  }

  if (
    pathname.includes('.') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    isCallbackRoute
  ) {
    return NextResponse.next();
  }

  const cookies = request.cookies.getAll();
  const authToken = cookies.find((c) =>
    c.name === 'insforge-auth-token' ||
    c.name === 'sb-access-token' ||
    (c.name.startsWith('sb-') && c.name.endsWith('-auth-token')),
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

export const config = {
  matcher: MIDDLEWARE_MATCHER,
};
