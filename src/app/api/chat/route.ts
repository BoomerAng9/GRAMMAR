import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';
import { tliService } from '@/lib/research/tli-service';
import type { ChatAttachment } from '@/lib/research/source-records';
import { createOpenRouterChatCompletion, getOpenRouterModel } from '@/lib/ai/openrouter';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface GroundingResult {
  contextSections: string[];
  citations: Array<{
    sourceId: string;
    sourceTitle: string;
    excerpt: string;
    pageNumber?: number;
  }>;
}

function getServerClient() {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

  if (!baseUrl || !anonKey) {
    throw new Error('InsForge server config is missing. Set NEXT_PUBLIC_INSFORGE_URL and NEXT_PUBLIC_INSFORGE_ANON_KEY.');
  }

  return createClient({ baseUrl, anonKey });
}

function getLastUserMessage(messages: ChatMessage[]) {
  const reversed = [...messages].reverse();
  return reversed.find((message) => message.role === 'user')?.content || '';
}

async function buildGrounding(attachments: ChatAttachment[], userPrompt: string): Promise<GroundingResult> {
  const contextSections: string[] = [];
  const citations: GroundingResult['citations'] = [];

  const uploadedAttachments = attachments.filter((attachment) => attachment.kind === 'upload');
  if (uploadedAttachments.length > 0) {
    const uploadContext = uploadedAttachments
      .map((attachment) => {
        const content = attachment.content?.trim() || '';
        return `Attachment: ${attachment.title}\n${content.slice(0, 12000)}`;
      })
      .join('\n\n');

    contextSections.push(`User attached files:\n${uploadContext}`);
  }

  const notebookGroups = attachments
    .filter((attachment) => attachment.kind === 'notebook-source' && attachment.notebookId)
    .reduce<Record<string, ChatAttachment[]>>((groups, attachment) => {
      const notebookId = attachment.notebookId as string;
      groups[notebookId] = [...(groups[notebookId] || []), attachment];
      return groups;
    }, {});

  for (const [notebookId, sourceAttachments] of Object.entries(notebookGroups)) {
    const titles = sourceAttachments.map((attachment) => attachment.title).join(', ');
    const groundingPrompt = [
      'Answer using only the attached NotebookLM sources listed below.',
      `Attached source titles: ${titles}`,
      `User request: ${userPrompt}`,
      'Return a concise synthesis that can be used as grounding context for another AI assistant.',
    ].join('\n');

    try {
      const notebookResponse = await tliService.research(notebookId, groundingPrompt, 'deep');
      contextSections.push(`NotebookLM grounding from attached sources (${titles}):\n${notebookResponse.answer}`);
      citations.push(...notebookResponse.citations.filter((citation) => {
        return sourceAttachments.some((attachment) => {
          return citation.sourceId === attachment.notebookSourceId || citation.sourceTitle === attachment.title;
        });
      }));
    } catch (error) {
      const fallbackContext = sourceAttachments
        .map((attachment) => {
          const metadataContext = attachment.content || attachment.url || 'Attached NotebookLM source.';
          return `${attachment.title}: ${metadataContext}`;
        })
        .join('\n');
      contextSections.push(`NotebookLM sources attached (fallback metadata):\n${fallbackContext}`);
      console.error('[Chat API] NotebookLM grounding failed:', error);
    }
  }

  return { contextSections, citations };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messages = Array.isArray(body.messages) ? (body.messages as ChatMessage[]) : [];
    const attachments = Array.isArray(body.attachments) ? (body.attachments as ChatAttachment[]) : [];
    const inputMode = body.inputMode === 'voice' ? 'voice' : 'text';

    if (!messages.length) {
      return NextResponse.json({ error: 'messages is required' }, { status: 400 });
    }

    const userPrompt = getLastUserMessage(messages);
    const grounding = attachments.length > 0 ? await buildGrounding(attachments, userPrompt) : { contextSections: [], citations: [] };

    const finalMessages = grounding.contextSections.length > 0
      ? [
          ...messages,
          {
            role: 'system' as const,
            content: `Use the following attached context when responding. Prefer it over general assumptions.\n\n${grounding.contextSections.join('\n\n')}`,
          },
        ]
      : messages;

    const requestedModel = typeof body.model === 'string' && body.model.trim() ? body.model : getOpenRouterModel(inputMode);

    if (process.env.OPENROUTER_KEY || process.env.OPENAI_API_KEY) {
      const completion = await createOpenRouterChatCompletion({
        messages: finalMessages,
        model: requestedModel,
        inputMode,
        userId: typeof body.userId === 'string' ? body.userId : undefined,
      });

      return NextResponse.json({
        reply: completion.content,
        raw: completion.raw,
        citations: grounding.citations,
        model: completion.model,
        provider: 'OpenRouter',
      });
    }

    const insforge = getServerClient();
    const { data, error } = await insforge.ai.chat.completions.create({
      model: requestedModel,
      messages: finalMessages,
    });

    if (error) {
      return NextResponse.json({ error: error.message || 'AI completion failed' }, { status: 502 });
    }

    const content = data?.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return NextResponse.json({ error: 'AI returned an empty payload.' }, { status: 502 });
    }

    return NextResponse.json({ reply: content, raw: data, citations: grounding.citations, model: requestedModel, provider: 'InsForge' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal chat API error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
