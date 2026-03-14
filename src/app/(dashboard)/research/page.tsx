"use client";

import React, { useState } from 'react';
import { 
  Plus, 
  FileText, 
  Link as LinkIcon, 
  Youtube, 
  Type, 
  Search, 
  Send,
  Paperclip,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  ChevronRight
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock Data for Sources
const INITIAL_SOURCES = [
  { id: '1', title: 'GRAMMAR Architecture Guide.pdf', type: 'document', wordCount: '52.5k', tokens: '14,200', status: 'ready', date: 'Oct 24' },
  { id: '2', title: 'API Documentation v2.4', type: 'url', wordCount: null, tokens: 'Indexing...', status: 'processing', date: 'Today' },
  { id: '3', title: 'Deep Dive: Tokenization Strategy', type: 'youtube', wordCount: '45:30', tokens: '8,200', status: 'ready', date: 'Oct 20' },
  { id: '4', title: 'system_prompts_v4.json', type: 'text', wordCount: null, tokens: '12k', status: 'ready', date: 'Oct 20' },
];

export default function ResearchLab() {
  const [sources, setSources] = useState(INITIAL_SOURCES);
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [researchMode, setResearchMode] = useState<'precise' | 'creative' | 'deep'>('deep');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSource = () => {
    setIsAdding(true);
    const newSource = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Technical Resource.pdf',
      type: 'document',
      wordCount: '0k',
      tokens: 'Processing...',
      status: 'processing',
      date: 'Just Now'
    };
    setSources([newSource, ...sources]);
    
    // Simulate indexing
    setTimeout(() => {
      setSources(prev => prev.map(s => s.id === newSource.id ? { ...s, status: 'ready', tokens: '4.2k' } : s));
      setIsAdding(false);
    }, 3000);
  };

  const filteredSources = sources.filter(s => {
    if (filter === 'All') return true;
    if (filter === 'Documents') return s.type === 'document';
    if (filter === 'URLs') return s.type === 'url';
    if (filter === 'YouTube') return s.type === 'youtube';
    if (filter === 'Text') return s.type === 'text';
    return true;
  });

  return (
    <div className="flex gap-8 h-[calc(100vh-160px)]">
      {/* Left Panel: Data Sources */}
      <section className="flex-[0.4] bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 tracking-tight">Technical Language Index</h2>
            <p className="text-xs text-slate-500 mt-1">Connected Data Sources (TLI)</p>
          </div>
          <button 
            onClick={handleAddSource}
            disabled={isAdding}
            className="flex items-center gap-2 bg-[#00A3FF] hover:bg-[#008DD9] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#00A3FF33] active:scale-95 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {isAdding ? 'Adding...' : 'Add Source'}
          </button>
        </div>

        {/* Tab Filters */}
        <div className="px-6 py-4 flex gap-2">
          {['All', 'Documents', 'URLs', 'YouTube', 'Text'].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all",
                filter === t 
                  ? "bg-slate-100 text-slate-900 shadow-sm" 
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Source List */}
        <div className="flex-1 overflow-auto px-4 pb-4 space-y-2">
          {filteredSources.map((source) => (
            <div 
              key={source.id} 
              className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-[#0089D966] hover:shadow-md transition-all group cursor-pointer"
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                source.type === 'document' ? "bg-red-50 text-red-500" :
                source.type === 'url' ? "bg-blue-50 text-blue-500" :
                source.type === 'youtube' ? "bg-red-50 text-red-600" :
                "bg-purple-50 text-purple-500"
              )}>
                {source.type === 'document' && <FileText className="w-5 h-5" />}
                {source.type === 'url' && <LinkIcon className="w-5 h-5" />}
                {source.type === 'youtube' && <Youtube className="w-5 h-5" />}
                {source.type === 'text' && <Type className="w-5 h-5" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold truncate text-slate-900">{source.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-tighter">
                    {source.date} • {source.tokens} tkns {source.wordCount ? `• ${source.wordCount}` : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {source.status === 'ready' ? (
                  <div className="px-2 py-0.5 rounded-md bg-green-50 text-green-600 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Ready
                  </div>
                ) : (
                  <div className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 animate-spin" />
                    In Sync
                  </div>
                )}
                <button className="text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 mt-auto border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Notebook: GRAMMAR-CORE-KB</span>
            <span>ID: 8c1a...94d</span>
          </div>
        </div>
      </section>

      {/* Right Panel: Research Chat */}
      <section className="flex-[0.6] bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm relative overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-slate-900 tracking-tight">Research Chat</h2>
            <div className="px-3 py-1 bg-slate-100 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-slate-200 transition-colors">
              <span className="text-xs font-bold text-slate-700">Gemini 3.1 Pro</span>
              <ChevronRight className="w-3 h-3 rotate-90 text-slate-400" />
            </div>
          </div>
          <button className="text-[11px] font-bold text-[#00A3FF] hover:underline uppercase tracking-widest">
            New Thread
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-auto p-6 space-y-8 scroll-smooth">
          {/* User Message */}
          <div className="flex flex-col items-end gap-2 max-w-[85%] ml-auto">
            <div className="bg-[#00A3FF] text-white p-4 rounded-2xl rounded-tr-none shadow-lg shadow-[#00A3FF22]">
              <p className="text-sm font-medium leading-relaxed">
                Based on the GRAMMAR Architecture Guide, how does the system handle tokenization for the Technical Language Index (TLI)? Provide a code example if available.
              </p>
            </div>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mr-2">14:45</span>
          </div>

          {/* AI Response */}
          <div className="flex flex-col items-start gap-3 max-w-[90%] group">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded bg-[#00A3FF20] flex items-center justify-center text-[#00A3FF]">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#00A3FF] uppercase tracking-wider">Research Insight</span>
            </div>
            
            <div className="bg-white border border-slate-100 p-6 rounded-2xl rounded-tl-none shadow-sm space-y-4">
              <div className="text-sm text-slate-700 leading-relaxed space-y-4">
                <p>
                  According to the GRAMMAR Architecture Guide [1], the Technical Language Index (TLI) utilizes a custom subword tokenization strategy optimized for code and technical documentation.
                </p>
                <p>
                  Unlike standard BPE, the TLI tokenizer preserves semantic boundaries of technical terms (like API endpoints or specific class names) before applying subword splitting. This ensures that domain-specific terminology isn't fragmented during retrieval [2].
                </p>
                
                <div className="bg-slate-900 rounded-xl p-4 overflow-hidden shadow-inner">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">tli_tokenizer.py</span>
                    <button className="text-[10px] text-slate-500 hover:text-white transition-colors">COPY</button>
                  </div>
                  <pre className="text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`def tokenize_tli_document(text: str, 
                         preserve_entities: bool = True) -> List[int]:
    """Custom tokenization for technical docs."""
    if preserve_entities:
        text = _extract_and_mask_domain_terms(text)
    
    base_tokens = bpe_model.encode(text)
    return _reconstruct_semantic_boundaries(base_tokens)`}
                  </pre>
                </div>
              </div>

              {/* Citations Footer */}
              <div className="pt-4 border-t border-slate-50 mt-4 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sources Referenced</p>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-700 rounded text-[10px] font-medium border border-red-100">
                    <span className="bg-red-500 text-white w-3 h-3 flex items-center justify-center rounded-full text-[8px]">1</span>
                    GRAMMAR Architecture Guide, p. 14
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-medium border border-blue-100">
                    <span className="bg-blue-500 text-white w-3 h-3 flex items-center justify-center rounded-full text-[8px]">2</span>
                    Tokenization Specs v2, p. 08
                  </div>
                </div>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest ml-10">14:46 • GEMINI 3.1 PRO</span>
          </div>
        </div>

        {/* Input Controls */}
        <div className="p-6 border-t border-slate-100 bg-white shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] z-10">
          <div className="flex gap-2 mb-4 justify-center">
            {['Precise', 'Creative', 'Deep Research'].map((mode) => (
              <button
                key={mode}
                onClick={() => setResearchMode(mode.toLowerCase().replace(' ', '') as any)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border",
                  researchMode === mode.toLowerCase().replace(' ', '')
                    ? "bg-[#00A3FF] text-white border-[#00A3FF] shadow-lg shadow-[#00A3FF33]"
                    : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                )}
              >
                {mode}
              </button>
            ))}
          </div>
          
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center text-slate-400 group-focus-within:text-[#00A3FF] transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <input 
              type="text"
              placeholder="Ask about your sources..."
              className="w-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-[#008DD9] focus:ring-4 focus:ring-[#00A3FF0A] rounded-2xl py-4 pl-12 pr-28 text-sm outline-none transition-all placeholder:text-slate-400"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="absolute right-2 inset-y-2 flex items-center gap-1">
              <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
              <button className="bg-[#00A3FF] hover:bg-[#008DD9] text-white p-2 px-4 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest h-full mb-[1px]">SEND</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <p className="text-[9px] text-center text-slate-400 mt-3 font-mono">
            AI responses may be inaccurate. Verify important information against sources.
          </p>
        </div>
      </section>
    </div>
  );
}
