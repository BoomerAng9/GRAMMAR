import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

function getServerClient() {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

  if (!baseUrl || !anonKey) {
    throw new Error('InsForge server config is missing. Set NEXT_PUBLIC_INSFORGE_URL and NEXT_PUBLIC_INSFORGE_ANON_KEY.');
  }

  return createClient({ baseUrl, anonKey });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messages = Array.isArray(body.messages) ? (body.messages as ChatMessage[]) : [];

    if (!messages.length) {
      return NextResponse.json({ error: 'messages is required' }, { status: 400 });
    }

    const insforge = getServerClient();
    const { data, error } = await insforge.ai.chat.completions.create({
      model: body.model || 'openai/gpt-4o-mini',
      messages,
    });

    if (error) {
      return NextResponse.json({ error: error.message || 'AI completion failed' }, { status: 502 });
    }

    const content = data?.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return NextResponse.json({ error: 'AI returned an empty payload.' }, { status: 502 });
    }

    return NextResponse.json({ reply: content, raw: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal chat API error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
