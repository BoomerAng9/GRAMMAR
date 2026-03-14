"use client";

import React from 'react';
import Link from 'next/link';
import { 
  MessageSquare,
  ChevronRight,
  Zap,
  BookOpen,
  Activity
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AcheevyCentral() {
  return (
    <div className="flex h-[calc(100vh-160px)] gap-8 animate-in fade-in duration-500">
      {/* Primary Chat Area */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col relative">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <span className="text-white font-black text-[10px]">AC</span>
            </div>
            <div>
              <h2 className="font-bold text-slate-900 tracking-tight text-sm">ACHEEVY INSTANCE</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Connected: localhost:3080</span>
              </div>
            </div>
          </div>
        </div>
        
        <iframe 
          src="http://localhost:3080" 
          className="flex-1 w-full h-full border-none bg-slate-50"
          title="LibreChat Interface"
        />
      </div>

      {/* Research Sync Sidebar */}
      <aside className="w-72 flex flex-col gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex-1 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 uppercase tracking-tight text-xs">Research Sync</h3>
            <span className="bg-[#00A3FF10] text-[#00A3FF] px-2 py-0.5 rounded text-[10px] font-bold">ACTIVE</span>
          </div>

          <div className="space-y-4 flex-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest border-b border-slate-50 pb-2">Active Context Packs</p>
            <div className="space-y-2">
              {[
                { name: 'GRAMMAR-CORE-KB', status: 'In Sync', color: 'bg-green-500' },
                { name: 'TOKENIZATION-STRATS', status: 'Cached', color: 'bg-[#00A3FF]' }
              ].map((pack, i) => (
                <div key={i} className="p-3 rounded-xl border border-slate-50 bg-slate-50/50 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">{pack.name}</span>
                    <div className={cn("w-1.5 h-1.5 rounded-full", pack.color)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono italic">{pack.status}</span>
                    <button className="text-[10px] text-[#00A3FF] font-bold hover:underline">DETACH</button>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest border-b border-slate-50 pb-2 mt-6">Technical Hotspots</p>
            <div className="space-y-3">
              {[
                { tag: 'MIM_GOV', weight: 'High' },
                { tag: 'API_INTEG', weight: 'Med' },
                { tag: 'TLI_INDEX', weight: 'Low' }
              ].map((tag, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis">#{tag.tag}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <div className={cn(
                      "w-1 h-3 rounded-full",
                      tag.weight === 'High' ? 'bg-red-400' : tag.weight === 'Med' ? 'bg-amber-400' : 'bg-slate-300'
                    )} />
                    <span className="text-[9px] text-slate-400 font-bold w-6">{tag.weight}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full py-3 bg-[#00A3FF] text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-[#00A3FF33] transition-all hover:bg-[#0089D9] active:scale-95 flex items-center justify-center gap-2">
            <Activity className="w-3.5 h-3.5" />
            UPDATE CONTEXT
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
           <div className="flex items-center gap-2 mb-3">
             <BookOpen className="w-4 h-4 text-[#00A3FF]" />
             <h4 className="font-bold text-xs uppercase tracking-tight">Research Thread?</h4>
           </div>
           <p className="text-[11px] text-slate-400 leading-relaxed mb-4">Deep research allows for multi-document synthesis and evidence-backed reasoning.</p>
           <Link 
             href="/research"
             className="flex items-center justify-center gap-2 w-full text-[11px] font-bold text-white bg-slate-800 hover:bg-slate-700 py-2.5 rounded-xl border border-slate-700 transition-all"
           >
             OPEN RESEARCH LAB
             <ChevronRight className="w-3 h-3" />
           </Link>
        </div>
      </aside>
    </div>
  );
}
