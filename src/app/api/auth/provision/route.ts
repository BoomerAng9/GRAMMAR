import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/insforge';

export async function POST(request: NextRequest) {
  try {
    if (!sql) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    const { firebaseUid, displayName, email } = await request.json();
    if (!firebaseUid) return NextResponse.json({ error: 'firebaseUid required' }, { status: 400 });

    await sql`SELECT provision_user(${firebaseUid}, ${displayName || null}, ${email || null})`;
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Provision failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
