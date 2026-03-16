'use client';

import { ExternalLink } from 'lucide-react';

const LIBRECHAT_URL = process.env.NEXT_PUBLIC_LIBRECHAT_URL || 'https://grammar.aimanagedsolutions.cloud';

export default function LibreChatPage() {
  return (
    <div className="space-y-4 h-full">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">LibreChat (VPS Native)</h1>
          <p className="text-sm text-slate-500">
            This view embeds your existing VPS-hosted LibreChat instance (no custom bridge layer).
          </p>
        </div>
        <a
          href={LIBRECHAT_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50"
        >
          Open Native
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="h-[calc(100vh-240px)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <iframe
          title="LibreChat VPS"
          src={LIBRECHAT_URL}
          className="h-full w-full"
          referrerPolicy="no-referrer"
          allow="clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
}
