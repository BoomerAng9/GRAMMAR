import { NextRequest, NextResponse } from 'next/server';
import { acheevy } from '@/core_runtime/acheevy';
import { agentFleet } from '@/core_runtime/agent_fleet';

type LaunchMode = 'preview' | 'execute';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const intent = typeof body.intent === 'string' ? body.intent.trim() : '';
    const orgId = typeof body.orgId === 'string' && body.orgId.trim() ? body.orgId.trim() : 'demo-org';
    const mode: LaunchMode = body.mode === 'execute' ? 'execute' : 'preview';

    if (!intent) {
      return NextResponse.json({ error: 'intent is required' }, { status: 400 });
    }

    const huddle = await acheevy.huddle(intent, orgId);
    const snapshot = agentFleet.getSnapshot(orgId, huddle.state.normalized_intent);

    if (mode === 'preview') {
      return NextResponse.json({
        mode,
        snapshot,
        plan: huddle.plan,
        state: huddle.state,
      });
    }

    const execution = await acheevy.execute(huddle.plan, huddle.state, huddle.context);
    return NextResponse.json({
      mode,
      snapshot,
      plan: huddle.plan,
      state: execution.state,
      success: execution.success,
      bundle: execution.success ? execution.bundle : null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Runtime launch failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}