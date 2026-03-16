import { NextRequest, NextResponse } from 'next/server';
import { agentFleet } from '@/core_runtime/agent_fleet';
import { ntntn } from '@/core_runtime/ntntn';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('orgId') ?? 'demo-org';
    const intent = searchParams.get('intent');
    const normalized = intent ? await ntntn.normalize(intent) : undefined;

    return NextResponse.json({
      snapshot: agentFleet.getSnapshot(organizationId, normalized),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to load agent fleet';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}