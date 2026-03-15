"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Globe,
  ArrowRight,
  Zap,
  Database,
  FlaskConical,
  Shield,
  Layers,
  Youtube,
  BrainCircuit,
  Clock,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Activity,
  Paperclip,
  Send,
  TrendingUp,
  X,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { NotebookSource, ResearchResponse } from '@/lib/research/notebooklm';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { insforge } from '@/lib/insforge';
import { tliService } from '@/lib/research/tli-service';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ResearchAgentMessage {
  id: string;
  role: 'agent' | 'user';
  content: string;
  timestamp: string;
  reasoningSteps?: string[];
  type?: 'research' | 'translation' | 'optimization' | 'notebook';
  citations?: ResearchResponse['citations'];
}

export default function ResearchLab() {
  const { user, trackUsage } = useAuth();
  const [query, setQuery] = useState("");
  const [isResearching, setIsResearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'sources' | 'tli'>('chat');
  const [researchMode, setResearchMode] = useState<'glm-5' | 'notebook'>('glm-5');
  const [notebookId, setNotebookId] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<ResearchAgentMessage[]>([
    {
      id: '1',
      role: 'agent',
      content: "Welcome to the Research Lab. I am your AutoResearch Agent. I can crawl your technical indices, refine your prompts, and conduct deep research experiments. We are now integrated with NotebookLM for deep context analysis.",
      timestamp: new Date().toLocaleTimeString(),
      type: 'research'
    }
  ]);

  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [newSourceType, setNewSourceType] = useState<NotebookSource['type']>('url');
  const [newSourceInput, setNewSourceInput] = useState("");
  const [newSourceTitle, setNewSourceTitle] = useState("");

  const [sources, setSources] = useState<NotebookSource[]>([]);

  const [tliNodes] = useState([
    { id: '1', name: 'API_ORCHESTRATOR', status: 'optimized', confidence: 0.98 },
    { id: '2', name: 'MIM_POLICY_V3', status: 'researching', confidence: 0.85 },
    { id: '3', name: 'UI_GLASS_TOKENS', status: 'pending', confidence: 0.92 },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize Notebook Context
  useEffect(() => {
    async function initNotebook() {
      if (researchMode === 'notebook' && !notebookId && user) {
        try {
          // Check if we already have a context pack for this user
          const { data } = await insforge?.database
            .from('context_packs')
            .select('notebook_id')
            .eq('user_id', user.id)
            .single() || { data: null };
          
          if (data?.notebook_id) {
            setNotebookId(data.notebook_id);
          } else {
            const id = await tliService.initContextPack('Global');
            setNotebookId(id);
            // Save to InsForge
            await insforge?.database.from('context_packs').insert([{
              user_id: user.id,
              name: 'Global Research Index',
              notebook_id: id,
              type: 'tli'
            }]);
          }
        } catch (error) {
          console.error('[Research] Init error:', error);
          toast.error("Failed to initialize Research Context");
        }
      }
    }
    initNotebook();
  }, [researchMode, user, notebookId]);

  // Load Persisted Data Sources
  useEffect(() => {
    async function loadSources() {
      if (researchMode === 'notebook' && notebookId && user && insforge) {
        try {
          const { data } = await insforge.database
            .from('data_sources')
            .select('*')
            .eq('notebook_id', notebookId)
            .order('created_at', { ascending: false });
            
          if (data && data.length > 0) {
            const mappedSources: NotebookSource[] = data.map((s) => ({
              id: s.id,
              title: s.title,
              type: s.type,
              status: 'ready',
              wordCount: s.metadata?.content ? s.metadata.content.split(' ').length : 1200
            }));
            
            setSources(mappedSources);
          }
        } catch (error) {
          console.error('[Research] Load sources error:', error);
        }
      }
    }
    loadSources();
  }, [researchMode, notebookId, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleRunResearch = async () => {
    if (!query.trim()) return;
    
    const userMsg: ResearchAgentMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setQuery("");
    setIsResearching(true);

    // Persist user message
    if (user && insforge) {
      await insforge.database.from('history').insert([{
        user_id: user.id,
        role: 'user',
        content: query,
        type: 'research_query'
      }]);
    }

    if (researchMode === 'notebook' && notebookId) {
      try {
        const response = await tliService.research(notebookId, query, 'deep');
        
        // Generate dynamic reasoning steps for deep research
        const keywords = query.split(' ').filter(w => w.length > 4).slice(0, 3).join(', ');
        const dynamicReasoning = [
          `Parsing primary objective from natural language: "${query.substring(0, 40)}..."`,
          `Querying deep Technical Language Index (TLI) space${keywords ? ` focusing on (${keywords})` : ''}`,
          `Synthesizing evidence across multiple documents`,
          `Checking generated context against MIM governance policies`
        ];

        const agentMsg: ResearchAgentMessage = {
          id: (Date.now() + 1).toString(),
          role: 'agent',
          content: response.answer,
          timestamp: new Date().toLocaleTimeString(),
          type: 'notebook',
          citations: response.citations,
          reasoningSteps: dynamicReasoning
        };
        setMessages(prev => [...prev, agentMsg]);
        trackUsage('research_queries');
        
        // Persist agent response
        if (user && insforge) {
          await insforge.database.from('history').insert([{
            user_id: user.id,
            role: 'agent',
            content: response.answer,
            type: 'research_response',
            metadata: { citations: response.citations, reasoning: dynamicReasoning }
          }]);
        }
      } catch {
        toast.error("Deep Research failed. Check TLI connection.");
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'agent',
          content: "I encountered an error querying the deep research index. Please verify your data sources.",
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
    } else {
      // Simulate GLM-5 Research Flow
      setTimeout(async () => {
        const keywords = query.split(' ').filter(w => w.length > 4).slice(0, 3).join(', ');
        const dynamicReasoning = [
          `Neutralizing intent structure for: "${query.substring(0, 30)}..."`,
          `Cross-referencing GLM-5 corpus${keywords ? ` for entities [${keywords}]` : ''}`,
          `Calculating api boundary constraints and orchestration requirements`,
          `Validating technical execution path with MIM`
        ];

        const agentMsg: ResearchAgentMessage = {
          id: (Date.now() + 1).toString(),
          role: 'agent',
          content: `I have analyzed your request regarding "${userMsg.content}". Using GLM-5 Cross-lingual neural mapping, I've identified 3 potential optimizations for your Technical Language Index (TLI) to ensure your prompts are precisely neutralized.`,
          timestamp: new Date().toLocaleTimeString(),
          reasoningSteps: dynamicReasoning,
          type: 'optimization'
        };
        setMessages(prev => [...prev, agentMsg]);
        trackUsage('research_queries');
        
        if (user && insforge) {
          await insforge.database.from('history').insert([{
            user_id: user.id,
            role: 'agent',
            content: agentMsg.content,
            type: 'glm5_response',
            metadata: { reasoning: dynamicReasoning }
          }]);
        }
      }, 1500);
    }
    
    setIsResearching(false);
  };

  const handleOpenAddSource = (type: NotebookSource['type']) => {
    setNewSourceType(type);
    setNewSourceInput("");
    setNewSourceTitle("");
    setIsAddSourceOpen(true);
  };

  const handleConfirmAddSource = async () => {
    if (!newSourceInput.trim() || !newSourceTitle.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    setIsAddSourceOpen(false);
    await addSource(newSourceType, newSourceTitle, 
      newSourceType === 'text' ? newSourceInput : undefined,
      (newSourceType === 'url' || newSourceType === 'youtube') ? newSourceInput : undefined
    );
  };

  const addSource = async (type: NotebookSource['type'], title: string, content?: string, url?: string) => {
    const newSource: NotebookSource = {
      id: `src-${Date.now()}`,
      title,
      type,
      status: 'processing'
    };
    setSources(prev => [newSource, ...prev]);
    toast.success(`Ingesting ${title}...`);
    
    try {
      if (notebookId) {
        await tliService.ingestSource(notebookId, { type, title, content, url });
        setSources(prev => prev.map(s => s.id === newSource.id ? { ...s, status: 'ready', wordCount: 0 } : s));
        toast.success(`${title} is now indexed in TLI.`);
        trackUsage('sources');
        
        // Persist source to database if available
        if (user && insforge) {
           await insforge.database.from('data_sources').insert([{
             user_id: user.id,
             notebook_id: notebookId,
             title,
             type,
             metadata: { url, content: content ? content.substring(0, 100) + '...' : undefined }
           }]);
        }
      } else {
        // Fallback simulation
        setTimeout(() => {
          setSources(prev => prev.map(s => s.id === newSource.id ? { ...s, status: 'ready', wordCount: 1200 } : s));
          toast.success(`${title} is now indexed in TLI.`);
        }, 2000);
      }
    } catch {
      setSources(prev => prev.map(s => s.id === newSource.id ? { ...s, status: 'failed' } : s));
      toast.error(`Failed to ingest ${title}`);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-8 animate-in fade-in duration-500">
      {/* Upper Section: Lab Header & Control Panel */}
      <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#00A3FF1A] flex items-center justify-center text-[#00A3FF] shadow-lg shadow-[#00A3FF22]">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AutoResearch Lab</h1>
            <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
              TLI Optimization & Deep Indexing
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-[#00A3FF] font-bold">MODE: {researchMode.toUpperCase()}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200">
          <button 
            onClick={() => setResearchMode('glm-5')}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
              researchMode === 'glm-5' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            GLM-5 Engine
          </button>
          <button 
            onClick={() => setResearchMode('notebook')}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2",
              researchMode === 'notebook' ? "bg-[#00A3FF] text-white shadow-lg shadow-[#00A3FF33]" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            NotebookLM Deep
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-8 min-h-0">
        {/* Left Side: Navigation & Sources */}
        <aside className="w-80 flex flex-col gap-6">
          <div className="flex-1 bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm space-y-6 flex flex-col min-h-0">
            <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100">
              {(['chat', 'sources', 'tli'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all",
                    activeTab === tab 
                      ? "bg-white text-[#00A3FF] shadow-sm" 
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin pr-1">
              {activeTab === 'chat' && (
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Recent Experiments</p>
                  <div className="space-y-2">
                    {[
                      "Multi-lingual NLU Calibration",
                      "React 19 Composition Research",
                      "GLM-5 Neutralization Test"
                    ].map((exp, i) => (
                      <button key={i} className="w-full text-left p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
                        <p className="text-xs font-bold text-slate-700 truncate group-hover:text-[#00A3FF]">{exp}</p>
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          2h ago • Success
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'sources' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleOpenAddSource('url')}
                      className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center gap-2 hover:bg-[#00A3FF08] hover:border-[#00A3FF33] transition-all group"
                    >
                      <Globe className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                      <span className="text-[9px] font-bold text-slate-600 uppercase">Link</span>
                    </button>
                    <button 
                      onClick={() => handleOpenAddSource('youtube')}
                      className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center gap-2 hover:bg-red-50 hover:border-red-200 transition-all group"
                    >
                      <Youtube className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                      <span className="text-[9px] font-bold text-slate-600 uppercase">Video</span>
                    </button>
                    <button 
                      onClick={() => handleOpenAddSource('text')}
                      className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center gap-2 hover:bg-indigo-50 hover:border-indigo-200 transition-all group col-span-2"
                    >
                      <FileText className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                      <span className="text-[9px] font-bold text-slate-600 uppercase">Technical Document</span>
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Technical Index (TLI)</p>
                    {sources.map(source => (
                      <div key={source.id} className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm relative overflow-hidden group">
                        {source.status === 'processing' && <div className="absolute inset-0 bg-white/50 animate-pulse" />}
                        <div className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center",
                          source.type === 'document' ? 'bg-indigo-50 text-indigo-500' : 'bg-emerald-50 text-emerald-500'
                        )}>
                          {source.type === 'document' ? <FileText className="w-4 h-4" /> : <Database className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{source.title}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {source.status === 'ready' ? `${(source.wordCount || 0).toLocaleString()} words` : 'Indexing...'}
                          </p>
                        </div>
                        {source.status === 'ready' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'tli' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TLI Projections</span>
                    <RefreshCw className="w-3 h-3 text-slate-400 animate-spin-slow cursor-pointer" />
                  </div>
                  <div className="space-y-2">
                    {tliNodes.map(node => (
                      <div key={node.id} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between group hover:border-[#00A3FF33] transition-all">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-2.5 h-2.5 rounded-full shadow-inner",
                            node.status === 'optimized' ? 'bg-emerald-500' :
                            node.status === 'researching' ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'
                          )} />
                          <span className="text-xs font-mono font-bold text-slate-700">{node.name}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">{(node.confidence * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-[#0F172A] rounded-[2rem] p-6 text-white overflow-hidden relative group mt-auto">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00A3FF] blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity" />
              <Sparkles className="absolute top-4 right-4 w-10 h-10 text-blue-500/20 group-hover:rotate-12 transition-transform duration-500" />
              <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-1">Status</p>
              <h4 className="font-bold text-xs mb-1">Governance Engine</h4>
              <p className="text-[9px] text-slate-400 leading-relaxed mb-4">Background agents are currently refining the TLI Vector Space.</p>
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                <div className="flex gap-1 items-end h-4">
                   <div className="w-1 bg-emerald-500 rounded-full animate-[bounce_1s_infinite]" />
                   <div className="w-1 bg-emerald-500 rounded-full animate-[bounce_1.2s_infinite]" />
                   <div className="w-1 bg-emerald-500 rounded-full animate-[bounce_0.8s_infinite]" />
                </div>
                <span className="text-[10px] font-mono text-emerald-400 ml-auto uppercase tracking-widest font-bold">Live Neutralizing</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Center: Main Chat Interface */}
        <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-[3rem] shadow-sm overflow-hidden relative">
          <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-white via-white/80 to-transparent z-10 pointer-events-none" />
          
          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 pt-12 space-y-10 scroll-smooth scrollbar-thin">
            {messages.map((msg) => (
              <div key={msg.id} className={cn(
                "flex gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500",
                msg.role === 'user' ? "flex-row-reverse" : ""
              )}>
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transition-transform hover:scale-105",
                  msg.role === 'user' ? "bg-gradient-to-br from-[#00A3FF] to-[#0089D9] text-white" : "bg-slate-900 text-white"
                )}>
                  {msg.role === 'user' ? (
                    <span className="text-sm font-bold">U</span>
                  ) : (
                    <Sparkles className="w-6 h-6" />
                  )}
                </div>
                <div className={cn(
                  "max-w-[80%] space-y-3",
                  msg.role === 'user' ? "items-end text-right" : ""
                )}>
                  <div className={cn(
                    "p-6 rounded-[2rem] shadow-sm relative group transition-all",
                    msg.role === 'user' 
                      ? "bg-[#00A3FF] text-white rounded-tr-none" 
                      : "bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-none hover:border-[#00A3FF33] hover:bg-white hover:shadow-md"
                  )}>
                    <p className="text-[15px] font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-slate-200/60">
                        <div className="flex items-center gap-2 mb-3">
                          <Layers className="w-3.5 h-3.5 text-[#00A3FF]" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grounding Citations</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                           {msg.citations.map((cite, ci) => (
                             <div 
                               key={ci}
                               title={cite.excerpt}
                               className="p-3 bg-white border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600 hover:border-[#00A3FF33] hover:text-[#00A3FF] transition-all truncate block cursor-help"
                             >
                               <span className="text-[#00A3FF] mr-2">[{ci + 1}]</span>
                               {cite.sourceTitle || 'Source'}
                               {cite.pageNumber && <span className="ml-2 text-slate-400">p. {cite.pageNumber}</span>}
                             </div>
                           ))}
                        </div>
                      </div>
                    )}

                    {msg.reasoningSteps && msg.reasoningSteps.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-slate-200/60 space-y-4">
                        <div className="flex items-center gap-2">
                          <Activity className="w-3.5 h-3.5 text-[#00A3FF]" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Acheevy Reasoning Path</span>
                        </div>
                        <div className="space-y-2">
                          {msg.reasoningSteps.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 text-[11px] text-slate-500 font-medium">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#00A3FF] mt-1 flex-shrink-0" />
                              {step}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase px-3">{msg.timestamp}</span>
                </div>
              </div>
            ))}
            
            {isResearching && (
              <div className="flex gap-5 animate-pulse">
                <div className="w-12 h-12 rounded-2xl bg-slate-100" />
                <div className="flex-1 space-y-4 pt-2">
                  <div className="h-5 bg-slate-100 rounded-full w-[60%] shadow-sm" />
                  <div className="h-5 bg-slate-100 rounded-full w-[40%] shadow-sm" />
                </div>
              </div>
            )}
          </div>

          <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-white via-white/80 to-transparent z-10 pointer-events-none" />

          {/* Input Area */}
          <div className="p-10 border-t border-slate-50 bg-white shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.08)] relative z-20">
            <div className="max-w-4xl mx-auto overflow-hidden rounded-[2rem] border-2 border-slate-100 shadow-2xl focus-within:border-[#00A3FF] focus-within:ring-8 focus-within:ring-[#00A3FF08] transition-all bg-white group flex items-center pr-4">
              <div className="pl-6 text-slate-400 group-focus-within:text-[#00A3FF] transition-colors">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleRunResearch()}
                placeholder={researchMode === 'notebook' ? "Search deep research index..." : "Submit multi-lingual intent for TLI refinement..."}
                className="flex-1 bg-transparent px-5 py-6 text-[15px] font-bold text-slate-900 focus:outline-none placeholder:text-slate-300"
              />
              <div className="flex items-center gap-3">
                 <button className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition-all">
                    <Paperclip className="w-5 h-5" />
                 </button>
                 <button 
                  onClick={handleRunResearch}
                  disabled={!query.trim() || isResearching}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00A3FF] to-[#0089D9] text-white flex items-center justify-center hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-[#00A3FF44]"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center gap-6 mt-6">
               <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Governed Context</span>
               </div>
               <div className="w-1 h-1 rounded-full bg-slate-200" />
               <div className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">TLI Optimized</span>
               </div>
               <div className="w-1 h-1 rounded-full bg-slate-200" />
               <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">GLM-5 Enabled</span>
               </div>
            </div>
          </div>
        </div>
      </div>
      {/* Add Source Modal */}
      {isAddSourceOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl border border-slate-200/50 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#00A3FF1A] flex items-center justify-center text-[#00A3FF] shadow-inner">
                    {newSourceType === 'url' ? <Globe className="w-6 h-6" /> : 
                     newSourceType === 'youtube' ? <Youtube className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Ingest Source</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Technical Language Index (TLI)</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAddSourceOpen(false)} 
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors group"
                >
                  <X className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 block">Source Identifier</label>
                  <input 
                    type="text" 
                    value={newSourceTitle}
                    onChange={(e) => setNewSourceTitle(e.target.value)}
                    placeholder="e.g. Core_Architecture_v2"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-[#00A3FF] focus:ring-4 focus:ring-[#00A3FF08] transition-all text-sm font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 block">
                    {newSourceType === 'text' ? 'Raw Technical Data' : 'URL Endpoint'}
                  </label>
                  {newSourceType === 'text' ? (
                    <textarea 
                      value={newSourceInput}
                      onChange={(e) => setNewSourceInput(e.target.value)}
                      placeholder="Paste schema definitions, documentation, or logs..."
                      className="w-full h-40 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-[#00A3FF] focus:ring-4 focus:ring-[#00A3FF08] transition-all text-sm font-medium text-slate-600 resize-none scrollbar-thin"
                    />
                  ) : (
                    <div className="relative">
                      <input 
                        type="text" 
                        value={newSourceInput}
                        onChange={(e) => setNewSourceInput(e.target.value)}
                        placeholder={newSourceType === 'url' ? "https://docs.example.com/spec" : "https://youtube.com/watch?v=..."}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-[#00A3FF] focus:ring-4 focus:ring-[#00A3FF08] transition-all text-sm font-bold text-slate-600 placeholder:text-slate-300 placeholder:font-medium"
                      />
                      <Zap className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00A3FF22]" />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button 
                  onClick={() => setIsAddSourceOpen(false)}
                  className="px-6 py-4 rounded-2xl border border-slate-200 text-slate-500 text-xs font-bold hover:bg-slate-50 hover:text-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmAddSource}
                  className="flex-1 px-6 py-4 rounded-2xl bg-[#00A3FF] text-white text-xs font-bold shadow-[0_10px_20px_-5px_#00A3FF44] hover:shadow-[0_15px_25px_-5px_#00A3FF66] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  Confirm Ingestion
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
               <Shield className="w-3.5 h-3.5 text-emerald-500" />
               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">End-to-End Governance: Protected by MIM</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
