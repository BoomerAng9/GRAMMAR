import { createClient, type InsForgeClient, type UserSchema } from '@insforge/sdk';
import { NextRequest, NextResponse } from 'next/server';
import type { UserProfile } from '@/lib/auth-paywall';

const AUTH_COOKIE_NAMES = [
  'insforge-auth-token',
  'sb-access-token',
] as const;

function getBaseConfig(token?: string) {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

  if (!baseUrl || !anonKey) {
    throw new Error('InsForge env vars are missing.');
  }

  return {
    baseUrl,
    anonKey,
    edgeFunctionToken: token,
    autoRefreshToken: false,
    persistSession: false,
  };
}

export function extractAuthToken(entries: Array<{ name: string; value: string }>) {
  for (const cookieName of AUTH_COOKIE_NAMES) {
    const match = entries.find((entry) => entry.name === cookieName);
    if (match?.value) {
      return match.value;
    }
  }

  const projectCookie = entries.find((entry) => entry.name.startsWith('sb-') && entry.name.endsWith('-auth-token'));
  return projectCookie?.value || null;
}

export function createServerInsforgeClient(token?: string) {
  return createClient(getBaseConfig(token));
}

export function createAdminInsforgeClient() {
  const serviceToken = process.env.INSFORGE_API_KEY;
  if (!serviceToken) {
    throw new Error('INSFORGE_API_KEY is required for privileged server operations.');
  }

  return createServerInsforgeClient(serviceToken);
}

export function getRequestAuthToken(request: NextRequest) {
  return extractAuthToken(request.cookies.getAll());
}

async function loadProfile(client: InsForgeClient, userId: string) {
  const { data } = await client.database
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  return (data ?? null) as UserProfile | null;
}

export interface AuthenticatedRequestContext {
  client: InsForgeClient;
  token: string;
  user: UserSchema;
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
    const client = createServerInsforgeClient(token);
    const { data, error } = await client.auth.getCurrentUser();

    if (error || !data.user) {
      return {
        ok: false,
        response: NextResponse.json({ error: 'Invalid or expired session.' }, { status: 401 }),
      };
    }

    const profile = await loadProfile(client, data.user.id);
    return {
      ok: true,
      context: {
        client,
        token,
        user: data.user,
        profile,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to validate session.';
    return {
      ok: false,
      response: NextResponse.json({ error: message }, { status: 401 }),
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
