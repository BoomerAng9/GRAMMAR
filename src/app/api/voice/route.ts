import { NextRequest, NextResponse } from 'next/server';
import { listVoiceVendors, synthesizeVoice, type VoiceVendorId } from '@/lib/voice/vendors';

export async function GET() {
  try {
    const vendors = await listVoiceVendors();
    return NextResponse.json({ vendors });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load voice vendors.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const vendor = body.vendor as VoiceVendorId;
    const text = typeof body.text === 'string' ? body.text : '';
    const voiceId = typeof body.voiceId === 'string' ? body.voiceId : undefined;
    const modelId = typeof body.modelId === 'string' ? body.modelId : undefined;

    if (!vendor || !['elevenlabs', 'nvidia-personaplex', 'grok'].includes(vendor)) {
      return NextResponse.json({ error: 'A valid voice vendor is required.' }, { status: 400 });
    }

    if (!text.trim()) {
      return NextResponse.json({ error: 'Text is required for synthesis.' }, { status: 400 });
    }

    const result = await synthesizeVoice({
      vendor,
      text,
      voiceId,
      modelId,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Voice synthesis failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}