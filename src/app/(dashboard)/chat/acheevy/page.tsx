"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight,
  BookOpen,
  Activity,
  Send,
  Sparkles,
  Paperclip
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { insforge } from '@/lib/insforge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChatMessage {
  id: string;
  role: 'agent' | 'user';
  content: string;
  timestamp: string;
}

const seedMessage: ChatMessage = {
  id: '1',
  role: 'agent',
  content: 'I am ACHEEVY, the core orchestrator for GRAMMAR. I interpret intent, coordinate agents, govern context via MIM, and package outcomes. How can I direct the ecosystem for you today?',
  timestamp: new Date().toLocaleTimeString(),
};

export default function AcheevyCentral() {
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [connectionState, setConnectionState] = useState<'connected' | 'degraded'>('connected');
  const scrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([seedMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    try {
      const cached = localStorage.getItem('acheevy_chat_v1');
      if (cached) {
        const parsed = JSON.parse(cached) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      setMessages([seedMessage]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('acheevy_chat_v1', JSON.stringify(messages));
  }, [messages]);

  const handleSend = async () => {
    if (!query.trim() || isTyping) return;
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString()
    };
    
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setQuery("");
    setIsTyping(true);
    
    if (!insforge) {
      setConnectionState('degraded');
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'agent',
          content: '[SYSTEM ERROR] Offline: Unable to connect to MIM backend context. Please verify InsForge configuration.',
          timestamp: new Date().toLocaleTimeString()
        }]);
        setIsTyping(false);
      }, 300);
      return;
    }

    try {
      const { data, error } = await insforge.ai.chat.completions.create({
        model: 'openai/gpt-4o-mini',
        messages: updatedMessages.map(m => ({
          role: m.role === 'agent' ? 'assistant' : 'user',
          content: m.content,
        })),
      });

      if (error) {
        throw new Error(error.message || 'Failed to communicate with ACHEEVY engine');
      }

      const reply = data?.choices?.[0]?.message?.content?.trim();
      if (!reply) {
        throw new Error('No response payload returned by AI engine.');
      }

      setConnectionState('connected');
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: reply,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[ACHEEVY AI Error]:', err);
      setConnectionState('degraded');
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: `I encountered a disruption in the routing execution: ${errorMessage}`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-160px)] gap-8 animate-in fade-in duration-500">
      {/* Primary Chat Area */}
      <div className="flex-1 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col relative">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-10 absolute top-0 inset-x-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-xs">AC</span>
            </div>
            <div>
              <h2 className="font-bold text-slate-900 tracking-tight text-sm">ACHEEVY INSTANCE</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={cn('w-1.5 h-1.5 rounded-full', connectionState === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500')} />
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{connectionState === 'connected' ? 'Connected: Central Engine' : 'Degraded: Check backend keys'}</span>
              </div>
            </div>
          </div>
          <div className="px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2">
            <Activity className="w-3 h-3 text-[#00A3FF]" />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Orchestrator Idle</span>
          </div>
        </div>
        
        {/* Chat Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 pt-28 space-y-8 scroll-smooth scrollbar-thin bg-slate-50/30">
          {messages.map((msg) => (
            <div key={msg.id} className={cn(
              "flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
              msg.role === 'user' ? "flex-row-reverse" : ""
            )}>
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm",
                msg.role === 'user' ? "bg-gradient-to-br from-[#00A3FF] to-[#0089D9] text-white" : "bg-slate-900 text-white"
              )}>
                {msg.role === 'user' ? (
                  <span className="text-xs font-bold">U</span>
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
              </div>
              <div className={cn(
                "max-w-[75%] space-y-2",
                msg.role === 'user' ? "items-end text-right" : ""
              )}>
                <div className={cn(
                  "p-5 rounded-2xl shadow-sm relative group",
                  msg.role === 'user' 
                    ? "bg-[#00A3FF] text-white rounded-tr-none" 
                    : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                )}>
                  <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
                <span className="text-[9px] text-slate-400 font-mono tracking-tighter uppercase px-2 block">{msg.timestamp}</span>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-slate-200" />
              <div className="flex-1 space-y-3 pt-2 max-w-[50%]">
                <div className="h-4 bg-slate-200 rounded-full w-[80%]" />
                <div className="h-4 bg-slate-200 rounded-full w-[60%]" />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-slate-100 relative z-20">
          <div className="flex items-center gap-3 bg-slate-50 rounded-[1.5rem] border border-slate-200 focus-within:border-[#00A3FF] focus-within:ring-4 focus-within:ring-[#00A3FF11] transition-all px-2 py-2">
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-white hover:shadow-sm hover:text-slate-600 transition-all shrink-0">
               <Paperclip className="w-4 h-4" />
            </button>
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              placeholder="Direct ACHEEVY..."
              className="flex-1 bg-transparent px-2 py-3 text-sm font-medium text-slate-900 focus:outline-none placeholder:text-slate-400"
            />
            <button 
              onClick={handleSend}
              disabled={!query.trim() || isTyping}
              className="w-10 h-10 rounded-full bg-[#00A3FF] text-white flex items-center justify-center hover:bg-[#0089D9] hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100 transition-all shrink-0 active:scale-95"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Research Sync Sidebar */}
      <aside className="w-72 flex flex-col gap-6">
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex-1 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 uppercase tracking-tight text-xs">Research Sync</h3>
            <span className="bg-[#00A3FF10] text-[#00A3FF] px-2 py-0.5 rounded text-[10px] font-bold">ACTIVE</span>
          </div>

          <div className="space-y-4 flex-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest border-b border-slate-50 pb-2">Active Context Packs</p>
            <div className="space-y-2">
              {[
                { name: 'GRAMMAR-CORE-KB', status: 'In Sync', color: 'bg-emerald-500' },
                { name: 'TOKENIZATION-STRATS', status: 'Cached', color: 'bg-[#00A3FF]' }
              ].map((pack, i) => (
                <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:border-[#00A3FF33] transition-colors flex flex-col gap-3 group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">{pack.name}</span>
                    <div className={cn("w-2 h-2 rounded-full", pack.color)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono italic group-hover:text-slate-500 transition-colors">{pack.status}</span>
                    <button className="text-[10px] text-[#00A3FF] font-bold hover:underline opacity-0 group-hover:opacity-100 transition-opacity">DETACH</button>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest border-b border-slate-50 pb-2 mt-8">Technical Hotspots</p>
            <div className="space-y-4 pt-1">
              {[
                { tag: 'MIM_GOV', weight: 'High' },
                { tag: 'API_INTEG', weight: 'Med' },
                { tag: 'TLI_INDEX', weight: 'Low' }
              ].map((tag, i) => (
                <div key={i} className="flex items-center justify-between group cursor-help">
                  <span className="text-xs text-slate-600 font-medium group-hover:text-slate-900 transition-colors">#{tag.tag}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className={cn(
                      "w-1.5 h-3 rounded-full transition-all duration-500",
                      tag.weight === 'High' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 
                      tag.weight === 'Med' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 
                      'bg-slate-300'
                    )} />
                    <span className="text-[9px] text-slate-400 font-bold w-6 text-right uppercase">{tag.weight}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group active:scale-[0.98]">
            <Activity className="w-4 h-4 text-[#00A3FF] group-hover:scale-110 transition-transform" />
            Sync Context
          </button>
        </div>

        <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-[#00A3FF] blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity" />
           <div className="flex items-center gap-2 mb-3 relative z-10">
             <BookOpen className="w-4 h-4 text-[#00A3FF]" />
             <h4 className="font-bold text-xs uppercase tracking-widest">Research Link</h4>
           </div>
           <p className="text-[10px] text-slate-400 leading-relaxed mb-6 font-medium relative z-10">Deep research allows for multi-document synthesis and evidence-backed reasoning.</p>
           <Link 
             href="/research"
             className="flex items-center justify-center gap-2 w-full text-[10px] font-bold text-white bg-slate-800 hover:bg-slate-700 py-3 rounded-xl border border-slate-700 transition-all uppercase tracking-widest relative z-10"
           >
             Open Lab
             <ChevronRight className="w-3.5 h-3.5" />
           </Link>
        </div>
      </aside>
    </div>
  );
}
