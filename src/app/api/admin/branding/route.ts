import { NextRequest, NextResponse } from 'next/server';
import {
  createAdminInsforgeClient,
  createServerInsforgeClient,
  requireAuthenticatedRequest,
  requireRole,
} from '@/lib/server-auth';
import { applyRateLimit } from '@/lib/rate-limit';

export const revalidate = 300;

const defaultBranding = {
  system_name: 'GRAMMAR',
  tagline: 'Governed Action Runtime',
  primary_color: '#00A3FF',
  accent_color: '#A855F7',
  logo_url: '',
  favicon_url: '',
};

function getServerClient() {
  return createServerInsforgeClient();
}

export async function GET() {
  try {
    let insforge;

    try {
      insforge = getServerClient();
    } catch {
      return NextResponse.json({ data: defaultBranding }, {
        headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' },
      });
    }

    const { data, error } = await insforge.database
      .from('system_config')
      .select('*')
      .eq('id', 'global')
      .single();

    if (error || !data) {
      return NextResponse.json({ data: defaultBranding }, {
        headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' },
      });
    }

    return NextResponse.json({ data }, {
      headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' },
    });
  } catch {
    return NextResponse.json({ data: defaultBranding }, {
      headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' },
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuthenticatedRequest(request);
    if (!authResult.ok) {
      return authResult.response;
    }

    const roleResponse = requireRole(authResult.context, ['admin', 'operator']);
    if (roleResponse) {
      return roleResponse;
    }

    const rateLimitResponse = applyRateLimit(request, 'branding-update', {
      maxRequests: 10,
      windowMs: 10 * 60 * 1000,
      subject: authResult.context.user.id,
    });
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const payload = await request.json();
    const insforge = createAdminInsforgeClient();

    const { error } = await insforge.database
      .from('system_config')
      .update({
        system_name: payload.systemName,
        tagline: payload.tagline,
        primary_color: payload.primaryColor,
        accent_color: payload.accentColor,
        logo_url: payload.logoUrl,
        favicon_url: payload.faviconUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 'global');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save branding config';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
