"use client";

import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  Settings2,
  AlertTriangle,
  FileCheck
} from 'lucide-react';

export default function PoliciesPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Governance & Policies</h1>
          <p className="text-sm text-slate-500 mt-1">MIM controlled runtime constraints</p>
        </div>
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
          <button className="px-4 py-2 bg-white rounded-lg text-xs font-bold text-slate-900 shadow-sm transition-all uppercase tracking-widest">Active</button>
          <button className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-700 transition-all uppercase tracking-widest">Drafts</button>
          <button className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-700 transition-all uppercase tracking-widest">History</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {[
          { 
            name: 'Privacy Shield v4', 
            desc: 'Prevents data leakage of PII into public LLM training sets. Mandatory for all agents.', 
            type: 'Security', 
            status: 'Enforced',
            icon: ShieldCheck, 
            color: 'text-green-600',
            bg: 'bg-green-50'
          },
          { 
            name: 'Budgetary Quota - Q3', 
            desc: 'Hard cap on daily API spending across all provider tiers. Current usage: 42%', 
            type: 'Cost Management', 
            status: 'Monitoring',
            icon: Lock, 
            color: 'text-blue-600',
            bg: 'bg-blue-50'
          },
          { 
            name: 'Audit Transparency Policy', 
            desc: 'Every agent decision must be traceable with evidentiary proof stored in Technical Language Index.', 
            type: 'Compliance', 
            status: 'Enforced',
            icon: Eye, 
            color: 'text-purple-600',
            bg: 'bg-purple-50'
          },
          { 
            name: 'Agent Interaction Protocol', 
            desc: 'Rules determining how Boomer_Angs can communicate and share context. Prevents hallucination propagation.', 
            type: 'Runtime', 
            status: 'Review Required',
            icon: Settings2, 
            color: 'text-amber-600',
            bg: 'bg-amber-50'
          },
        ].map((policy, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex items-center gap-8">
            <div className={policy.bg + " w-16 h-16 rounded-2xl flex items-center justify-center " + policy.color}>
              <policy.icon className="w-8 h-8" />
            </div>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-slate-900">{policy.name}</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{policy.type}</span>
              </div>
              <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">{policy.desc}</p>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                policy.status === 'Enforced' ? 'bg-green-50 text-green-600' : 
                policy.status === 'Monitoring' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {policy.status === 'Enforced' && <FileCheck className="w-3 h-3" />}
                {policy.status === 'Review Required' && <AlertTriangle className="w-3 h-3" />}
                {policy.status}
              </div>
              <button className="text-xs font-bold text-[#00A3FF] hover:underline uppercase tracking-widest pr-2">Edit Rules</button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 rounded-3xl p-12 flex flex-col items-center justify-center text-center gap-6 border-2 border-dashed border-slate-200">
        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center border border-slate-200 shadow-sm text-slate-300">
          <Settings2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="font-bold text-slate-800 text-lg">Define Custom Governance</h3>
          <p className="text-sm text-slate-500 max-w-md">Create complex rule sets using the NTNTN intent framework to govern agent behavior at runtime.</p>
        </div>
        <button className="bg-white border border-slate-200 hover:bg-[#00A3FF] hover:text-white hover:border-[#0089D9] px-6 py-3 rounded-2xl text-xs font-bold text-slate-600 shadow-sm transition-all active:scale-95 uppercase tracking-widest">
          New Policy Draft
        </button>
      </div>
    </div>
  );
}
