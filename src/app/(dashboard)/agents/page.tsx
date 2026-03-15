"use client";

import React from 'react';
import { 
  Search, 
  Cpu, 
  Zap
} from 'lucide-react';

const AGENTS = [
  { name: 'Picker_Ang', role: 'Router', status: 'Idle', provider: 'OpenRouter', health: 98, tasks: 452 },
  { name: 'NTNTN', role: 'Intent Framework', status: 'Running', provider: 'Gemini 3.5', health: 100, tasks: 1208 },
  { name: 'Boomer_Ang_01', role: 'Data Execution', status: 'Active', provider: 'Claude 3.5 Sonnet', health: 95, tasks: 84 },
  { name: 'MIM_Gov', role: 'Context Governance', status: 'Running', provider: 'Local Llama 3', health: 99, tasks: 124 },
  { name: 'BuildSmith', role: 'Assembler', status: 'Offline', provider: 'GitHub Actions', health: 100, tasks: 12 },
];

export default function AgentsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Active Fleet</h1>
          <p className="text-sm text-slate-500 mt-1">Autonomous agent lifecycle management</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter agents..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00A3FF33] transition-all"
            />
          </div>
          <button className="bg-[#00A3FF] hover:bg-[#0089D9] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-[#00A3FF33] transition-all active:scale-95">
            Initialize New Agent
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AGENTS.map((agent, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-[#00A3FF66] transition-all group flex flex-col gap-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#00A3FF] transition-colors">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{agent.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{agent.role}</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest ${
                agent.status === 'Running' || agent.status === 'Active' 
                  ? 'bg-green-50 text-green-600' 
                  : agent.status === 'Idle' ? 'bg-blue-50 text-blue-500' : 'bg-slate-100 text-slate-500'
              }`}>
                {agent.status}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Provider</span>
                <span className="font-semibold text-slate-900">{agent.provider}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Health Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${agent.health}%` }} />
                  </div>
                  <span className="font-mono text-[10px] font-bold">{agent.health}%</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider text-center">Tasks Handled</span>
                <span className="text-lg font-bold text-slate-900 text-center">{agent.tasks.toLocaleString()}</span>
              </div>
              <button className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-[10px] font-bold text-slate-600 tracking-widest transition-colors">
                <Zap className="w-3 h-3" />
                DETAILS
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
