/**
 * Server-side auth — Firebase Admin SDK for token verification.
 * Database queries via postgres.js against Neon.
 */
import { NextRequest, NextResponse } from 'next/server';
import type { UserProfile } from '@/lib/auth-paywall';
import { sql } from '@/lib/insforge';

const AUTH_COOKIE_NAME = 'firebase-auth-token';

let _adminAuth: import('firebase-admin/auth').Auth | null = null;

async function getAdminAuth() {
  if (_adminAuth) return _adminAuth;

  const { initializeApp, getApps, cert } = await import('firebase-admin/app');
  const { getAuth } = await import('firebase-admin/auth');

  if (getApps().length === 0) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccount) {
      initializeApp({ credential: cert(JSON.parse(serviceAccount)) });
    } else {
      initializeApp();
    }
  }

  _adminAuth = getAuth();
  return _adminAuth;
}

export function extractAuthToken(entries: Array<{ name: string; value: string }>) {
  const match = entries.find((entry) => entry.name === AUTH_COOKIE_NAME);
  return match?.value || null;
}

export function getRequestAuthToken(request: NextRequest) {
  return extractAuthToken(request.cookies.getAll());
}

async function loadProfile(userId: string): Promise<UserProfile | null> {
  if (!sql) return null;
  const rows = await sql`SELECT * FROM profiles WHERE user_id = ${userId} LIMIT 1`;
  return (rows[0] as UserProfile) ?? null;
}

export interface FirebaseUser {
  uid: string;
  email?: string;
  displayName?: string;
}

export interface AuthenticatedRequestContext {
  token: string;
  user: FirebaseUser;
  profile: UserProfile | null;
}

export async function requireAuthenticatedRequest(request: NextRequest): Promise<
  { ok: true; context: AuthenticatedRequestContext } |
  { ok: false; response: NextResponse }
> {
  const token = getRequestAuthToken(request);
  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }),
    };
  }

  try {
    const auth = await getAdminAuth();
    const decoded = await auth.verifyIdToken(token);

    const user: FirebaseUser = {
      uid: decoded.uid,
      email: decoded.email,
      displayName: decoded.name,
    };

    const profile = await loadProfile(decoded.uid);
    return {
      ok: true,
      context: { token, user, profile },
    };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Invalid or expired session.' }, { status: 401 }),
    };
  }
}

export function requireRole(
  context: AuthenticatedRequestContext,
  allowedRoles: UserProfile['role'][],
) {
  if (!context.profile || !allowedRoles.includes(context.profile.role)) {
    return NextResponse.json({ error: 'You do not have access to this resource.' }, { status: 403 });
  }
  return null;
}
