import { NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';

function getServerClient() {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

  if (!baseUrl || !anonKey) {
    throw new Error('InsForge env vars are missing.');
  }

  return createClient({ baseUrl, anonKey });
}

export async function GET() {
  try {
    const insforge = getServerClient();
    const { data, error } = await insforge.database
      .from('system_config')
      .select('*')
      .eq('id', 'global')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load branding config';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await request.json();
    const insforge = getServerClient();

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
