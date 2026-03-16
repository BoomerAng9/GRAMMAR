'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, Copy, Check, Paperclip, FileText, Link2, X } from 'lucide-react';
import { toast } from 'sonner';
import { insforge } from '@/lib/insforge';
import { useAuth } from '@/hooks/useAuth';
import { type ChatAttachment, type NotebookSourceRecord, mapPersistedSourceRecord, type PersistedSourceRecord } from '@/lib/research/source-records';
import { sourceIcon } from '@/lib/research/source-icons';

interface ChatMessage {
  id: string;
  role: 'agent' | 'user';
  content: string;
  timestamp: string;
  attachments?: ChatAttachment[];
  citations?: Array<{
    sourceId: string;
    sourceTitle: string;
    excerpt: string;
    pageNumber?: number;
  }>;
}

const SYSTEM_PROMPT = `You are ACHEEVY, the assistant inside GRAMMAR. Your single purpose is to convert plain-language descriptions into structured technical prompts that the user can copy and paste into any AI tool (ChatGPT, Claude, Gemini, etc.).

When a user describes what they need in everyday language, you:
1. Ask one or two clarifying questions if the request is ambiguous (keep it brief).
2. Once you understand the intent, produce a structured prompt in a fenced code block labeled \`prompt\`.
3. The structured prompt should include: a clear role/persona, the task objective, key constraints, expected output format, and any relevant context.
4. After the prompt block, briefly explain what the prompt does and suggest which AI tool it works best with.

Rules:
- Always output the final prompt inside a fenced code block with the label \`prompt\`.
- Never refuse to produce a prompt. If the request is vague, ask a short clarifying question first.
- Do not manage work, projects, or workflows. You only produce prompts.
- Be concise and professional.`;

function PromptBlock({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-200">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Structured Prompt</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-slate-600 hover:bg-white hover:text-slate-900 transition-all"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="px-4 py-3 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap font-mono overflow-x-auto">
        {content}
      </pre>
    </div>
  );
}

function parseMessageContent(content: string) {
  const parts: { type: 'text' | 'prompt'; content: string }[] = [];
  const regex = /```prompt\s*\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: content.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'prompt', content: match[1].trim() });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: 'text', content: content.slice(lastIndex) });
  }

  return parts;
}

export default function ChatWithAcheevyPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  const [isAttachmentPickerOpen, setIsAttachmentPickerOpen] = useState(false);
  const [availableSources, setAvailableSources] = useState<NotebookSourceRecord[]>([]);
  const [selectedAttachments, setSelectedAttachments] = useState<ChatAttachment[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    async function loadSources() {
      if (!user || !insforge) {
        return;
      }

      try {
        const { data } = await insforge.database
          .from('data_sources')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (Array.isArray(data)) {
          setAvailableSources((data as PersistedSourceRecord[]).map(mapPersistedSourceRecord));
        }
      } catch (loadError) {
        console.error('[Chat] Failed to load NotebookLM sources:', loadError);
      }
    }

    void loadSources();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const toggleSourceAttachment = (source: NotebookSourceRecord) => {
    setSelectedAttachments((current) => {
      const exists = current.some((attachment) => attachment.id === source.id);
      if (exists) {
        return current.filter((attachment) => attachment.id !== source.id);
      }

      return [
        ...current,
        {
          id: source.id,
          title: source.title,
          kind: 'notebook-source',
          type: source.type,
          notebookId: source.notebookId,
          sourceId: source.id,
          notebookSourceId: source.metadata?.notebookSourceId,
          content: source.metadata?.content,
          url: source.metadata?.url,
        },
      ];
    });
  };

  const removeAttachment = (attachmentId: string) => {
    setSelectedAttachments((current) => current.filter((attachment) => attachment.id !== attachmentId));
  };

  const handleFileSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) {
      return;
    }

    const nextAttachments = await Promise.all(files.map(async (file) => {
      const text = await file.text();
      return {
        id: `upload-${file.name}-${file.lastModified}`,
        title: file.name,
        kind: 'upload' as const,
        type: 'text' as const,
        mimeType: file.type || 'text/plain',
        content: text.slice(0, 20000),
      };
    }));

    setSelectedAttachments((current) => {
      const deduped = current.filter((attachment) => !nextAttachments.some((nextAttachment) => nextAttachment.id === attachment.id));
      return [...deduped, ...nextAttachments];
    });

    event.target.value = '';
    toast.success(`${files.length} attachment${files.length > 1 ? 's' : ''} added.`);
  };

  const handleSend = async () => {
    const text = query.trim();
    if (!text || isTyping) return;

    setError('');
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString(),
      attachments: selectedAttachments,
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setQuery('');
    setIsTyping(true);
    setIsAttachmentPickerOpen(false);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...updated.map(m => ({
              role: m.role === 'agent' ? 'assistant' as const : 'user' as const,
              content: m.content,
            })),
          ],
          attachments: selectedAttachments,
        }),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || 'Request failed');

      const reply = typeof payload?.reply === 'string' ? payload.reply.trim() : '';
      if (!reply) throw new Error('Empty response from AI engine');

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: reply,
        timestamp: new Date().toLocaleTimeString(),
        citations: Array.isArray(payload?.citations) ? payload.citations : [],
      }]);
      setSelectedAttachments([]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: `I hit an issue: ${msg}. Please try again.`,
        timestamp: new Date().toLocaleTimeString(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
      {/* Top bar */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-white shrink-0">
        <div className="w-9 h-9 rounded-xl bg-[#0F172A] flex items-center justify-center shadow-md">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 tracking-tight">
          GRAMMAR
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 font-semibold">Chat w/ ACHEEVY</span>
        </div>
        {error && (
          <span className="ml-auto text-[10px] font-bold text-red-500 uppercase tracking-wider">Connection issue</span>
        )}
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6 text-slate-400" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Welcome to GRAMMAR</h2>
            <p className="text-slate-500 font-medium text-sm max-w-md">
              I&apos;m ACHEEVY. Where do we start?
            </p>
            <p className="text-slate-400 text-xs mt-4 max-w-sm">
              Describe what you need in plain language and GRAMMAR will convert it into a structured prompt.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white text-xs font-bold ${
                    msg.role === 'user'
                      ? 'bg-[#00A3FF]'
                      : 'bg-[#0F172A]'
                  }`}
                >
                  {msg.role === 'user' ? 'U' : <Sparkles className="w-4 h-4" />}
                </div>
                <div className={`max-w-[75%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#00A3FF] text-white rounded-tr-sm'
                        : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-sm'
                    }`}
                  >
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {msg.attachments.map((attachment) => (
                          <div key={attachment.id} className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${msg.role === 'user' ? 'bg-white/20 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
                            {attachment.kind === 'notebook-source' ? <Link2 className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                            {attachment.title}
                          </div>
                        ))}
                      </div>
                    )}
                    {msg.role === 'agent' ? (
                      parseMessageContent(msg.content).map((part, i) =>
                        part.type === 'prompt' ? (
                          <PromptBlock key={i} content={part.content} />
                        ) : (
                          <p key={i} className="whitespace-pre-wrap">{part.content}</p>
                        )
                      )
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-4 grid grid-cols-1 gap-2 border-t border-slate-200 pt-4">
                        {msg.citations.map((citation, index) => (
                          <div key={`${citation.sourceId}-${index}`} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-600">
                            <span className="mr-2 text-[#00A3FF]">[{index + 1}]</span>
                            {citation.sourceTitle}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono mt-1 block px-1">{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center text-white shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-sm">
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                  <span className="text-xs text-slate-400">ACHEEVY is thinking...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="px-6 py-4 border-t border-slate-100 bg-white shrink-0">
        {selectedAttachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {selectedAttachments.map((attachment) => (
              <button
                key={attachment.id}
                type="button"
                onClick={() => removeAttachment(attachment.id)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-100"
              >
                {attachment.kind === 'notebook-source' ? <Link2 className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                {attachment.title}
                <X className="w-3 h-3" />
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-3 bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-[#00A3FF] focus-within:ring-4 focus-within:ring-[#00A3FF]/5 transition-all px-4 py-2">
          <button
            type="button"
            title="Add attachments"
            onClick={() => setIsAttachmentPickerOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-white hover:text-slate-900"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
            placeholder="Type your request..."
            className="flex-1 bg-transparent py-2 text-sm text-slate-900 focus:outline-none placeholder:text-slate-400"
          />
          <button
            onClick={() => void handleSend()}
            disabled={!query.trim() || isTyping}
            title="Send message"
            className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center hover:bg-slate-800 disabled:opacity-40 transition-all shrink-0 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        {isAttachmentPickerOpen && (
          <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Attachments</p>
                <p className="mt-1 text-sm font-bold text-slate-900">Attach files or NotebookLM sources</p>
              </div>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-xl bg-slate-900 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-slate-800">
                Upload file
              </button>
              <input ref={fileInputRef} type="file" multiple accept=".txt,.md,.json,.csv,.html,.ts,.tsx,.js,.jsx,.py" title="Upload attachment files" className="hidden" onChange={handleFileSelection} />
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">NotebookLM sources</p>
              {availableSources.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  No NotebookLM sources yet. Add them in Research Lab, then attach them here.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {availableSources.map((source) => {
                    const isSelected = selectedAttachments.some((attachment) => attachment.id === source.id);
                    return (
                      <button
                        key={source.id}
                        type="button"
                        onClick={() => toggleSourceAttachment(source)}
                        className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all ${isSelected ? 'border-[#00A3FF] bg-[#00A3FF0A]' : 'border-slate-200 bg-slate-50 hover:bg-white'}`}
                      >
                        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${isSelected ? 'bg-[#00A3FF] text-white' : 'bg-white text-[#00A3FF] border border-slate-200'}`}>
                          {sourceIcon(source.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-slate-900">{source.title}</p>
                          <p className="text-[10px] text-slate-500">{source.type.toUpperCase()}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
